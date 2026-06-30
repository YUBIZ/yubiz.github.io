'use client';

import React, { useEffect } from 'react';
import { blogConfig } from '../config/blogConfig';

/// @brief AdSense 전역 타입 선언입니다.
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/// @brief 광고 컴포넌트의 Props 인터페이스입니다.
interface AdProps {
  /// @brief AdSense 광고 슬롯 ID입니다.
  slot: string;
  className?: string;
}

/// @brief Google AdSense 광고를 렌더링하는 컴포넌트입니다.
/// @note blog-config.yaml의 ads.enabled가 "true"이고 adsenseId가 설정된 경우에만 광고가 표시됩니다.
/// @note 광고 상단에 라벨을 표시하여 콘텐츠와 구분합니다.
export default function Ad({ slot: InSlot, className = '' }: AdProps) {
  useEffect(() => {
    if (blogConfig.ads.enabled !== 'true') return;
    if (!blogConfig.ads.adsenseId) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('[Ad] AdSense 광고 로드에 실패했습니다.', e);
    }
  }, []);

  if (blogConfig.ads.enabled !== 'true') return null;
  if (!blogConfig.ads.adsenseId) return null;
  if (!InSlot) return null;

  return (
    <div className={`my-10 ${className}`}>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-zinc-300 dark:text-zinc-700 select-none">
        {blogConfig.text.adLabel}
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={blogConfig.ads.adsenseId}
        data-ad-slot={InSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}