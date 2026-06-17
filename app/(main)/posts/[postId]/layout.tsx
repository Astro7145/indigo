import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getUnreadNotificationCount, notificationTitlePrefix } from '@/src/api/server/notification-count';

// 상세 page가 client component라 page에 metadata를 둘 수 없어 layout에 둔다.
// 이 layout은 자식(edit)을 가지므로 문자열 title을 쓰면 루트 template이 끊긴다 →
// template을 다시 선언한다. default(자신의 title)는 상위(root) template이 적용되므로
// 접미사 없이 둔다(이미 붙이면 "| INdigo"가 중복된다).
// 재선언한 template에도 루트와 동일하게 알림 prefix를 넣어야 자식(edit)까지 누락 없이 적용된다.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('posts');
  const prefix = notificationTitlePrefix(await getUnreadNotificationCount());
  return {
    title: { default: t('meta.detail.title'), template: `${prefix}%s | INdigo` },
    description: t('meta.detail.description'),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
