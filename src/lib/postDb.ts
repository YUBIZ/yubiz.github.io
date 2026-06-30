import fs from 'fs';
import path from 'path';
import { Post } from '../types/blog';
import { parseMarkdown } from './markdown';

const POSTS_DIR = path.join(process.cwd(), 'posts');

// region Query

/// @brief 모든 게시글을 날짜 내림차순으로 조회합니다.
/// @note posts 디렉토리 내의 모든 .md 파일을 읽어 파싱합니다.
/// @returns 날짜 기준 내림차순 정렬된 게시글 배열입니다.
export function getPosts(): Post[] {
  const files = fs.readdirSync(POSTS_DIR);
  const posts: Post[] = [];

  for (const filename of files) {
    if (!filename.endsWith('.md')) continue;

    const id = filename.replace('.md', '');
    const filePath = path.join(POSTS_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { metadata, content } = parseMarkdown(fileContent);

    posts.push({
      id,
      title: metadata.title || '제목 없음',
      content,
      excerpt: content.replace(/\n/g, ' ').substring(0, 120) + (content.length > 120 ? '...' : ''),
      category: metadata.category || '일반',
      tags: metadata.tags || [],
      createdAt: metadata.date || new Date().toISOString().split('T')[0],
    });
  }

  // 날짜 내림차순 정렬, 동일한 날짜인 경우 제목 오름차순
  return posts.sort((a, b) => {
    const dateCompare = b.createdAt.localeCompare(a.createdAt);
    if (dateCompare !== 0) return dateCompare;
    return a.title.localeCompare(b.title);
  });
}

/// @brief 지정된 ID의 게시글을 조회합니다.
/// @param InId 조회할 게시글의 ID입니다.
/// @returns 게시글이 존재하면 해당 게시글을, 그렇지 않으면 null을 반환합니다.
export function getPostById(InId: string): Post | null {
  try {
    const posts = getPosts();
    return posts.find(p => p.id === InId) || null;
  } catch (e) {
    console.error(`[postDb] 게시글 조회에 실패했습니다. ID: ${InId}`, e);
    return null;
  }
}

// endregion