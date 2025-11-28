import { useState } from 'react';
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
} from 'lucide-react';
import { useAuthStore } from '@stores/auth-store';
import { useNotificationStore } from '@stores/notification-store';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/participants', label: 'Participants', icon: Users },
    { path: '/datasets', label: 'Datasets', icon: Database },
    { path: '/policies', label: 'Policies', icon: Shield },
    { path: '/contracts', label: 'Contracts', icon: FileText },
    { path: '/connector', label: 'Connector', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-neutral-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="font-bold">D</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">Dataspace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${
                  isActive(path)
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Right side - Notifications & User */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-neutral-300 hover:text-white">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-error rounded-full text-xs flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm">{user?.name || 'Guest'}</span>
              <button
                onClick={logout}
                className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-neutral-300 hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                  isActive(path)
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
