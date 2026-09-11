'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import { useBlog } from '../context/BlogContext';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import TableOfContents, { HeadingItem } from './TableOfContents';
import { Post } from '../types/blog';
import { blogConfig } from '../config/blogConfig';
import Ad from './Ad';

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code || []),
      ['className', /^(?:hljs(?:-[\w-]+)?|language-[\w-]+)$/],
    ],
  },
};

function getHeadings(InText: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const slugger = new GithubSlugger();
  const counters = [0, 0, 0, 0];
  const lines = InText.split(/\r?\n/);
  let inCodeBlock = false;

  lines.forEach(line => {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;

    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (!match) return;

    const text = match[2].replace(/[`*_]/g, '');
    const level = match[1].length;
    counters[level - 1] += 1;
    for (let index = level; index < counters.length; index += 1) counters[index] = 0;

    headings.push({
      id: slugger.slug(text),
      text,
      level,
      number: counters.slice(0, level).join('.'),
    });
  });

  return headings;
}

interface PostDetailViewProps {
  post: Post;
}

export default function PostDetailView({ post: InPost }: PostDetailViewProps) {
  const { setView, setSelectedCategory } = useBlog();
  const headings = useMemo(() => getHeadings(InPost.content), [InPost.content]);

  const markdownComponents = {
    h1: function MarkdownH1({ children, id }: { children?: React.ReactNode; id?: string }) {
      return <h2 id={id} className="mt-10 mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50 scroll-mt-20">{children}</h2>;
    },
    h2: function MarkdownH2({ children, id }: { children?: React.ReactNode; id?: string }) {
      return <h3 id={id} className="mt-10 mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50 scroll-mt-20">{children}</h3>;
    },
    h3: function MarkdownH3({ children, id }: { children?: React.ReactNode; id?: string }) {
      return <h4 id={id} className="mt-8 mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50 scroll-mt-20">{children}</h4>;
    },
    h4: function MarkdownH4({ children, id }: { children?: React.ReactNode; id?: string }) {
      return <h5 id={id} className="mt-8 mb-3 text-base font-bold text-zinc-900 dark:text-zinc-50 scroll-mt-20">{children}</h5>;
    },
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-6 leading-relaxed text-zinc-800 dark:text-zinc-200 text-[15px] sm:text-base font-serif break-keep">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-6 border-l-2 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">{children}</blockquote>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="my-4 space-y-1.5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-[15px] list-disc pl-5">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="my-4 space-y-1.5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-[15px] list-decimal pl-5">{children}</ol>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-6 overflow-x-auto"><table className="w-full border-collapse text-left text-sm">{children}</table></div>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="border-b border-zinc-300 px-3 py-2 font-semibold dark:border-zinc-700">{children}</th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="border-b border-zinc-200 px-3 py-2 align-top dark:border-zinc-800">{children}</td>
    ),
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="code-block my-6 overflow-x-auto">{children}</pre>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-zinc-900 underline dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">{children}</a>
    ),
    img: ({ src, alt }: { src?: string | Blob; alt?: string }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={typeof src === 'string' ? src : undefined} alt={alt || ''} className="my-6 rounded-md border border-zinc-200 dark:border-zinc-800" loading="lazy" />
    ),
  };

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

          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypeSlug, rehypeHighlight]} components={markdownComponents}>
            {InPost.content}
          </ReactMarkdown>

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
