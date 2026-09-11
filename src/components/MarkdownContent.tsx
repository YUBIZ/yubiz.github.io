'use client';

import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import { Check, Copy } from 'lucide-react';

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

function getNodeText(InNode: React.ReactNode): string {
  return React.Children.toArray(InNode).map(node => {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (React.isValidElement(node)) {
      return getNodeText((node.props as { children?: React.ReactNode }).children);
    }
    return '';
  }).join('');
}

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = getNodeText(children);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative my-6">
      <pre className="code-block overflow-x-auto">{children}</pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="코드 복사"
        className="absolute right-2 top-2 rounded-md border border-zinc-200 bg-white/90 p-1.5 text-zinc-500 opacity-0 shadow-sm transition-opacity hover:text-zinc-900 group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

interface MarkdownContentProps {
  content: string;
  onImageClick: (src: string, alt: string) => void;
}

export default function MarkdownContent({ content, onImageClick }: MarkdownContentProps) {
  const components = useMemo(() => ({
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
    p: ({ children }: { children?: React.ReactNode }) => <p className="mb-6 leading-relaxed text-zinc-800 dark:text-zinc-200 text-[15px] sm:text-base break-keep">{children}</p>,
    blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote className="my-6 border-l-2 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">{children}</blockquote>,
    ul: ({ children }: { children?: React.ReactNode }) => <ul className="my-4 space-y-1.5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-[15px] list-disc pl-5">{children}</ul>,
    ol: ({ children }: { children?: React.ReactNode }) => <ol className="my-4 space-y-1.5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-[15px] list-decimal pl-5">{children}</ol>,
    table: ({ children }: { children?: React.ReactNode }) => <div className="my-6 overflow-x-auto"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
    th: ({ children }: { children?: React.ReactNode }) => <th className="border-b border-zinc-300 px-3 py-2 font-semibold dark:border-zinc-700">{children}</th>,
    td: ({ children }: { children?: React.ReactNode }) => <td className="border-b border-zinc-200 px-3 py-2 align-top dark:border-zinc-800">{children}</td>,
    pre: CodeBlock,
    code: function MarkdownCode({ className, children }: { className?: string; children?: React.ReactNode }) {
      if (className) return <code className={className}>{children}</code>;
      return <code className="inline-block rounded bg-zinc-100 px-1 py-0.5 text-[0.8125em] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{children}</code>;
    },
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-zinc-900 underline dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">{children}</a>,
    img: ({ src, alt }: { src?: string | Blob; alt?: string }) => {
      if (typeof src !== 'string') return null;
      return (
        <button type="button" onClick={() => onImageClick(src, alt || '')} className="my-6 block w-full cursor-zoom-in text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt || ''} className="rounded-md border border-zinc-200 dark:border-zinc-800" loading="lazy" />
        </button>
      );
    },
  }), [onImageClick]);

  return <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypeSlug, [rehypeHighlight, { detect: true }]]} components={components}>{content}</ReactMarkdown>;
}
