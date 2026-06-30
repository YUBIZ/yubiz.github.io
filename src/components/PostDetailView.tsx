'use client';

import React, { useMemo } from 'react';
import { useBlog } from '../context/BlogContext';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import TableOfContents, { HeadingItem } from './TableOfContents';
import { Post } from '../types/blog';
import { blogConfig } from '../config/blogConfig';
import Ad from './Ad';

/// @brief 파싱된 콘텐츠 블록의 타입을 나타냅니다.
interface ContentBlock {
  type: 'code' | 'paragraph' | 'heading3' | 'heading4' | 'blockquote' | 'list';
  content: string;
  language?: string;
}

// region MarkdownParser

function parseInlineMarkdown(InText: string): React.ReactNode {
  if (!InText) return '';
  const regex = /(\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = InText.split(regex);
  if (parts.length === 1) return InText;

  return parts.map((part, index) => {
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer"
            className="text-zinc-900 underline dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer">
            {match[1]}
          </a>
        );
      }
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-zinc-900 dark:text-zinc-50">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[13px] font-mono text-zinc-700 dark:text-zinc-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function parseMarkdownBlocks(InText: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = InText.split(/\r?\n/);

  let bInCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';
  let paragraphLines: string[] = [];

  const flush = () => {
    if (paragraphLines.length === 0) return;
    const content = paragraphLines.join('\n').trim();
    if (content) {
      if (content.startsWith('### ')) blocks.push({ type: 'heading3', content: content.replace('### ', '').trim() });
      else if (content.startsWith('#### ')) blocks.push({ type: 'heading4', content: content.replace('#### ', '').trim() });
      else if (content.startsWith('> ')) blocks.push({ type: 'blockquote', content: content.replace(/^>\s?/, '').trim() });
      else if (content.startsWith('- ') || content.startsWith('* ')) blocks.push({ type: 'list', content });
      else blocks.push({ type: 'paragraph', content });
    }
    paragraphLines = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (bInCodeBlock) {
        blocks.push({ type: 'code', content: codeContent.join('\n'), language: codeLanguage });
        codeContent = []; codeLanguage = ''; bInCodeBlock = false;
      } else {
        flush();
        bInCodeBlock = true;
        codeLanguage = line.trim().replace('```', '') || 'code';
      }
    } else if (bInCodeBlock) {
      codeContent.push(line);
    } else {
      const trimmed = line.trim();
      if (trimmed === '') {
        flush();
      } else if (trimmed.startsWith('### ') || trimmed.startsWith('#### ') || trimmed.startsWith('> ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flush();
        paragraphLines.push(line);
        flush();
      } else {
        paragraphLines.push(line);
      }
    }
  }
  flush();
  return blocks;
}

// endregion

/// @brief 게시글 상세 화면 컴포넌트의 Props 인터페이스입니다.
interface PostDetailViewProps {
  post: Post;
}

/// @brief 게시글 상세 화면을 렌더링하는 컴포넌트입니다.
/// @note 목차는 데스크톱에서 스크롤을 따라 고정됩니다(sticky).
export default function PostDetailView({ post: InPost }: PostDetailViewProps) {
  const { setView, setSelectedCategory } = useBlog();

  // region Parse

  const blocks = useMemo(() => parseMarkdownBlocks(InPost.content), [InPost.content]);

  const headings = useMemo(() => {
    const extracted: HeadingItem[] = [];
    blocks.forEach((block, index) => {
      if (block.type === 'heading3') {
        extracted.push({ id: `toc-heading-${index}`, text: parseInlineMarkdown(block.content), level: 3 });
      } else if (block.type === 'heading4') {
        extracted.push({ id: `toc-heading-${index}`, text: parseInlineMarkdown(block.content), level: 4 });
      }
    });
    return extracted;
  }, [blocks]);

  // endregion

  // region Render

  const renderedContent = blocks.map((block, index) => {
    const headingId = `toc-heading-${index}`;
    switch (block.type) {
      case 'heading3':
        return <h3 id={headingId} key={index} className="mt-10 mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50 scroll-mt-20">{parseInlineMarkdown(block.content)}</h3>;
      case 'heading4':
        return <h4 id={headingId} key={index} className="mt-8 mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50 scroll-mt-20">{parseInlineMarkdown(block.content)}</h4>;
      case 'blockquote':
        return <blockquote key={index} className="my-6 border-l-2 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">{parseInlineMarkdown(block.content)}</blockquote>;
      case 'list':
        return (
          <ul key={index} className="my-4 space-y-1.5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-[15px]">
            {block.content.split('\n').map((item, i) => (
              <li key={i} className="ml-5 list-disc">{parseInlineMarkdown(item.replace(/^[-*]\s+/, ''))}</li>
            ))}
          </ul>
        );
      case 'code':
        return (
          <div key={index} className="my-6 overflow-x-auto rounded-md border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs text-zinc-400 mb-2 font-mono uppercase select-none">{block.language || 'code'}</div>
            <pre className="font-mono text-[13px] text-zinc-800 dark:text-zinc-300 leading-relaxed"><code>{block.content}</code></pre>
          </div>
        );
      case 'paragraph':
      default:
        return <p key={index} className="mb-6 leading-relaxed text-zinc-800 dark:text-zinc-200 text-[15px] sm:text-base font-serif break-keep">{parseInlineMarkdown(block.content)}</p>;
    }
  });

  // endregion

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 본문 */}
        <article className="flex-1 min-w-0 max-w-2xl">
          <button
            onClick={() => setView('posts')}
            className="mb-8 flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {blogConfig.text.backToPosts}
          </button>

          <header className="mb-10 pb-8 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => { setSelectedCategory(InPost.category); setView('posts'); }}
              className="text-xs font-medium uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors cursor-pointer"
            >
              {InPost.category}
            </button>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
              {InPost.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
              <span>{InPost.createdAt}</span>
              {InPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {InPost.tags.map(tag => <span key={tag}>#{tag}</span>)}
                </div>
              )}
            </div>
          </header>

          <div>{renderedContent}</div>

          <Ad slot={blogConfig.ads.slotPostDetail} />

          <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setView('posts')}
              className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {blogConfig.text.backToPosts}
            </button>
          </div>
        </article>

        {/* 목차 (데스크톱에서 스크롤 따라 고정) */}
        <Sidebar className="hidden lg:block">
          <TableOfContents
            headings={headings}
            onHeadingClick={(InId: string) => {
              const el = document.getElementById(InId);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </Sidebar>
      </div>
    </div>
  );
}