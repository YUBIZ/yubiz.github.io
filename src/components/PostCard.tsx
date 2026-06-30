'use client';

import React from 'react';
import { Post } from '../types/blog';

/// @brief 게시글 카드 컴포넌트의 Props 인터페이스입니다.
interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

/// @brief 게시글 목록에서 개별 게시글을 렌더링하는 컴포넌트입니다.
export default function PostCard({ post: InPost, onClick: InOnClick }: PostCardProps) {
  return (
    <article className="py-6 border-b border-zinc-200 last:border-0 dark:border-zinc-800">
      <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 select-none mb-2">
        <span className="uppercase tracking-widest">{InPost.category}</span>
        <span>{InPost.createdAt}</span>
      </div>
      <h2
        onClick={InOnClick}
        className="text-xl font-bold tracking-tight text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300 cursor-pointer transition-colors leading-snug"
      >
        {InPost.title}
      </h2>
      <p
        onClick={InOnClick}
        className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed cursor-pointer font-serif"
      >
        {InPost.excerpt}
      </p>
      {InPost.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {InPost.tags.map(tag => (
            <span key={tag} className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">#{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
}