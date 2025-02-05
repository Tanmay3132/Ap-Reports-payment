import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

const errorMiddleware = (error: HttpException, request: Request, response: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    logger.error(`[${request.method}] ${request.path} >> StatusCode:: ${status}, Message:: ${message}`);
    response.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
