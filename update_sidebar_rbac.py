#!/usr/bin/env python3

sidebar_content = '''import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Users,
  Database,
  Shield,
  FileText,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  BookOpen,
  CheckCircle,
  Zap,
  DollarSign,
  Store,
  Cable,
  Activity,
  BarChart3,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '@stores/auth-store';
import { useNotificationStore } from '@stores/notification-store';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Platform',
    items: [
      { path: '/', label: 'Dashboard', icon: <Home size={20} />, description: 'Platform overview' },
      { path: '/health', label: 'System Health', icon: <Activity size={20} />, description: 'Monitor service status' },
    ],
  },
  {
    title: 'Core Services',
    items: [
      { path: '/participants', label: 'Participants', icon: <Users size={20} />, description: 'Data participants & organizations' },
      { path: '/datasets', label: 'Datasets', icon: <Database size={20} />, description: 'Data assets & catalogs' },
    ],
  },
  {
    title: 'Registry & Schema',
    items: [
      { path: '/schemas', label: 'Schemas', icon: <BookOpen size={20} />, description: 'Data schemas (JSON, SHACL, JSON-LD)' },
      { path: '/vocabularies', label: 'Vocabularies', icon: <FileText size={20} />, description: 'Shared vocabularies & terms' },
    ],
  },
  {
    title: 'Governance',
    items: [
      { path: '/policies', label: 'Policies', icon: <Shield size={20} />, description: 'Access policies & rules' },
      { path: '/contracts', label: 'Contracts', icon: <FileText size={20} />, description: 'Data agreements & contracts' },
      { path: '/compliance-records', label: 'Compliance', icon: <CheckCircle size={20} />, description: 'Compliance audits & records' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/transactions', label: 'Transactions', icon: <Zap size={20} />, description: 'Ledger & transaction logs' },
      { path: '/clearing-records', label: 'Clearing', icon: <DollarSign size={20} />, description: 'Clearing & settlement records' },
    ],
  },
  {
    title: 'Extensions',
    items: [
      { path: '/apps', label: 'Apps', icon: <Store size={20} />, description: 'Connector apps & plugins' },
      { path: '/connectors', label: 'Connectors', icon: <Cable size={20} />, description: 'Data connectors & integrations' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { path: '/users', label: 'Users', icon: <Lock size={20} />, description: 'User management' },
      { path: '/audit-logs', label: 'Audit Logs', icon: <BarChart3 size={20} />, description: 'Activity & audit trail' },
    ],
  },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Platform', 'Core Services']);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (path: string) => location.pathname === path;

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((s) => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-neutral-900 text-white z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
          flex flex-col
        `}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-neutral-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-lg">D</span>
            </div>
            {isOpen && <span className="font-bold text-lg hidden sm:inline">Dataspace</span>}
          </Link>
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <button
                onClick={() => toggleSection(section.title)}
                className={`
                  w-full flex items-center justify-between px-4 py-2 rounded-lg
                  transition-all duration-200 text-sm font-semibold
                  ${isOpen ? 'text-neutral-400 hover:text-white' : 'justify-center'}
                `}
                title={!isOpen ? section.title : undefined}
              >
                {isOpen && <span>{section.title}</span>}
                {isOpen && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      expandedSections.includes(section.title) ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {(isOpen && expandedSections.includes(section.title)) || !isOpen ? (
                <div className={isOpen ? 'space-y-1 ml-2' : ''}>
                  {section.items.map(({ path, label, icon, description }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setIsOpen(false);
                        }
                      }}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200 group relative
                        ${
                          isActive(path)
                            ? 'bg-primary-600 text-white'
                            : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                        }
                      `}
                      title={!isOpen ? label : undefined}
                    >
                      <span className="flex-shrink-0">{icon}</span>
                      {isOpen && (
                        <div className="flex-1">
                          <div className="font-medium truncate">{label}</div>
                          {description && (
                            <div className="text-xs text-neutral-500 group-hover:text-neutral-400 truncate">
                              {description}
                            </div>
                          )}
                        </div>
                      )}
                      {isOpen && isActive(path) && (
                        <div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="border-t border-neutral-800 p-2 space-y-2">
          <button
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-neutral-400 hover:bg-neutral-800 hover:text-white
              transition-all duration-200 relative
            `}
            title={!isOpen ? 'Notifications' : undefined}
          >
            <span className="flex-shrink-0 relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-error rounded-full text-xs flex items-center justify-center text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </span>
            {isOpen && <span className="font-medium">Notifications</span>}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                text-neutral-400 hover:bg-neutral-800 hover:text-white
                transition-all duration-200
              `}
              title={!isOpen ? 'User' : undefined}
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {isOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-neutral-500">{user?.role || 'Guest'}</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </>
              )}
            </button>

            {isUserMenuOpen && isOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors text-sm"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="hidden md:flex items-center justify-center h-16 border-t border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Collapse sidebar"
          >
            <Menu size={20} />
          </button>
        )}
      </aside>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden md:flex fixed left-0 top-0 items-center justify-center w-20 h-20 text-neutral-400 hover:text-white transition-colors z-40"
          title="Expand sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  );
};
'''

filepath = 'D:/BMAD-METHOD/dataspace/apps/frontend/src/components/Sidebar.tsx'
with open(filepath, 'w') as f:
    f.write(sidebar_content)

print("Updated Sidebar.tsx with Administration section")
print("New section: Administration (Users, Audit Logs)")
