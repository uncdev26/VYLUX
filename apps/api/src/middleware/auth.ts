import type { Request, Response, NextFunction } from 'express';

/**
 * Placeholder auth middleware.
 * Phase 2 will implement real JWT/session validation.
 * For now, sets a stub user so downstream code can rely on req.auth.
 */
export interface AuthPayload {
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Phase 2: validate bearer token / session cookie
  // For now, allow all requests through with a stub identity
  (req as any).auth = {
    userId: '00000000-0000-0000-0000-000000000000',
    role: 'admin',
  } satisfies AuthPayload;

  next();
}
