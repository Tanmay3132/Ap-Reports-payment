import { HttpException } from '@/exceptions/HttpException';
import { IPaymentReport } from '@/interfaces/paymentReports.interface';
import PaymentReportsService from '@/services/paymentReportsService';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

export class PaymentReportsController {
  private paymentReportsService = new PaymentReportsService();

  public getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const executionStartTime = Date.now();
      const correlationId = `${executionStartTime.toString(16)}T${executionStartTime}`;
      const department = req.query.department ? String(req.query.department) : null;
      const serviceName = req.query.service ? String(req.query.service) : null;
      const status = req.query.status ? String(req.query.status).toLowerCase() : null;
      const startTime = req.query.startTime ? String(req.query.startTime) : '';
      const endTime = req.query.endTime ? String(req.query.endTime) : '';

      if (!department || !['revenue', 'cdma'].includes(department.toLowerCase())) {
        throw new HttpException(402, 'Invalid department!. Please send the valid department');
      }

      if (status && !['success', 'failed', 'pending'].includes(status.toLowerCase())) {
        throw new HttpException(403, 'Invalid Status!. Please send the valid status.');
      }

      logger.info(
        JSON.stringify({
          correlationId,
          description: 'Incoming report request',
          method: 'GET',
          query: req.query,
        }),
      );

      // if (!this.validateDates(startTime, endTime)) {
      //   throw new HttpException(404, 'Invalid Date!. End time must be greater than the start time. and difference must be less than 2 days');
      // }

      const paymentReports: IPaymentReport[] = await this.paymentReportsService.getPaymentReports({
        department,
        serviceName,
        status,
        startTime,
        endTime,
        correlationId,
      });

      logger.info(
        JSON.stringify({
          correlationId,
          description: 'Report request resolved',
          documents: paymentReports.length,
          endTimeInMS: Date.now() - executionStartTime,
        }),
      );

      res.setHeader('x-request-id', correlationId);
      return res.status(200).json({ records: paymentReports, count: paymentReports.length, status: 'SUCCESS' });
    } catch (error) {
      next(error);
    }
  };

  public postReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const executionStartTime = Date.now();
      const correlationId = `${executionStartTime.toString(16)}T${executionStartTime}`;
      const department = req.body.department ? String(req.body.department) : null;
      const serviceName = req.body.service ? String(req.body.service) : null;
      const status = req.body.status ? String(req.body.status).toLowerCase() : null;
      const startTime = req.body.startTime ? String(req.body.startTime) : '';
      const endTime = req.body.endTime ? String(req.body.endTime) : '';

      if (!department || !['revenue', 'cdma'].includes(department.toLowerCase())) {
        throw new HttpException(402, 'Invalid department!. Please send the valid department');
      }

      if (status && !['success', 'failed', 'pending'].includes(status.toLowerCase())) {
        throw new HttpException(403, 'Invalid Status!. Please send the valid status.');
      }

      logger.info(
        JSON.stringify({
          correlationId,
          description: 'Incoming report request',
          method: 'GET',
          body: req.body,
        }),
      );

      // if (!this.validateDates(startTime, endTime)) {
      //   throw new HttpException(404, 'Invalid Date!. End time must be greater than the start time. and difference must be less than 2 days');
      // }

      const paymentReports: IPaymentReport[] = await this.paymentReportsService.getPaymentReports({
        department,
        serviceName,
        status,
        startTime,
        endTime,
        correlationId,
      });

      logger.info(
        JSON.stringify({
          correlationId,
          description: 'Report request resolved',
          documents: paymentReports.length,
          endTimeInMS: Date.now() - executionStartTime,
        }),
      );

      res.setHeader('x-request-id', correlationId);
      return res.status(200).json({ records: paymentReports, count: paymentReports.length, status: 'SUCCESS' });
    } catch (error) {
      next(error);
    }
  };

  private validateDates(startDate, endDate) {
    const start: any = new Date(startDate);
    const end: any = new Date(endDate);

    if (end <= start) {
      return false;
    }

    const diffInMilliseconds = end - start;

    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

    return diffInDays < 2;
  }
}
