'use client';

import React, { useEffect, useRef } from 'react';
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
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (blogConfig.ads.enabled !== 'true') return;
    if (!blogConfig.ads.adsenseId) return;
    if (!InSlot) return;

    const tryPushAd = () => {
      try {
        // 1. 이 컴포넌트 인스턴스에서 이미 push를 시도했는지 확인
        if (pushedRef.current) return;

        // 2. 실제 DOM 요소가 있고, 아직 광고가 삽입되지 않았는지 확인
        if (adRef.current && adRef.current.getAttribute('data-adsbygoogle-status') !== 'done') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
        }
      } catch {
        // 애드센스 내부 에러는 무시하거나 로그만 남깁니다.
      }
    };

    // DOM이 완전히 렌더링된 후 실행되도록 약간의 지연을 줍니다.
    const timer = setTimeout(tryPushAd, 100);
    return () => clearTimeout(timer);
  }, [InSlot]);

  if (blogConfig.ads.enabled !== 'true') return null;
  if (!blogConfig.ads.adsenseId) return null;
  if (!InSlot) return null;

  return (
    <div className={`my-10 ${className}`}>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-zinc-300 dark:text-zinc-700 select-none">
        {blogConfig.text.adLabel}
      </p>
      <ins
        ref={adRef}
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