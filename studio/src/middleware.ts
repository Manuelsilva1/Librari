
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

// Based on Next.js i18n routing examples
// This middleware handles locale detection, redirection, and route protection.
export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const requestHeaders = new Headers(request.headers); // Used for setting x-pathname

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.includes('/api/') || // Exclude all API routes
    pathname.startsWith('/_next') // Exclude Next.js internal paths
  ) {
    return NextResponse.next();
  }
  
  requestHeaders.set('x-pathname', pathname); // Pass pathname for client-side use if needed

  const locales = ['en', 'es'];
  const defaultLocale = 'en';

  // --- Locale Detection (Part 1 - Determine currentLocale) ---
  let currentLocale = defaultLocale;
  let hasLocalePrefix = false;

  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      currentLocale = locale;
      hasLocalePrefix = true;
      break;
    }
  }
  
  // --- Authentication and Protected Routes ---
  const token = request.cookies.get('authToken')?.value;

  const isAdminLoginPage = pathname === `/${currentLocale}/admin`;
  const isAdminPanelRoute = pathname.startsWith(`/${currentLocale}/admin/panel`);

  // Handle admin panel access: if trying to access panel and not logged in, redirect to admin login page.
  if (isAdminPanelRoute && !token) {
    const adminLoginUrl = new URL(`/${currentLocale}/admin`, origin);
    return NextResponse.redirect(adminLoginUrl);
  }

  // Handle admin login page access: if logged in and trying to access login page, redirect to panel.
  if (isAdminLoginPage && token) {
    const adminPanelUrl = new URL(`/${currentLocale}/admin/panel`, origin);
    return NextResponse.redirect(adminPanelUrl);
  }

  // The following routes are no longer protected by this middleware forcing admin login.
  // Their internal logic will handle authentication requirements.
  // const otherProtectedPublicRoutes = [
  //   `/${currentLocale}/checkout`,
  //   `/${currentLocale}/cart`,
  //   `/${currentLocale}/sales/history`,
  // ];
  // if (otherProtectedPublicRoutes.some(route => pathname.startsWith(route)) && !token) {
  //   const loginUrl = new URL(`/${currentLocale}/admin`, origin); // Redirect to admin login
  //   return NextResponse.redirect(loginUrl);
  // }

  // --- Locale Redirection if missing (after auth check, as auth might redirect) ---
  if (!hasLocalePrefix) {
    // Try to get locale from Accept-Language header or use default
    const acceptLanguage = request.headers.get('accept-language');
    let preferredLocale = defaultLocale;

    if (acceptLanguage) {
      const languages = acceptLanguage.split(',').map((lang) => lang.split(';')[0].trim().toLowerCase());
      for (const lang of languages) {
        if (locales.includes(lang)) {
          preferredLocale = lang;
          break;
        }
        const langBase = lang.split('-')[0];
        if (locales.includes(langBase)) {
          preferredLocale = langBase;
          break;
        }
      }
    }
    
    const url = request.nextUrl.clone();
    // Ensure pathname doesn't start with preferredLocale if it was already processed (e.g. from a redirect)
    // Also handle the root path case.
    if (pathname === '/') {
      url.pathname = `/${preferredLocale}`;
    } else if (!url.pathname.startsWith(`/${preferredLocale}`)) {
         url.pathname = `/${preferredLocale}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
    }
    // Only redirect if the path actually changed to avoid loops on already prefixed paths
    if (url.pathname !== request.nextUrl.pathname) {
        return NextResponse.redirect(url);
    }
  }
  
  // If all checks pass (not static/API, auth valid or public route, locale present)
  return NextResponse.next({
    headers: requestHeaders, // Forward the modified headers
  });
}

export const config = {
  matcher: [
    // Match all routes except static files, API routes, and Next.js internals
    // This ensures the middleware runs on all page navigations.
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts|manifest.json|sw.js|workbox-.*.js).*)',
  ],
};
