import { useTranslations } from 'next-intl';

import Checkbox from '@/src/components/common/checkbox/Checkbox';

interface StatusFieldProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  error: boolean;
}

export default function StatusField({ value, onChange, error }: StatusFieldProps) {
  const tCommon = useTranslations('common');
  const tTodos = useTranslations('todos');

  return (
    <div className="flex flex-col gap-2 pb-8">
      <span className="px-1 text-base font-semibold text-slate-700">
        {tTodos('fields.status')} <span className="text-destructive">*</span>
      </span>
      <div className="flex gap-4">
        <Checkbox checked={value === false} onChange={() => onChange(false)}>
          {tCommon('tabs.todo')}
        </Checkbox>
        <Checkbox checked={value === true} onChange={() => onChange(true)}>
          {tCommon('tabs.done')}
        </Checkbox>
      </div>
      {error && (
        <small role="alert" className="text-destructive px-1 text-sm font-medium">
          {tTodos('form.statusError')}
        </small>
      )}
    </div>
  );
}
