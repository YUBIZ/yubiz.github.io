import fs from 'fs';
import path from 'path';
import { Post } from '../types/blog';
import { parseMarkdown } from './markdown';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

const POSTS_DIR = path.join(process.cwd(), 'posts');

function createExcerpt(InContent: string): string {
  const tree = unified().use(remarkParse).parse(InContent.replace(/\\\r?\n/g, ' '));
  const paragraphs: string[] = [];

  visit(tree, 'paragraph', (node, _index, parent) => {
    if (parent?.type === 'root') paragraphs.push(toString(node));
  });

  const plainText = paragraphs.join(' ').replace(/\\\s*/g, ' ').replace(/\s+/g, ' ').trim();
  return plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '');
}

/// @brief 모든 게시글을 날짜 내림차순으로 조회합니다.
/// @note posts 하위 폴더명을 게시글 카테고리로 사용합니다.
export function getPosts(): Post[] {
  const posts: Post[] = [];
  const ids = new Set<string>();

  function collectPosts(directory: string): void {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        collectPosts(filePath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

      const category = path.relative(POSTS_DIR, directory);
      if (!category || category.includes(path.sep)) {
        throw new Error(`게시글은 카테고리 폴더 안에 있어야 합니다: ${filePath}`);
      }

      const filename = entry.name.replace(/\.md$/, '');
      const id = `${category}/${filename}`;
      if (ids.has(id)) {
        throw new Error(`게시글 ID가 중복됩니다: ${id}`);
      }
      ids.add(id);

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { metadata, content } = parseMarkdown(fileContent);

      posts.push({
        id,
        title: metadata.title || '제목 없음',
        content,
        excerpt: createExcerpt(content),
        category,
        tags: metadata.tags || [],
        createdAt: metadata.date || new Date().toISOString().split('T')[0],
      });
    }
  }

  collectPosts(POSTS_DIR);

  return posts.sort((a, b) => {
    const dateCompare = b.createdAt.localeCompare(a.createdAt);
    return dateCompare !== 0 ? dateCompare : a.title.localeCompare(b.title);
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
