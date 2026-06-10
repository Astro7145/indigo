import Sidebar from '@/src/components/common/sidebar/Sidebar';
import Topbar from '@/src/components/common/sidebar/Topbar';
import Settings from '@/src/components/common/settings/Settings';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100 sm:flex-row">
      <Topbar />
      <Sidebar />
      <Settings />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-12 xl:px-10 xl:py-20">{children}</main>
        <div id="toast-portal" />
      </div>
    </div>
  );
}
