import { getPosts } from '../../lib/postDb';
import PostsView from '../../components/PostsView';

/// @brief 게시글 목록 페이지입니다.
/// @note 서버 컴포넌트로 빌드 시간에 게시글을 읽어 PostsView에 전달합니다.
export default function PostsPage() {
  const posts = getPosts();
  return <PostsView posts={posts} />;
}