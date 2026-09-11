# 사용자 구성 가이드

프로젝트에서 사용자가 직접 변경할 수 있는 설정과 콘텐츠 관리 방법을 설명합니다.

## `blog-config.yaml`

사이트 이름, 설명, 테마, 광고, 분석 도구를 설정합니다.

```yaml
name: "YUBIZ LOG"
title: "YUBIZ LOG - 기록"
description: "기술과 스스로의 경험에 집중하는 개인 블로그입니다."
author: "YUBIZ"
codeTheme: "github"
```

### 기본 설정

| 설정 | 설명 |
| --- | --- |
| `name` | 헤더와 사이트에 표시되는 이름 |
| `title` | 기본 페이지 제목 |
| `description` | 사이트 설명 및 SEO 설명 |
| `author` | 작성자 이름 |
| `codeTheme` | 코드 블록 색상 테마 |
| `fontFamily` | 사이트 기본 폰트 패밀리 |

### 폰트 패밀리

블로그 전체에 사용할 하나의 글꼴 패밀리 이름을 지정합니다. 비워 두거나 설정하지 않으면 시스템 폰트를 사용합니다.

```yaml
fontFamily: "system-ui"
# codeFontFamily: "monospace"
```

공백이 포함된 글꼴 이름은 따옴표로 감쌉니다. 코드 블록과 인라인 코드는 기본적으로 본문 폰트를 상속합니다. 별도 폰트를 사용하려면 `codeFontFamily`를 추가합니다.

```yaml
codeFontFamily: "monospace"
```

### 코드 블록 테마

```yaml
codeTheme: "github"
```

지원 값:

- `github`
- `monokai`
- `nord`
- `dracula`
- `visual-studio`

설정하지 않거나 지원하지 않는 값을 사용하면 테마 색상이 적용되지 않을 수 있으므로 지원 목록의 값만 사용하세요.

### 화면 문구

`text` 항목에서 화면에 표시되는 문구를 변경할 수 있습니다.

```yaml
text:
  navPosts: "글 목록"
  darkModeToggle: "다크 모드 전환"
  searchPlaceholder: "검색..."
  noResults: "검색 결과가 없습니다."
  backToPosts: "글 목록으로"
  tocTitle: "목차"
```

기존 키 이름은 유지하고 값만 변경하는 것을 권장합니다.

### 광고

```yaml
ads:
  enabled: "false"
  adsenseId: ""
  slotHome: ""
  slotPostsList: ""
  slotPostDetail: ""
```

사용하지 않을 때는 `enabled: "false"`로 설정합니다. 사용하려면 AdSense ID와 각 광고 슬롯 ID를 입력합니다.

### Google Analytics

```yaml
analytics:
  enabled: "false"
  gaId: ""
```

Google Analytics를 사용할 때만 `enabled`를 `"true"`로 설정하고 측정 ID를 입력합니다.

## 게시글 구성

게시글은 `posts/<카테고리>/` 폴더에 Markdown 파일로 작성합니다.

```text
posts/
├── 개발/
│   └── next-static-blog.md
└── 에세이/
    └── writing.md
```

폴더명이 카테고리가 되므로 frontmatter에 `category`를 작성하지 않습니다.

```markdown
---
title: "게시글 제목"
date: "2026-05-23"
tags: [NextJS, React]
---

본문을 작성합니다.
```

파일 경로는 게시글 ID와 URL에 반영됩니다.

```text
posts/개발/next-static-blog.md
→ /post/개발/next-static-blog/
```

### 게시글 규칙

- 모든 Markdown 파일은 카테고리 폴더 안에 둡니다.
- 파일명은 게시글 ID로 사용됩니다.
- 같은 카테고리 안에서 파일명을 중복하지 않습니다.
- 게시글을 다른 카테고리로 이동하면 URL도 변경됩니다.

## 설정 적용

설정 변경은 빌드 전에 자동으로 반영됩니다.

```bash
npm run dev
npm run build
```

`src/config/blogConfig.ts`, `public/ads.txt`는 `blog-config.yaml`에서 자동 생성되므로 직접 수정하지 않습니다.
