import { E0, EM100 } from '../constants';
import { logger } from './logger';

export default class HandleResponse {
  res: any;
  constructor(options: any) {
    if (options != null && options != undefined) {
      const keys: any = Object.keys(options);
      keys.forEach((key: string) => {
        this.res[key] = options[key];
      });
    }
    return this.res;
  }

  static success(res: any, code: number, status: boolean, message: string, data?: any) {
    if (code === 500) {
      this.serverError(res, message, data);
      return;
    }
    res.status(200).json({
      code: code,
      status: status,
      message: message || 'success',
      data: data,
    });
  }

  static serverError(res: any, message?: string, data?: any) {
    res.status(500).json({
      code: 500,
      status: E0,
      message: message || 'internal server error',
      error: data,
    });
  }
  static buildSuccessObj(code: number, message: string, data?: any): any {
    const res: any = {
      statusCode: code,
      status: true,
      message: message,
      data: data || {},
    };
    return res;
  }
  static buildErrObj(code?: any, message?: any, error?: any) {
    console.error('error===>' + error);
    logger.error(
      `Name:${error?.name} -> Message: ${error?.message} -> Json: ${JSON.stringify(
        error?.stack || error?.message || error,
      )}`,
    );
    // console.trace()
    code = code ?? 500;
    if (
      error?.name === 'SequelizeValidationError' ||
      error?.name === 'SequelizeUniqueConstraintError' ||
      error?.name === 'SequelizeForeignKeyConstraintError'
    ) {
      // Send the formatted error to the front end
      return {
        statusCode: code || 500,
        status: E0,
        message: error?.message || error?.errors[0]?.message || message || 'internal server error',
        error: error?.message || error,
      };
    } else {
      // For other types of errors, you can handle them accordingly
      return {
        code: code || 500,
        status: E0,
        message: error?.message || message || EM100,
        error: error?.message || error,
      };
    }
  }
}
