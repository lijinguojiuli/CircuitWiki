import type { MetadataRoute } from "next";
import { articles } from "@/lib/content";
import { learningPaths } from "@/lib/paths";
import { siteUrl } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/knowledge",
    "/curriculum",
    "/paths",
    "/graph",
    "/formulas",
    "/tools",
    ...learningPaths.map((path) => `/paths/${path.slug}`),
    ...articles.map((article) => `/learn/${article.slug}`),
  ].map((path) => ({ url: siteUrl + path }));
}
