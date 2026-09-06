import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  /**
   * API Proxy Rewrites
   *
   * Proxies /api/** and /oauth2/** and /login/** from the Next.js dev server
   * (localhost:3000) to the Spring Boot backend (localhost:8080).
   *
   * Why this matters:
   *   - Same-origin requests avoid the SameSite cookie restriction entirely.
   *   - The session cookie set by Spring at port 8080 will be sent on every
   *     proxied request because Next.js acts as a transparent proxy.
   *   - The OAuth2 authorization redirect (/oauth2/authorization/google) still
   *     goes directly to the backend URL (not proxied) so Google redirects back
   *     to the correct backend callback URL.
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/oauth2/:path*",
        destination: `${BACKEND_URL}/oauth2/:path*`,
      },
      {
        source: "/login/:path*",
        destination: `${BACKEND_URL}/login/:path*`,
      },
      {
        source: "/logout",
        destination: `${BACKEND_URL}/logout`,
      },
    ];
  },
};

export default nextConfig;
