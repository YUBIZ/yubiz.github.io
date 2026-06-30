/// @brief 블로그 게시글을 나타내는 데이터 구조체입니다.
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  createdAt: string;
}

/// @brief 블로그의 라우팅 뷰 타입입니다.
export type ViewType = 'home' | 'posts' | 'post';