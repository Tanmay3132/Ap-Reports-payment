import { PaymentReportsController } from '@/controllers/paymentReportsController.controller';
import { apiKeyAuthenticationMiddleware } from '@/middlewares/apiKeyAuth.middleware';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';

export class ReportsRoute implements Routes {
  public path = '/payment-reports';
  public router = Router();
  public paymentReports = new PaymentReportsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, apiKeyAuthenticationMiddleware, this.paymentReports.getReports);
  }
}
