import { ReactNode } from 'react';
import { Sidebar } from '@components/Sidebar';
import { Breadcrumb } from '@components/Breadcrumb';
import { GlobalSearch } from '@components/GlobalSearch';
import { NotificationToast } from '@components/NotificationToast';
import { Bell } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ml-20 md:ml-64 transition-all duration-300 flex flex-col">
        {/* Header with Global Search */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors relative">
                <Bell size={20} className="text-neutral-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Breadcrumb />
            {children}
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <NotificationToast />
    </div>
  );
};
