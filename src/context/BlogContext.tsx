'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ViewType } from '../types/blog';
import { blogConfig } from '../config/blogConfig';

/// @brief 블로그 UI 상태 컨텍스트 인터페이스입니다.
interface BlogContextType {
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  darkMode: boolean;
  setSearchQuery: (InQuery: string) => void;
  setSelectedCategory: (InCategory: string) => void;
  setSelectedTags: (InTags: string[]) => void;
  toggleDarkMode: () => void;
  setView: (InView: ViewType, InPostId?: string | null) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

/// @brief 블로그 UI 상태를 관리하는 Provider 컴포넌트입니다.
export function BlogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(blogConfig.text.allCategory);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  // head 스크립트에서 설정된 다크 모드 상태를 동기화합니다.
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  /// @brief 뷰를 전환하고 URL 경로를 업데이트합니다.
  const setView = (InView: ViewType, InPostId: string | null = null) => {
    let targetPath = '/';
    if (InView === 'post' && InPostId) targetPath = `/post/${InPostId}`;
    else if (InView === 'posts') targetPath = '/posts';
    router.push(targetPath);
  };

  /// @brief 다크 모드를 토글합니다.
  const toggleDarkMode = () => {
    const bNewDarkMode = !darkMode;
    setDarkMode(bNewDarkMode);
    document.documentElement.classList.toggle('dark', bNewDarkMode);
    localStorage.setItem('theme', bNewDarkMode ? 'dark' : 'light');
  };

  return (
    <BlogContext.Provider
      value={{
        searchQuery, selectedCategory, selectedTags, darkMode,
        setSearchQuery, setSelectedCategory, setSelectedTags, toggleDarkMode, setView,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

/// @brief 블로그 컨텍스트 훅입니다. BlogProvider 내부에서만 사용할 수 있습니다.
export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog는 BlogProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}