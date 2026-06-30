import { getPosts } from '../lib/postDb';
import HomeView from '../components/HomeView';

/// @brief 블로그 홈 페이지입니다.
/// @note 서버 컴포넌트로 빌드 시간에 게시글을 읽어 HomeView에 전달합니다.
export default function Home() {
  const posts = getPosts();
  return <HomeView posts={posts} />;
}