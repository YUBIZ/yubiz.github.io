import matter from 'gray-matter';

export interface FrontMatter {
  title?: string;
  date?: string;
  tags?: string[];
}

export function parseMarkdown(InFileContent: string): { metadata: FrontMatter; content: string } {
  const { data, content } = matter(InFileContent);
  const metadata: FrontMatter = {
    title: typeof data.title === 'string' ? data.title : undefined,
    date: typeof data.date === 'string' ? data.date : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
  };

  return { metadata, content };
}
