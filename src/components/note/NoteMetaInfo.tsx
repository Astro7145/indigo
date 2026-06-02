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

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
}

export default function NoteMetaInfo({ goalTitle, todoTitle, todoDone, tags, createdAt }: NoteMetaInfoProps) {
  return (
    <dl className="grid grid-cols-1 gap-y-3 text-xs sm:grid-cols-2 sm:gap-x-8 sm:text-sm">
      <div className="flex items-center gap-2">
        <dt className="flex shrink-0 items-center gap-1 text-slate-500">
          <IcFlagOutline />
          <span>목표</span>
        </dt>
        <dd className="truncate text-slate-800">{goalTitle}</dd>
      </div>

      <div className="flex items-center gap-2">
        <dt className="flex shrink-0 items-center gap-1 text-slate-500">
          <IcCalendarOutline />
          <span>작성일</span>
        </dt>
        <dd className="text-slate-800">{formatDate(createdAt)}</dd>
      </div>

      <div className="flex items-center gap-2">
        <dt className="flex shrink-0 items-center gap-1 text-slate-500">
          <IcCheckboxWhite />
          <span>할 일</span>
        </dt>
        <dd className="flex min-w-0 items-center gap-2">
          <span className="truncate text-slate-800">{todoTitle}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:text-xs ${
              todoDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {todoDone ? 'DONE' : 'TO DO'}
          </span>
        </dd>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex items-center gap-2">
          <dt className="flex shrink-0 items-center gap-1 text-slate-500">
            <span className="text-base">#</span>
            <span>태그</span>
          </dt>
          <dd className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 sm:text-xs"
              >
                {tag.name}
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  );
}
