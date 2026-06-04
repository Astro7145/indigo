import { IcBell } from '../icons';

interface SidebarNotificationButtonProps {
  unread?: boolean;
  onClick?: () => void;
}

export default function SidebarNotificationButton({ unread = false, onClick }: SidebarNotificationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="알림"
      className="flex aspect-square size-16 cursor-pointer items-center justify-center rounded-sm border border-indigo-600 bg-indigo-800/20 transition-shadow hover:shadow-[inset_0_0_8px_0_rgba(255,255,255,0.4)]"
    >
      <IcBell className="text-white" state={unread ? 'unread' : 'read'} />
    </button>
  );
}
