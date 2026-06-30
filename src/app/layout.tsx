import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BlogProvider } from "../context/BlogContext";
import BlogAppShell from "../components/BlogAppShell";
import { blogConfig } from "../config/blogConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/// @brief 루트 레이아웃 메타데이터입니다.
export const metadata: Metadata = {
  title: {
    default: blogConfig.title,
    template: `%s - ${blogConfig.name}`,
  },
  description: blogConfig.description,
  openGraph: {
    title: blogConfig.title,
    description: blogConfig.description,
    type: 'website',
  },
};

/// @brief 뷰포트 및 테마 색상 설정입니다.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

/// @brief 블로그 애플리케이션의 루트 레이아웃 컴포넌트입니다.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bAdsEnabled = blogConfig.ads.enabled === 'true' && blogConfig.ads.adsenseId !== '';
  const bAnalyticsEnabled = blogConfig.analytics.enabled === 'true' && blogConfig.analytics.gaId !== '';

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* FOUC 방지를 위한 다크 모드 초기화 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        {/* Google AdSense (광고 활성화 시에만 로드) */}
        {bAdsEnabled && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${blogConfig.ads.adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
        {/* Google Analytics (분석 활성화 시에만 로드) */}
        {bAnalyticsEnabled && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${blogConfig.analytics.gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${blogConfig.analytics.gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full">
        <BlogProvider>
          <BlogAppShell>{children}</BlogAppShell>
        </BlogProvider>
      </body>
    </html>
  );
}