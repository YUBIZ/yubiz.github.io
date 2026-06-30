import type { Metadata } from 'next';
import React from 'react';
import PostDetailView from '../../../components/PostDetailView';
import { getPosts, getPostById } from '../../../lib/postDb';
import { blogConfig } from '../../../config/blogConfig';
import { notFound } from 'next/navigation';

/// @brief 정적 생성을 위한 게시글 경로 매개변수를 생성합니다.
export async function generateStaticParams() {
  try {
    const posts = getPosts();
    return posts.map(post => ({ id: post.id }));
  } catch (e) {
    console.error('[PostDetailPage] 정적 매개변수 생성에 실패했습니다.', e);
    return [];
  }
}

/// @brief 게시글별 메타데이터를 생성합니다.
/// @note 각 게시글의 제목과 요약을 기반으로 고유한 title과 description을 설정합니다.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = getPostById(id);
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
  params: Promise<{ id: string }>;
}

/// @brief 게시글 상세 페이지입니다.
export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = getPostById(id);

  if (!post) {
    notFound();
  }

  return <PostDetailView post={post} />;
}