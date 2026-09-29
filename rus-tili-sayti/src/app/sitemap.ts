import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://rus-tili-sayti.vercel.app";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sozlar`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/grammatika`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/video`,
      lastModified: new Date(),
    },
  ];
}