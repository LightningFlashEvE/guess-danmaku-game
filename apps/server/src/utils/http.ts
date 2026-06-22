import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ApiResponse } from '../types.js';

export function ok<T>(res: Response, data: T, message?: string): void {
  const body: ApiResponse<T> = { success: true, data, message };
  res.json(body);
}

export function fail(res: Response, error: string, status = 400): void {
  const body: ApiResponse<never> = { success: false, error };
  res.status(status).json(body);
}

/**
 * 包裹 async 路由，自动捕获异常转交错误中间件。
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
