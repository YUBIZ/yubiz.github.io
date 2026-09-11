import React from 'react';
import { blogConfig } from '../config/blogConfig';

export interface HeadingItem {
  id: string;
  text: React.ReactNode;
  level: number;
  number: string;
}

interface TableOfContentsProps {
  headings: HeadingItem[];
  onHeadingClick: (InId: string) => void;
}

export default function TableOfContents({ headings, onHeadingClick }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav className="toc-no-scrollbar max-h-[70vh] overflow-y-auto border-l border-zinc-200 pl-3 dark:border-zinc-800">
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 select-none">
        {blogConfig.text.tocTitle}
      </h3>
      <div className="space-y-2">
        {headings.map(heading => {
          const levelClass = {
            1: 'pl-0 font-medium',
            2: 'pl-2',
            3: 'pl-4',
            4: 'pl-6',
          }[heading.level] || 'pl-0';

          return (
            <button
              key={heading.id}
              onClick={() => onHeadingClick(heading.id)}
              className={`block w-full text-left text-xs transition-colors cursor-pointer text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 ${levelClass}`}
            >
              <span className="mr-1 font-mono text-zinc-300 dark:text-zinc-700">{heading.number}</span>
              {heading.text}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
