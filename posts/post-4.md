---
title: "Next.js 정적 블로그에 코드 블록 스타일링 적용하기"
date: "2026-05-23"
category: "개발"
tags: [NextJS, React, 웹디자인, CSS]
---

웹 상에서 개발 블로그를 읽을 때 가장 눈에 들어오는 시각적 요소는 단연 **코드 스니펫(Code Snippets)**의 표현력입니다. 코드 하이라이팅이 정갈하지 않거나 가독성이 떨어지면, 독자가 소스 코드를 면밀히 추적하고 해석하는 힘을 금방 잃게 됩니다.

이 블로그에 적용한 테마와 일체감을 이루면서도 미니멀리즘의 극적인 편안함을 선사하는 코드 블록 렌더링 스타일 및 연동 예제를 소개합니다.

### 1. React 클라이언트 컴포넌트 렌더러 구현

다음은 정적 마크다운 데이터를 파싱하여 단일 코드 블록 단위의 HTML 구조로 매핑해 주는 클라이언트 컴포넌트 예시 소스입니다.

```typescript
import React from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex justify-between text-xs text-zinc-400 mb-2 font-mono uppercase">
        {language}
      </div>
      <pre className="font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-normal">
        <code>{code}</code>
      </pre>
    </div>
  );
}
```

### 2. CSS 스타일 시트 및 리셋

모노톤 Zinc 테마와 조화로운 색조를 유지하기 위해, 아래와 같은 최소화된 순수 CSS 스타일을 스타일시트에 이식했습니다.

```css
pre {
  margin: 0;
  padding: 0;
  background: transparent;
  overflow-x: auto;
}
code {
  font-family: var(--font-geist-mono), monospace;
  font-size: 0.875rem;
}
```

> **생각 한 줄**: 복잡하고 눈이 피로한 네온사인 형광색 코드 하이라이트보다, 흑백 모노톤 중심에 핵심 구조만 얇게 강조하는 미니멀 테마가 깊이 있는 독서(Deep Reading)에 훨씬 긍정적인 영향을 줍니다.
