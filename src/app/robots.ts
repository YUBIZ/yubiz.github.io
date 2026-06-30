import type { MetadataRoute } from 'next';
import { blogConfig } from '../config/blogConfig';

export const dynamic = 'force-static';

/// @brief robots.txt를 생성합니다.
/// @note 모든 크롤러에 대해 전체 사이트 접근을 허용하고 sitemap 위치를 명시합니다.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = `https://${blogConfig.author.toLowerCase()}.github.io`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}