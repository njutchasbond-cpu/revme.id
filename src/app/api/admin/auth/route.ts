import { NextRequest, NextResponse } from 'next/server';
import { getAdminSecret, verifyAdminAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const isAuth = verifyAdminAccess(req);
  return NextResponse.json({ authenticated: isAuth });
}

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    const secret = getAdminSecret();

    if (!key || key !== secret) {
      return NextResponse.json(
        { success: false, error: 'Kunci rahasia (ADMIN_SECRET_KEY) tidak sesuai.' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      message: 'Autentikasi admin berhasil.',
    });

    // Set cookie untuk kenyamanan navigasi
    res.cookies.set('admin_secret', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Format permintaan tidak valid.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Berhasil keluar.' });
  res.cookies.delete('admin_secret');
  return res;
}
