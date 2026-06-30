/// @brief 마크다운 프론트매터 메타데이터 인터페이스입니다.
export interface FrontMatter {
  title?: string;
  date?: string;
  category?: string;
  tags?: string[];
}

/// @brief 마크다운 파일을 프론트매터 메타데이터와 본문 콘텐츠로 분리하여 파싱합니다.
/// @param InFileContent 마크다운 파일의 원본 문자열입니다.
/// @returns 파싱된 메타데이터와 본문 콘텐츠를 포함하는 객체입니다.
export function parseMarkdown(InFileContent: string): { metadata: FrontMatter; content: string } {
  const match = InFileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, content: InFileContent };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const metadata: FrontMatter = {};

  const lines = yamlBlock.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let val = line.substring(colonIndex + 1).trim();

    // 따옴표 제거
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }

    if (key === 'title') metadata.title = val;
    else if (key === 'date') metadata.date = val;
    else if (key === 'category') metadata.category = val;
    else if (key === 'tags') {
      // 대괄호 형식 [a, b] 파싱
      if (val.startsWith('[') && val.endsWith(']')) {
        metadata.tags = val
          .substring(1, val.length - 1)
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);
      } else {
        metadata.tags = val.split(',').map(t => t.trim()).filter(Boolean);
      }
    }
  }

  return { metadata, content };
}