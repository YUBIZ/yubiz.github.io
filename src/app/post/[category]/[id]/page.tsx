import type { Metadata } from 'next';
import React from 'react';
import PostDetailView from '../../../../components/PostDetailView';
import { getPosts, getPostById } from '../../../../lib/postDb';
import { notFound } from 'next/navigation';

export const dynamicParams = false;

/// @brief 정적 생성을 위한 게시글 경로 매개변수를 생성합니다.
export function generateStaticParams() {
  return getPosts().map(post => {
    const [category, id] = post.id.split('/');
    return { category, id };
  });
}

/// @brief 게시글별 메타데이터를 생성합니다.
/// @note 각 게시글의 제목과 요약을 기반으로 고유한 title과 description을 설정합니다.
export async function generateMetadata({ params }: { params: Promise<{ category: string; id: string }> }): Promise<Metadata> {
  const { category, id } = await params;
  const post = getPostById(`${decodeURIComponent(category)}/${decodeURIComponent(id)}`);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.createdAt,
    },
  };
}

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

/// @brief 게시글 상세 페이지입니다.
export default async function PostDetailPage({ params }: PageProps) {
  const { category, id } = await params;
  const post = getPostById(`${decodeURIComponent(category)}/${decodeURIComponent(id)}`);

  if (!post) {
    notFound();
  }

  return <PostDetailView post={post} />;
}