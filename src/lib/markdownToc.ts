import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import type { HeadingItem } from '../types/markdown';

export function getHeadings(InText: string): HeadingItem[] {
  const tree = unified().use(remarkParse).parse(InText);
  const slugger = new GithubSlugger();
  const counters = [0, 0, 0, 0];
  const headings: HeadingItem[] = [];

  visit(tree, 'heading', node => {
    const heading = node as { depth: number };
    const level = heading.depth;
    if (level < 1 || level > counters.length) return;

    const text = toString(node);
    counters[level - 1] += 1;
    for (let index = level; index < counters.length; index += 1) counters[index] = 0;

    headings.push({
      id: slugger.slug(text),
      text,
      level,
      number: counters.slice(0, level).join('.'),
    });
  });

  return headings;
}
