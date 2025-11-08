import { defineMiddleware } from 'astro:middleware';
import { getCurrentUser } from './lib/auth/utils';

export const onRequest = defineMiddleware(async (context, next) => {
  // Get current user and attach to locals
  const user = await getCurrentUser(context.cookies);
  context.locals.user = user;

  // Check if route requires authentication
  const protectedRoutes = ['/admin', '/settings', '/posts/new', '/posts/edit'];
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/verify-email'];

  const path = context.url.pathname;

  // Skip middleware for API routes (handled separately)
  if (path.startsWith('/api/')) {
    return next();
  }

  // Redirect authenticated users away from auth pages
  if (user && publicRoutes.some((route) => path.startsWith(route))) {
    return context.redirect('/');
  }

  // Protect admin routes
  if (path.startsWith('/admin')) {
    if (!user) {
      return context.redirect('/auth/login?redirect=' + encodeURIComponent(path));
    }

    if (user.role !== 'admin') {
      return context.redirect('/unauthorized');
    }
  }

  // Protect settings and author routes
  if (
    path.startsWith('/settings') ||
    path.startsWith('/posts/new') ||
    path.startsWith('/posts/edit')
  ) {
    if (!user) {
      return context.redirect('/auth/login?redirect=' + encodeURIComponent(path));
    }

    // Only authors and admins can create/edit posts
    if (
      (path.startsWith('/posts/new') || path.startsWith('/posts/edit')) &&
      user.role !== 'author' &&
      user.role !== 'admin'
    ) {
      return context.redirect('/unauthorized');
    }
  }

  return next();
});
