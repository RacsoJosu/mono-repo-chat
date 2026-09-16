export const rutasPublicasAutenticacion = new Set([
  "/api/auth/sign-in/email",
  "/api/auth/sign-out",
  "/api/auth/get-session",
  "/api/auth/change-password",
  "/api/auth/two-factor/enable",
  "/api/auth/two-factor/verify-totp",
  "/api/auth/two-factor/verify-backup-code",
]);
export const patronCookieIdentidad =
  /(?:^|;\s*)(?:__Secure-)?better-auth\.(?:session_token|two_factor)=/;
