import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotificationStore } from '@stores/notification-store';

const iconMap = {
  info: <Info size={20} />,
  success: <CheckCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  error: <AlertCircle size={20} />,
};

const colorClasses = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

export const NotificationToast = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
  };
  onRemove: () => void;
}

const NotificationItem = ({ notification, onRemove }: NotificationItemProps) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div
      className={`
        border rounded-lg p-4 flex gap-3 shadow-lg animate-in fade-in slide-in-from-right-4
        ${colorClasses[notification.type]}
      `}
    >
      <div className="flex-shrink-0">{iconMap[notification.type]}</div>
      <div className="flex-1">
        <h3 className="font-semibold">{notification.title}</h3>
        <p className="text-sm mt-1">{notification.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};
