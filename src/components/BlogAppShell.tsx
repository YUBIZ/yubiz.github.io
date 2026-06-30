import React from 'react';
import Header from './Header';
import Footer from './Footer';

/// @brief 블로그 애플리케이션의 최상위 레이아웃 셸입니다.
export default function BlogAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}