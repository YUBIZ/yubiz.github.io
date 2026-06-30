import React from 'react';
import { blogConfig } from '../config/blogConfig';

/// @brief 블로그 하단 푸터 컴포넌트입니다.
export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-6 dark:border-zinc-800">
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 select-none">
        © {new Date().getFullYear()} {blogConfig.author}. {blogConfig.text.footerRights}
      </p>
    </footer>
  );
}