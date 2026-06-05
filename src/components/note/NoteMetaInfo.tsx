import { IcCalendarOutline } from '@/src/components/common/icons/IcCalendarOutline';
import { IcCheckboxWhite } from '@/src/components/common/icons/IcCheckboxWhite';
import { IcFlagOutline } from '@/src/components/common/icons/IcFlagOutline';
import Badge, { type BadgeColor } from '@/src/components/common/badges/Badge';
import Chip from '@/src/components/common/chips/Chip';
import { formatDate } from '@/src/utils/date';

export interface NoteMetaInfoProps {
  goalTitle: string;
  todoTitle: string;
  todoDone: boolean;
  tags?: { id: number; name: string }[];
  createdAt: string;
}

// 태그를 배열 순서대로 초·노·빨·보라·그레이 순환 (서버가 색을 안 주고 디자인이 위치 기반)
const TAG_COLORS: BadgeColor[] = ['green', 'yellow', 'red', 'purple', 'gray'];

export default function NoteMetaInfo({ goalTitle, todoTitle, todoDone, tags, createdAt }: NoteMetaInfoProps) {
  return (
    <dl className="grid grid-cols-1 gap-y-3 text-xs sm:grid-cols-2 sm:gap-x-8 sm:text-sm">
      {/* 모바일 순서는 JSX 순서로 흐르고, 데스크탑/태블릿(2col)은 명시적 grid 위치로 [목표|작성일][할일|태그] 배치 */}
      <div className="flex items-center gap-2 sm:col-start-1 sm:row-start-1">
        <dt className="flex shrink-0 items-center gap-1 text-slate-500">
          <IcFlagOutline />
          <span>목표</span>
        </dt>
        <dd className="truncate text-slate-800">{goalTitle}</dd>
      </div>

      <div className="flex items-center gap-2 sm:col-start-1 sm:row-start-2">
        <dt className="flex shrink-0 items-center gap-1 text-slate-500">
          <IcCheckboxWhite />
          <span>할 일</span>
        </dt>
        <dd className="flex min-w-0 items-center gap-2">
          <span className="truncate text-slate-800">{todoTitle}</span>
          <Chip type={todoDone ? 'done' : 'todo'} />
        </dd>
      </div>

      <div className="flex items-center gap-2 sm:col-start-2 sm:row-start-1">
        <dt className="flex shrink-0 items-center gap-1 text-slate-500">
          <IcCalendarOutline />
          <span>작성일</span>
        </dt>
        <dd className="text-slate-800">{formatDate(createdAt)}</dd>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex items-center gap-2 sm:col-start-2 sm:row-start-2">
          <dt className="flex shrink-0 items-center gap-1 text-slate-500">
            <span className="text-base">#</span>
            <span>태그</span>
          </dt>
          <dd className="flex flex-wrap gap-1">
            {tags.map((tag, idx) => (
              <Badge key={tag.id} color={TAG_COLORS[idx % TAG_COLORS.length]} className="py-0.5 text-[10px] sm:text-xs">
                {tag.name}
              </Badge>
            ))}
          </dd>
        </div>
      )}
    </dl>
  );
}
