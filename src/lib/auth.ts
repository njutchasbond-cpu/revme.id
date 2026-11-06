import { NextRequest } from 'next/server';

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET_KEY || 'admin123';
}

export function verifyAdminAccess(req: NextRequest): boolean {
  const secret = getAdminSecret();
  const headerKey = req.headers.get('x-admin-key');
  const cookieKey = req.cookies.get('admin_secret')?.value;

  if (headerKey && headerKey === secret) return true;
  if (cookieKey && cookieKey === secret) return true;
  return false;
}

