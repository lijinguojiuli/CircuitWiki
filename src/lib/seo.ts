import type { Metadata } from "next";
export const siteUrl = "https://circuit-wiki.vercel.app";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  index = true,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: `${title} | CircuitWiki`,
      description,
      url: path,
      siteName: "CircuitWiki",
      locale: "zh_CN",
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "CircuitWiki — Learn circuits. Connect knowledge.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CircuitWiki`,
      description,
      images: ["/opengraph-image"],
    },
  };
}
