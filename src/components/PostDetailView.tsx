'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { getHeadings } from '../lib/markdownToc';
import { Post } from '../types/blog';
import { blogConfig } from '../config/blogConfig';
import Ad from './Ad';
import ImageLightbox from './ImageLightbox';
import MarkdownContent from './MarkdownContent';
import Sidebar from './Sidebar';
import TableOfContents from './TableOfContents';

interface PostDetailViewProps {
  post: Post;
}

export default function PostDetailView({ post: InPost }: PostDetailViewProps) {
  const { setView, setSelectedCategory } = useBlog();
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const headings = useMemo(() => getHeadings(InPost.content), [InPost.content]);
  const handleImageClick = useCallback((src: string, alt: string) => setSelectedImage({ src, alt }), []);
  const closeImage = useCallback(() => setSelectedImage(null), []);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        <article className="flex-1 min-w-0 max-w-2xl">
          <button onClick={() => setView('posts')} className="mb-8 flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />
            {blogConfig.text.backToPosts}
          </button>

          <header className="mb-10 pb-8 border-b border-zinc-200 dark:border-zinc-800">
            <button onClick={() => { setSelectedCategory(InPost.category); setView('posts'); }} className="text-xs font-medium uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors cursor-pointer">
              {InPost.category}
            </button>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">{InPost.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
              <span>{InPost.createdAt}</span>
              {InPost.tags.length > 0 && <div className="flex flex-wrap gap-1.5">{InPost.tags.map(tag => <span key={tag}>#{tag}</span>)}</div>}
            </div>
          </header>

          <MarkdownContent content={InPost.content} onImageClick={handleImageClick} />

          {selectedImage && <ImageLightbox {...selectedImage} onClose={closeImage} />}

          <Ad slot={blogConfig.ads.slotPostDetail} />

          <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button onClick={() => setView('posts')} className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" />
              {blogConfig.text.backToPosts}
            </button>
          </div>
        </article>

        <Sidebar className="hidden lg:block">
          <TableOfContents headings={headings} onHeadingClick={(InId: string) => document.getElementById(InId)?.scrollIntoView({ behavior: 'smooth' })} />
        </Sidebar>
      </div>
    </div>
  );
}
