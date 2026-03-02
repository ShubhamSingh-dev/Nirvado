/**
 * An Array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */

export const publicRoutes: string[] = ["/"];

/**
 * An Array of routes that are protected
 * These routes require authentication
 * @type {string[]}
 */

export const protectedRoutes: string[] = ["/"];

/**
 * An Array of routes that are accessible to the public
 * Routes that start with this (/api/auth) prefix do not require authentication
 * @type {string[]}
 */

export const authRoutes: string[] = [
  "/auth/sign-in", // Added leading slash
];

/**
 * An Array of routes that are accessible to the public
 * Routes that start with this (/api/auth) prefix do not require authentication
 * @type {string}
 */

export const apiAuthPrefix: string = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/dashboard"; // Redirect to dashboard after login

// /**
//  * An Array of public API routes that should bypass authentication
//  * These routes return JSON and must NOT be redirected to the sign-in page
//  * @type {string[]}
//  */
// export const publicApiRoutes = ["/api/chat", "/api/code-suggestion"];
