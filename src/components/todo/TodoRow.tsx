import { MouseEvent } from 'react';

import IconButton from '@/src/components/common/buttons/IconButton';
import Checkbox from '@/src/components/common/checkbox/Checkbox';
import { IcLink } from '@/src/components/common/icons/IcLink';
import { IcNote } from '@/src/components/common/icons/IcNote';
import { IcStar } from '@/src/components/common/icons/IcStar';
import { cn } from '@/src/utils/cn';
import type { Todo } from '@/src/types/todo';

export interface TodoRowProps {
  todo: Todo;
  /** 제목 클릭 — 보통 상세로 이동 */
  onItemClick?: (todoId: number) => void;
  /** 체크박스 토글 — done 변경은 호출 측이 처리(mutation 위임) */
  onToggle?: (todoId: number) => void;
  /** 즐겨찾기 토글 — 제공 시 별이 IconButton이 됨(mutation 위임) */
  onToggleFavorite?: (todoId: number) => void;
}

/**
 * 최근 할일 행 — 인터랙티브 컨트롤(체크박스 토글, 별 즐겨찾기)과 제목 버튼(이동)을
 * 형제로 배치해 버튼 안 인터랙티브 중첩(유효하지 않은 HTML)을 피한다.
 * 모든 컨트롤 클릭은 카드 onClick으로 버블링되지 않도록 stopPropagation.
 */
export default function TodoRow({ todo, onItemClick, onToggle, onToggleFavorite }: TodoRowProps) {
  const title = (
    <span
      className={cn(
        'block truncate text-base font-semibold text-slate-700',
        todo.done && 'text-slate-400 line-through',
      )}
    >
      {todo.title}
    </span>
  );

  return (
    <li className="flex items-center gap-2 px-2 py-2.5">
      {/* 체크박스 클릭이 카드 onClick으로 버블링되지 않도록 차단(제어용 래퍼) */}
      <span className="flex shrink-0" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={todo.done}
          aria-label={todo.title}
          {...(onToggle ? { onChange: () => onToggle(todo.id) } : { readOnly: true })}
        />
      </span>
      {onItemClick ? (
        <button
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onItemClick(todo.id);
          }}
          className="min-w-0 flex-1 text-left"
        >
          {title}
        </button>
      ) : (
        <div className="min-w-0 flex-1">{title}</div>
      )}
      <RowActions todo={todo} onToggleFavorite={onToggleFavorite} />
    </li>
  );
}

function RowActions({ todo, onToggleFavorite }: { todo: Todo; onToggleFavorite?: (todoId: number) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {todo.noteIds.length > 0 && <IcNote state="default" aria-label="노트 있음" />}
      {todo.linkUrl && <IcLink aria-label="링크 있음" />}
      {onToggleFavorite ? (
        <IconButton
          aria-label={todo.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(todo.id);
          }}
        >
          <IcStar state={todo.isFavorite ? 'active' : 'default'} />
        </IconButton>
      ) : (
        <IcStar
          state={todo.isFavorite ? 'active' : 'default'}
          aria-label={todo.isFavorite ? '즐겨찾기됨' : '즐겨찾기 안 됨'}
        />
      )}
    </div>
  );
}
