import { auth } from './config';
import type { AstroCookies } from 'astro';

/**
 * Get the current session from cookies
 */
export async function getSession(cookies: AstroCookies) {
  const sessionToken = cookies.get('better-auth.session_token')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get the current user from cookies
 */
export async function getCurrentUser(cookies: AstroCookies) {
  const session = await getSession(cookies);
  return session?.user ?? null;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(cookies: AstroCookies, redirectTo = '/auth/login') {
  const user = await getCurrentUser(cookies);

  if (!user) {
    return {
      authenticated: false,
      user: null,
      redirect: redirectTo,
    };
  }

  return {
    authenticated: true,
    user,
    redirect: null,
  };
}

/**
 * Require specific role
 */
export async function requireRole(
  cookies: AstroCookies,
  requiredRole: 'admin' | 'author' | 'user',
  redirectTo = '/unauthorized'
) {
  const authCheck = await requireAuth(cookies);

  if (!authCheck.authenticated) {
    return authCheck;
  }

  const user = authCheck.user;

  // Admin has access to everything
  if (user.role === 'admin') {
    return { authenticated: true, user, redirect: null };
  }

  // Author has access to author and user routes
  if (requiredRole === 'author' && user.role === 'author') {
    return { authenticated: true, user, redirect: null };
  }

  // Check exact role match
  if (user.role === requiredRole) {
    return { authenticated: true, user, redirect: null };
  }

  return {
    authenticated: false,
    user: null,
    redirect: redirectTo,
  };
}

/**
 * Check if user is admin
 */
export async function isAdmin(cookies: AstroCookies) {
  const user = await getCurrentUser(cookies);
  return user?.role === 'admin';
}

/**
 * Check if user is author or admin
 */
export async function isAuthor(cookies: AstroCookies) {
  const user = await getCurrentUser(cookies);
  return user?.role === 'author' || user?.role === 'admin';
}
