'use client';

import React from 'react';
import { useBlog } from '../context/BlogContext';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { blogConfig } from '../config/blogConfig';

/// @brief 블로그 상단 헤더 컴포넌트입니다.
export default function Header() {
  const { setView, darkMode, toggleDarkMode } = useBlog();
  const pathname = usePathname();
  const bIsPostsView = pathname === '/posts';

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 transition-colors">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => setView('home')}
          className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 cursor-pointer"
        >
          {blogConfig.name}
        </button>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setView('posts')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              bIsPostsView
                ? 'text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
            }`}
          >
            {blogConfig.text.navPosts}
          </button>
          <button
            onClick={toggleDarkMode}
            className="ml-1 rounded-md p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors cursor-pointer"
            aria-label={blogConfig.text.darkModeToggle}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}