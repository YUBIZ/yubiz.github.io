'use client';

import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { Post } from '../types/blog';
import PostCard from './PostCard';
import { Search, X, ChevronDown } from 'lucide-react';
import { blogConfig } from '../config/blogConfig';
import Ad from './Ad';

type SortBy = 'newest' | 'oldest' | 'alphabetical';

/// @brief 게시글 목록 화면 컴포넌트의 Props 인터페이스입니다.
interface PostsViewProps {
  posts: Post[];
}

/// @brief 게시글 목록 화면 컴포넌트입니다.
/// @note 검색, 카테고리 필터, 태그 필터(AND 로직), 정렬 기능을 제공합니다.
/// @note 필터는 상단에 인라인 배치되며 사이드바/드로어를 사용하지 않습니다.
export default function PostsView({ posts }: PostsViewProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    setView,
  } = useBlog();

  const [sortBy, setSortBy] = useState<SortBy>('newest');

  // region Query

  const categories = React.useMemo(() => {
    const uniqueCats = Array.from(new Set(posts.map(p => p.category))).filter(Boolean);
    return [blogConfig.text.allCategory, ...uniqueCats];
  }, [posts]);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(post => { counts[post.category] = (counts[post.category] || 0) + 1; });
    counts[blogConfig.text.allCategory] = posts.length;
    return counts;
  }, [posts]);

  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    posts.forEach(post => post.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [posts]);

  const isTagAvailable = (InTag: string) => {
    if (selectedTags.includes(InTag)) return true;
    const prospectiveTags = [...selectedTags, InTag];
    return posts.some(post => {
      const bMatchesCategory = selectedCategory === blogConfig.text.allCategory || post.category === selectedCategory;
      if (!bMatchesCategory) return false;
      return prospectiveTags.every(t => post.tags.includes(t));
    });
  };

  // endregion

  // region Filter

  const filteredPosts = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter(post => {
      const bMatchesCategory = selectedCategory === blogConfig.text.allCategory || post.category === selectedCategory;
      if (!bMatchesCategory) return false;

      const bMatchesTags = selectedTags.every(tag => post.tags.includes(tag));
      if (!bMatchesTags) return false;

      if (!query) return true;

      const terms = query.split(/\s+/).filter(Boolean);
      if (terms.length === 0) return true;

      return terms.every(term => {
        const bMatchesTitle = post.title.toLowerCase().includes(term);
        const bMatchesTags = post.tags.some(t => t.toLowerCase().includes(term));
        if (term.length === 1) return bMatchesTitle || bMatchesTags;
        const bMatchesExcerpt = post.excerpt.toLowerCase().includes(term);
        const bMatchesContent = post.content.toLowerCase().includes(term);
        return bMatchesTitle || bMatchesTags || bMatchesExcerpt || bMatchesContent;
      });
    });
  }, [posts, selectedCategory, selectedTags, searchQuery]);

  const sortedAndFilteredPosts = React.useMemo(() => {
    const result = [...filteredPosts];
    if (sortBy === 'newest') {
      result.sort((a, b) => {
        const c = b.createdAt.localeCompare(a.createdAt);
        return c !== 0 ? c : a.title.localeCompare(b.title);
      });
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => {
        const c = a.createdAt.localeCompare(b.createdAt);
        return c !== 0 ? c : a.title.localeCompare(b.title);
      });
    } else {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [filteredPosts, sortBy]);

  // endregion

  // region Lifecycle

  React.useEffect(() => {
    const validTags = selectedTags.filter(tag => isTagAvailable(tag));
    if (validTags.length !== selectedTags.length) {
      setSelectedTags(validTags);
    }
  }, [allTags, selectedTags, setSelectedTags]);

  // endregion

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-10 animate-fade-in">
      {/* 정렬 + 검색 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="appearance-none rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-3 pr-7 text-xs font-medium text-zinc-700 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 cursor-pointer transition-colors"
          >
            <option value="newest">{blogConfig.text.sortNewest}</option>
            <option value="oldest">{blogConfig.text.sortOldest}</option>
            <option value="alphabetical">{blogConfig.text.sortTitle}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute inset-y-0 right-1.5 my-auto h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder={blogConfig.text.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-7 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 transition-colors"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {categories.map(cat => {
          const bIsActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                bIsActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900'
              }`}
            >
              {cat}
              <span className="ml-1 opacity-60 font-mono">{categoryCounts[cat] || 0}</span>
            </button>
          );
        })}
      </div>

      {/* 태그 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          {allTags.map(tag => {
            const bIsActive = selectedTags.includes(tag);
            const bIsAvailable = isTagAvailable(tag);
            return (
              <button
                key={tag}
                onClick={() => {
                  if (bIsActive) setSelectedTags(selectedTags.filter(t => t !== tag));
                  else if (bIsAvailable) setSelectedTags([...selectedTags, tag]);
                }}
                disabled={!bIsActive && !bIsAvailable}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer ${
                  bIsActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950'
                    : !bIsAvailable
                    ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                #{tag}
              </button>
            );
          })}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="text-xs text-red-500 hover:text-red-600 cursor-pointer ml-1"
            >
              {blogConfig.text.reset}
            </button>
          )}
        </div>
      )}

      {/* 개수 */}
      <div className="text-xs text-zinc-400 dark:text-zinc-500 select-none mb-2">
        {sortedAndFilteredPosts.length}개
      </div>

      {/* 게시글 목록 */}
      {sortedAndFilteredPosts.length > 0 ? (
        sortedAndFilteredPosts.map((post, index) => (
          <React.Fragment key={post.id}>
            <PostCard post={post} onClick={() => setView('post', post.id)} />
            {index === 2 && <Ad slot={blogConfig.ads.slotPostsList} />}
          </React.Fragment>
        ))
      ) : (
        <div className="py-20 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">{blogConfig.text.noResults}</p>
        </div>
      )}
    </div>
  );
}