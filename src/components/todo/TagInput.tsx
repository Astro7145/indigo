'use client';

import { useRef, useState } from 'react';

import Badge, { type BadgeColor } from '@/src/components/common/badges/Badge';
import { IcPlus } from '@/src/components/common/icons';

export interface Tag {
  text: string;
  color: BadgeColor;
}

interface TagInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
}

const BADGE_COLORS: BadgeColor[] = ['green', 'yellow', 'red', 'purple', 'gray'];

export default function TagInput({ value, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const colorIndexRef = useRef(value.length);

  const trimmed = inputValue.trim();
  const isDuplicate = value.some((t) => t.text === trimmed);
  const canAdd = !!trimmed && !isDuplicate;

  const addTag = () => {
    if (!canAdd) return;
    const color = BADGE_COLORS[colorIndexRef.current % BADGE_COLORS.length];
    colorIndexRef.current += 1;
    onChange([...value, { text: trimmed, color }]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    e.preventDefault();
    addTag();
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-sm border border-slate-300 p-3 focus-within:border-indigo-500 sm:p-4">
      {value.map((tag) => (
        <Badge key={tag.text} color={tag.color} onDelete={() => onChange(value.filter((t) => t.text !== tag.text))}>
          {tag.text}
        </Badge>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="입력 후 Enter"
        className="min-w-0 flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-500 sm:text-base"
      />
      <button
        type="button"
        aria-label="태그 추가"
        disabled={!canAdd}
        onMouseDown={(e) => e.preventDefault()}
        onClick={addTag}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 disabled:bg-slate-300"
      >
        <IcPlus className="size-4 text-white" />
      </button>
    </div>
  );
}
