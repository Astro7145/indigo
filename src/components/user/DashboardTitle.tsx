'use client';

import { useMe } from '@/src/hooks/user';
import { useTranslations } from 'next-intl';

/**
 * 대시보드 페이지 타이틀 — 유저명은 클라 쿼리(useMe)라 서버 셸에서 분리된 클라 섬.
 * 모바일(<sm)은 GNB가 타이틀을 담당 → sm+ 에서 노출. 로드 전후 grid가 밀려나지 않도록 h-8 예약.
 */
export default function DashboardTitle() {
  const { data: me } = useMe();
  const t = useTranslations('dashboard');

  return (
    <div className="hidden h-8 sm:block">
      <h1 className="pl-1 text-2xl font-semibold text-slate-800">
        <span data-testid="user-name" className="text-indigo-600">
          {me?.name}
        </span>
        {t('title')}
      </h1>
    </div>
  );
}
