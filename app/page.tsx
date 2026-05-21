import Calendar from '@/src/components/common/calendar/Calendar';
import {
  IcCheckedTask,
  IcGoal,
  IcSpringNote,
  IcProgress,
  IcProfileBlue,
  IcProfilePink,
  IcProfileYellow,
  IcTask,
  LogoFull,
} from '@/src/components/common/icons';

function IconRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-40 shrink-0 text-sm text-slate-500">{label}</span>
      {children}
    </div>
  );
}

function IconCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {children}
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 p-10 bg-[#444444]">
      <Calendar />
      <div className="flex flex-col gap-4">
        <IconRow label="IcCheckedTask">
          <IconCell label="default"><IcCheckedTask /></IconCell>
        </IconRow>
        <IconRow label="IcGoal">
          <IconCell label="sm/square"><IcGoal /></IconCell>
          <IconCell label="sm/circle"><IcGoal bgShape="circle" /></IconCell>
          <IconCell label="lg/square"><IcGoal size="lg" /></IconCell>
          <IconCell label="lg/circle"><IcGoal size="lg" bgShape="circle" /></IconCell>
        </IconRow>
        <IconRow label="IcTask">
          <IconCell label="default"><IcTask /></IconCell>
          <IconCell label="small"><IcTask small /></IconCell>
        </IconRow>
        <IconRow label="IcProgress">
          <IconCell label="default"><IcProgress /></IconCell>
          <IconCell label="small"><IcProgress small /></IconCell>
        </IconRow>
        <IconRow label="IcSpringNote">
          <IconCell label="sm/square"><IcSpringNote /></IconCell>
          <IconCell label="sm/circle"><IcSpringNote bgShape="circle" /></IconCell>
          <IconCell label="lg/square"><IcSpringNote size="lg" /></IconCell>
          <IconCell label="lg/circle"><IcSpringNote size="lg" bgShape="circle" /></IconCell>
        </IconRow>
        <IconRow label="IcProfileYellow">
          <IconCell label="default">
            <IcProfileYellow />
          </IconCell>
        </IconRow>
        <IconRow label="IcProfileBlue">
          <IconCell label="default">
            <IcProfileBlue />
          </IconCell>
        </IconRow>
        <IconRow label="IcProfilePink">
          <IconCell label="default">
            <IcProfilePink />
          </IconCell>
        </IconRow>
        <IconRow label="LogoFull">
          <IconCell label="default">
            <LogoFull />
          </IconCell>
        </IconRow>
      </div>
    </div>
  );
}
