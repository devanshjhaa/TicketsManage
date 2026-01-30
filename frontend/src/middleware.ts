import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

    // 1. Check for token
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    // 2. Define path groups
    const authPaths = ['/login', '/register'];
    const protectedPaths = ['/dashboard'];

    // 3. Redirect if accessing auth pages while logged in
    if (token && authPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 4. Redirect if accessing protected pages while logged out
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 5. Continue
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
         * - public (public assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
