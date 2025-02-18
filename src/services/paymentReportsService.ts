import { HttpException } from '@/exceptions/HttpException';
import { ICDMAPaymentReport, IPaymentReport, IRevenueServicePaymentReport } from '@/interfaces/paymentReports.interface';
import CDMAServicePaymentReportModel from '@/models/cdmaPaymentReport.model';
import revenueServicePaymentReportModel from '@/models/revenuePaymentReport.model';
import { logger } from '@/utils/logger';
import { DateTime } from 'luxon';
const Departments = {
  REVENUE: 'revenue',
  CDMA: 'cdma',
};

class PaymentReportsService {
  private revenueServicePaymentReports = revenueServicePaymentReportModel;
  private cdmaServicePaymentReports = CDMAServicePaymentReportModel;
  public async getPaymentReports({ department, serviceName, status, startTime, endTime, correlationId }): Promise<IPaymentReport[]> {
    switch (department.toLowerCase()) {
      case Departments.REVENUE: {
        return await this.getPaymentReportsForRevenueService({ serviceName, status, startTime, endTime, correlationId });
      }
      case Departments.CDMA: {
        return await this.getPaymentReportsForCDMAService({ serviceName, status, startTime, endTime, correlationId });
      }
      default: {
        throw new HttpException(403, `Invalid Department Name. ${department} doesn't exists`);
      }
    }
  }

  private async getPaymentReportsForRevenueService({ serviceName, status, startTime, endTime, correlationId }): Promise<IPaymentReport[]> {
    try {
      const query: Partial<IRevenueServicePaymentReport> = {};

      if (serviceName) {
        query.servicename = serviceName;
      }

      if (startTime || endTime) {
        const start = startTime ? new Date(startTime) : new Date(new Date().setDate(new Date().getHours() - 2));
        const end = endTime ? new Date(endTime) : new Date();

        if (start && end) {
          query.createdate = { $gte: DateTime.fromISO(start.toISOString()).toUTC(), $lte: DateTime.fromISO(end.toISOString()).toUTC() };
        } else if (start) {
          query.createdate = { $gte: DateTime.fromISO(start.toISOString()).toUTC() };
        } else if (end) {
          query.createdate = { $lte: DateTime.fromISO(end.toISOString()).toUTC() };
        }
      } else {
        const start = DateTime.now().minus({ hours: 2 }).toUTC();
        query.createdate = { $gte: start };
      }

      if (status) {
        query.payment_status = this.getActualPaymentStatusCodesForRevenueService(status);
      }

      logger.info(JSON.stringify({ query, correlationId }));

      const paymentReportsForRevenueService: IRevenueServicePaymentReport[] = await this.revenueServicePaymentReports.find(query).lean();

      const newPaymentReports: IPaymentReport[] = paymentReportsForRevenueService.map(singleReportDoc => {
        return {
          // _id: singleReportDoc._id,
          department: Departments.REVENUE,
          service: singleReportDoc.servicename,
          amount: String(singleReportDoc.amount),
          mobile: singleReportDoc.mobileno,
          status: this.getPaymentStatusFromPaymentStatusCodesForRevenueService(singleReportDoc.payment_status) as 'Success' | 'Failed' | 'Pending',
          type: 'UPI',
          orderId: singleReportDoc.orderid,
          referenceId: singleReportDoc.reference_id,
          transactionId: singleReportDoc.transactionid,
          departmentTransactionId: singleReportDoc.transactionid_payment,
          initiatedOn: this.getISTDate(singleReportDoc.createdate) as string,
          completedOn: this.getISTDate(singleReportDoc.updated_date),
        };
      });

      return newPaymentReports;
    } catch (error) {
      logger.error(
        JSON.stringify({
          function: 'getPaymentReportsForRevenueService',
          description: 'Error in getting reports for the Revenue Services',
          message: error.message,
        }),
      );
      throw error;
    }
  }

  private async getPaymentReportsForCDMAService({ serviceName, status, startTime, endTime, correlationId }): Promise<IPaymentReport[]> {
    try {
      const query: Partial<ICDMAPaymentReport> = {};

      if (serviceName) {
        query.heading_msg = serviceName;
      }
      if (startTime || endTime) {
        const start = startTime ? new Date(startTime) : null;
        const end = endTime ? new Date(endTime) : null;

        if (start && end) {
          query.created_date = { $gte: DateTime.fromISO(start.toISOString()).toUTC(), $lte: DateTime.fromISO(end.toISOString()).toUTC() };
        } else if (start) {
          query.created_date = { $gte: DateTime.fromISO(start.toISOString()).toUTC() };
        } else if (end) {
          query.created_date = { $lte: DateTime.fromISO(end.toISOString()).toUTC() };
        }
      } else {
        const start = DateTime.now().minus({ hours: 2 }).toUTC();
        query.created_date = { $gte: start };
      }

      if (status) {
        query.trans_status = this.getActualPaymentStatusCodesForCDMAService(status);
      }

      logger.info(JSON.stringify({ query, correlationId }));

      // const paymentReportsForCDMAService: ICDMAPaymentReport[] = await this.cdmaServicePaymentReports.find().lean();
      const paymentReportsForCDMAService: ICDMAPaymentReport[] = await this.cdmaServicePaymentReports.find(query).lean();

      const newPaymentReports: IPaymentReport[] = paymentReportsForCDMAService.map(singleReportDoc => {
        return {
          // _id: singleReportDoc._id,
          department: Departments.CDMA,
          // service: singleReportDoc.heading_msg,
          service: 'Know Your Dues',
          subService: this.getCDMASubService(singleReportDoc.service_code),
          status: this.getPaymentStatusFromPaymentStatusCodesForCDMAService(singleReportDoc.trans_status) as 'Success' | 'Failed',
          amount: String(singleReportDoc.amount),
          consumerId: String(singleReportDoc.consumerid),
          transactionId: String(singleReportDoc.tr_create_response.CFMS_TRID),
          departmentTransactionId: singleReportDoc.dept_transaction_id,
          mobile: singleReportDoc.mobileno,
          // orderId: singleReportDoc.orderid,
          // referenceId: singleReportDoc.reference_id,
          type: 'UPI',
          initiatedOn: this.getISTDate(singleReportDoc.created_date) as string,
          completedOn: this.getISTDate(singleReportDoc.updated_date),
        };
      });

      return newPaymentReports;
    } catch (error) {
      logger.error(
        JSON.stringify({
          function: 'getPaymentReportsForCDMAService',
          description: 'Error in getting reports for the CDMA Services',
          message: error.message,
        }),
      );
      throw error;
    }
  }

  private getActualPaymentStatusCodesForRevenueService(status: string): string {
    const statusMap: { [key: string]: string } = {
      success: '0300',
      failed: '0399',
      pending: '0002',
    };

    const statusCode: string = statusMap[status];

    if (!statusCode) {
      throw new Error('Invalid payment status');
    }

    return statusCode;
  }

  private getPaymentStatusFromPaymentStatusCodesForRevenueService(status: string): 'Success' | 'Failed' | 'Pending' {
    const statusMap = {
      '0300': 'Success',
      '0399': 'Failed',
      '0002': 'Pending',
    };

    const statusCode = statusMap[status];

    if (!statusCode) {
      return 'Failed';
    }

    return statusCode;
  }

  private getActualPaymentStatusCodesForCDMAService(status: string): string {
    const statusMap: { [key: string]: string } = {
      success: 'S',
      failed: 'F',
    };

    const statusCode: string = statusMap[status];

    if (!statusCode) {
      throw new Error('Invalid payment status for CDMA Services');
    }

    return statusCode;
  }

  private getCDMASubService(code: string): string {
    switch (code.toString().toLowerCase()) {
      case 'wt': {
        return 'Water Tax Dues';
      }

      case 'pt': {
        return 'Property Tax Dues';
      }

      case 'vlt': {
        return 'Vacant Land Dues';
      }

      case 'stax': {
        return 'Sewerage Dues';
      }

      case 'tl': {
        return 'Trade License Dues';
      }

      default: {
        return '';
      }
    }
  }

  private getPaymentStatusFromPaymentStatusCodesForCDMAService(status: string): string {
    const statusMap: { [key: string]: string } = {
      S: 'Success',
      F: 'Failed',
    };

    return statusMap[status];
  }

  private getISTDate(dateInISO) {
    // return dateInISO;

    const date = new Date(dateInISO);
    // date = DateTime.fromISO(date);
    // console.log(date);

    return DateTime.fromJSDate(date, { zone: 'utc' }).setZone('Asia/Kolkata').toFormat('yyyy-MM-dd HH:mm:ss');
    // return DateTime.fromISO(date).setZone('Asia/Kolkata').toFormat('dd-MM-yyyy HH:mm:ss');
  }
}

export default PaymentReportsService;
