import { cn } from '@/src/utils/cn';
import { IcCalendar, IcDashboard, IcFavorites, IcFlagFill, IcLogout, IcMessageSquare, IcSettings } from '../icons';

type SidebarRowType = 'dashboard' | 'goals' | 'calendar' | 'posts' | 'favorites' | 'settings' | 'logout';

interface SidebarRowProps {
  type: SidebarRowType;
  text: string;
  current?: boolean;
  collapsed?: boolean;
}

export default function SidebarRow({ type, text, current = false, collapsed = false }: SidebarRowProps) {
  const state = current ? 'active' : 'default';

  const icon: Record<SidebarRowType, React.ReactNode> = {
    dashboard: <IcDashboard state={state} />,
    goals: <IcFlagFill state={state} />,
    calendar: <IcCalendar state={state} />,
    posts: <IcMessageSquare state={state} />,
    favorites: <IcFavorites state={state} />,
    settings: <IcSettings />,
    logout: <IcLogout />,
  };

  return (
    <li
      title={collapsed ? text : undefined}
      className={cn(
        'flex h-14 w-full cursor-pointer list-none items-center gap-x-2 px-4 py-3.5 transition-colors group-focus-visible:bg-indigo-600/10 hover:bg-indigo-600/10',
        collapsed && 'justify-center gap-x-0 px-0',
        current && 'bg-indigo-600/20',
      )}
    >
      <span className="size-6">{icon[type]}</span>
      {!collapsed && <span className="text-lg font-bold text-white">{text}</span>}
    </li>
  );
}
