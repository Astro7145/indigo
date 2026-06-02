import { IcCalendarOutline } from '@/src/components/common/icons/IcCalendarOutline';
import { IcCheckboxWhite } from '@/src/components/common/icons/IcCheckboxWhite';
import { IcFlagOutline } from '@/src/components/common/icons/IcFlagOutline';

export interface NoteMetaInfoProps {
  goalTitle: string;
  todoTitle: string;
  todoDone: boolean;
  tags?: { id: number; name: string }[];
  createdAt: string;
}

// 태그 id로 안정적으로 색을 회전시킴 (서버가 색을 주지 않음)
const TAG_PALETTE = [
  'bg-emerald-50 text-emerald-600',
  'bg-amber-50 text-amber-600',
  'bg-rose-50 text-rose-600',
  'bg-sky-50 text-sky-600',
  'bg-indigo-50 text-indigo-600',
];

function tagColor(id: number): string {
  return TAG_PALETTE[id % TAG_PALETTE.length];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
}

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
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:text-xs ${
              todoDone ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            {todoDone ? 'DONE' : 'TO DO'}
          </span>
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
            {tags.map((tag) => (
              <span key={tag.id} className={`rounded-full px-2 py-0.5 text-[10px] sm:text-xs ${tagColor(tag.id)}`}>
                {tag.name}
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  );
}
