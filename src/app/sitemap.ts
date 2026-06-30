import type { MetadataRoute } from 'next';
import { getPosts } from '../lib/postDb';
import { blogConfig } from '../config/blogConfig';

export const dynamic = 'force-static';

/// @brief sitemap.xml을 생성합니다.
/// @note 홈, 게시글 목록, 모든 게시글 상세 페이지를 포함합니다.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${blogConfig.author.toLowerCase()}.github.io`;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/posts`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const postPages: MetadataRoute.Sitemap = getPosts().map(post => ({
    url: `${baseUrl}/post/${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages];
}