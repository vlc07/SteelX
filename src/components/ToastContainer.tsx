import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  notifications: Notification[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications }) => {
  const getIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`${getBackgroundColor(notification.type)} border p-4 rounded-md shadow-md flex items-start gap-3 min-w-[300px] max-w-md animate-slide-in`}
        >
          {getIcon(notification.type)}
          <div className="flex-1">{notification.message}</div>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};