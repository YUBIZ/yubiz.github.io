import React from 'react';

/// @brief 사이드바 레이아웃 컴포넌트입니다.
/// @note sticky 포지셔닝을 위해 self-start를 적용합니다.
interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export default function Sidebar({ children, className = '' }: SidebarProps) {
  return (
    <div className={`w-full lg:w-48 lg:sticky lg:top-20 self-start space-y-6 shrink-0 ${className}`}>
      {children}
    </div>
  );
}