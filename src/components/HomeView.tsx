'use client';

import React from 'react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types/blog';
import { blogConfig } from '../config/blogConfig';
import Ad from './Ad';

/// @brief 블로그 홈 화면 컴포넌트의 Props 인터페이스입니다.
interface HomeViewProps {
  posts: Post[];
}

/// @brief 블로그 홈 화면 컴포넌트입니다.
/// @note 최근 게시글 목록과 하단 광고를 표시합니다.
export default function HomeView({ posts }: HomeViewProps) {
  const { setView, setSelectedCategory, setSelectedTags } = useBlog();

  const recentPosts = posts.slice(0, 5);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16 animate-fade-in">
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6">
          {blogConfig.text.recentPosts}
        </h2>
        <div className="space-y-6">
          {recentPosts.map(post => (
            <article
              key={post.id}
              className="group cursor-pointer"
              onClick={() => { setSelectedCategory(blogConfig.text.allCategory); setSelectedTags([]); setView('post', post.id); }}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 mb-1.5 select-none">
                <span className="uppercase tracking-widest">{post.category}</span>
                <span>{post.createdAt}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-50 dark:group-hover:text-zinc-300 transition-colors leading-snug">
                {post.title}
              </h3>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-serif">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>

      <Ad slot={blogConfig.ads.slotHome} />
    </div>
  );
}