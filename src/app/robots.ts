import type { MetadataRoute } from "next";

// Canonical host — the apex domain 308-redirects to www.
const BASE_URL = "https://www.curipath.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
