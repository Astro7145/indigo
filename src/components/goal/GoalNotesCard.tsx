import { useTranslations } from 'next-intl';
import Link from 'next/link';

import Card from '@/src/components/common/cards/Card';
import { IcChevron } from '@/src/components/common/icons/IcChevron';
import NotesIllustration from '@/src/components/common/icons/NotesIllustration';
import { cn } from '@/src/utils/cn';

export interface GoalNotesCardProps {
  goalId: number;
  className?: string;
}

// 인접한 ProgressCard(목표 진행도)와 시각적으로 동일하도록 같은 그라데이션을 재사용한다
// (ProgressCard 구현이 쓰는 값과 동일 — figma의 두 카드는 같은 그라데이션).
const GRADIENT = 'bg-[linear-gradient(120deg,#6E66C8_0%,#3D3677_73.21%)]';

/**
 * "노트 모아보기" 카드 — 클릭 시 해당 목표에 속한 할 일들의 노트 모아보기 페이지로 이동한다.
 *
 * Figma 21209:54557 (308×160). 그라데이션 + 노트북 일러스트(시안 SVG 그대로) + 안내 텍스트.
 * 이동 대상 페이지(`/goals/[goalId]/notes`)는 별도 작업으로, 이 카드는 진입점만 담당한다.
 *
 * 인접한 ProgressCard와 동일하게 Card를 그라데이션 표면으로 재사용하고, 네비게이션은 `<Link>`로
 * 감싸 처리한다 — 앵커 시맨틱이라 cmd/중간 클릭 새 탭·키보드 포커스를 기본으로 확보한다.
 */
export default function GoalNotesCard({ goalId, className }: GoalNotesCardProps) {
  const t = useTranslations('goals');
  return (
    <Link href={`/goals/${goalId}/notes`} className={cn('block', className)}>
      <Card
        className={cn(
          'relative h-40 overflow-hidden border-0 p-0 text-white shadow-[0_8px_12px_0_rgba(61,54,119,0.25)] transition-shadow hover:shadow-[0_12px_20px_0_rgba(61,54,119,0.35)]',
          GRADIENT,
        )}
      >
        {/* figma overlay — 본체 위 미세한 하단 어둠 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/[0.07]"
        />
        {/* 노트북 일러스트 — figma처럼 우측에 15° 기울여 배치, luminosity로 그라데이션에 녹임 */}
        <NotesIllustration className="pointer-events-none absolute top-[15px] right-1 size-[119px] rotate-[15deg] opacity-70 mix-blend-luminosity" />
        {/* 안내 텍스트 + 우측 chevron */}
        <div className="absolute bottom-8 left-10 flex items-center gap-0.5">
          <span className="text-xl font-bold tracking-[-0.03em]">{t('note.collectTitle')}</span>
          <IcChevron aria-hidden direction="right" className="size-6 text-white" />
        </div>
      </Card>
    </Link>
  );
}
