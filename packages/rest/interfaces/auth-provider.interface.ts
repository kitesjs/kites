import { NextFunction, Request, Response } from 'express';

export interface AuthProvider {
  getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Principal>;
}

export interface Principal {
  details: any;
  isAuthenticated: Promise<boolean>;
  // Allows content-based auth
  isResourceOwner(resourceId: any): Promise<boolean>;
  // Allows role-based auth
  hasRole(role: string): Promise<boolean>;
}
