import React from 'react';
import { blogConfig } from '../config/blogConfig';

/// @brief 목차 헤딩 항목 인터페이스입니다.
export interface HeadingItem {
  id: string;
  text: React.ReactNode;
  level: number;
}

/// @brief 목차 컴포넌트의 Props 인터페이스입니다.
interface TableOfContentsProps {
  headings: HeadingItem[];
  onHeadingClick: (InId: string) => void;
}

/// @brief 게시글 목차를 렌더링하는 컴포넌트입니다.
export default function TableOfContents({
  headings,
  onHeadingClick,
}: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav className="toc-no-scrollbar max-h-[70vh] overflow-y-auto border-l border-zinc-200 pl-3 dark:border-zinc-800">
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 select-none">
        {blogConfig.text.tocTitle}
      </h3>
      <div className="space-y-2">
        {headings.map(h => (
          <button
            key={h.id}
            onClick={() => onHeadingClick(h.id)}
            className={`block text-left text-xs transition-colors cursor-pointer w-full text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 ${
              h.level === 4 ? 'pl-3' : ''
            }`}
          >
            {h.text}
          </button>
        ))}
      </div>
    </nav>
  );
}