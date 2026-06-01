'use client';

import { useRef, useState } from 'react';

import Badge, { type BadgeColor } from '@/src/components/common/badges/Badge';

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
  const colorIndexRef = useRef(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || value.some((t) => t.text === text)) return;
    const color = BADGE_COLORS[colorIndexRef.current % BADGE_COLORS.length];
    colorIndexRef.current += 1;
    onChange([...value, { text, color }]);
    setInputValue('');
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-sm border border-slate-300 p-4 focus-within:border-indigo-500">
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
        className="min-w-0 flex-1 text-base text-slate-700 outline-none placeholder:text-slate-500"
      />
    </div>
  );
}
