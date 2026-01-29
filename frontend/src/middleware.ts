import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

    // 1. Check for token
    const token = request.cookies.get('accessToken')?.value;

    // 2. Define protected paths
    const protectedPaths = ['/dashboard', '/tickets', '/admin'];

    const isProtected = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    // 3. Redirect if protected & no token
    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url);
        // Optional: Add ?next=... to redirect back after login
        // loginUrl.searchParams.set('next', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Continue
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         * - register (register page)
         * - public (public assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|login|register|public).*)',
    ],
};
