import Link from 'next/link';
import { cn } from '@/src/utils/cn';
import { IcCalendar, IcDashboard, IcFavorites, IcFlagFill, IcLogout, IcMessageSquare, IcSettings } from '../icons';

type SidebarRowType = 'dashboard' | 'goals' | 'calendar' | 'posts' | 'favorites' | 'settings' | 'logout';

interface SidebarRowProps {
  type: SidebarRowType;
  text: string;
  href?: string;
  onClick?: () => void;
  current?: boolean;
  collapsed?: boolean;
}

export default function SidebarRow({ type, text, href, onClick, current = false, collapsed = false }: SidebarRowProps) {
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

  const rowClassName = cn(
    'flex h-14 w-full cursor-pointer items-center gap-x-2 px-4 py-3.5 transition-colors group-focus-visible:bg-indigo-600/10 hover:bg-indigo-600/10',
    collapsed && 'justify-center gap-x-0 px-0',
    current && 'bg-indigo-600/20',
  );

  const row = (
    <div className={rowClassName}>
      <span className="size-6">{icon[type]}</span>
      {!collapsed && <span className="text-lg font-bold text-white">{text}</span>}
    </div>
  );

  return (
    <li title={collapsed ? text : undefined} className="list-none">
      {href ? (
        <Link href={href} className="group block">
          {row}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className="group block w-full">
          {row}
        </button>
      ) : (
        row
      )}
    </li>
  );
}
