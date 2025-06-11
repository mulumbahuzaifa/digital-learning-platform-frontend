import React, { useRef, useState } from "react";
import { createPopper } from "@popperjs/core";
import { BellIcon, CheckIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'assignment' | 'announcement' | 'system';
}

const NotificationDropdown: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sample notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Assignment Posted',
      message: 'Math homework #5 has been assigned',
      time: '10 min ago',
      read: false,
      type: 'assignment'
    },
    {
      id: '2',
      title: 'Grade Updated',
      message: 'Your Science project grade is now available',
      time: '1 hour ago',
      read: false,
      type: 'announcement'
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Scheduled maintenance this weekend',
      time: '2 days ago',
      read: true,
      type: 'system'
    }
  ]);

  const toggleDropdown = () => {
    if (dropdownOpen) {
      setDropdownOpen(false);
    } else {
      setDropdownOpen(true);
      if (btnRef.current && popoverRef.current) {
        createPopper(btnRef.current, popoverRef.current, {
          placement: 'bottom-end'
        });
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggleDropdown}
        className="p-1 rounded-full text-blueGray-500 hover:text-blueGray-700 focus:outline-none relative"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      <div
        ref={popoverRef}
        className={`${dropdownOpen ? 'block' : 'hidden'} bg-white text-base z-50 float-left py-2 list-none text-left rounded-lg shadow-xl min-w-80`}
      >
        <div className="px-4 py-2 border-b border-blueGray-200">
          <h3 className="font-medium text-blueGray-800">Notifications</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`px-4 py-3 hover:bg-blueGray-50 ${!notification.read ? 'bg-blueGray-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-blueGray-800">
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-blueGray-500 hover:text-blueGray-700"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-blueGray-600 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-blueGray-500 mt-2">
                  {notification.time}
                </p>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-sm text-blueGray-500">
              No new notifications
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-blueGray-200 text-center">
          <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;