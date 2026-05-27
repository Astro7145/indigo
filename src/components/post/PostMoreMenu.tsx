'use client';

import { useEffect, useRef, useState } from 'react';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcMeetballs } from '@/src/components/common/icons/IcMeetballs';
import { cn } from '@/src/utils/cn';

interface PostMoreMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export default function PostMoreMenu({ onEdit, onDelete, className }: PostMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <IconButton aria-label="더보기" onClick={() => setIsOpen((prev) => !prev)}>
        <IcMeetballs className="size-5 text-slate-400" />
      </IconButton>

      {isOpen && (
        <ul
          role="menu"
          className="absolute right-0 z-10 mt-2 w-28 rounded border border-slate-200 bg-white py-1 shadow-md"
        >
          <li>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              수정하기
            </button>
          </li>
          <li>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-slate-50"
            >
              삭제하기
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
