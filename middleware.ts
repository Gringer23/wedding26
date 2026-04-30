import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_auth';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminPage = pathname.startsWith('/admin');
    const isAdminLoginPage = pathname === '/admin/login';
    const isAdminApi = pathname.startsWith('/api/admin');

    if (!isAdminPage || isAdminLoginPage || isAdminApi) {
        return NextResponse.next();
    }

    const isAuthorized = request.cookies.get(ADMIN_COOKIE_NAME)?.value === 'true';

    if (!isAuthorized) {
        const loginUrl = new URL('/admin/login', request.url);

        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};