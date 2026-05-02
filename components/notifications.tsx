"use client";

import { useEffect, useState } from "react";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(res => setNotifications(res.data || []));
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>
        🔔
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-[#111] border border-white/10 rounded-xl p-3">
          {notifications.length === 0 && (
            <p className="text-gray-400 text-sm">No notifications</p>
          )}

          {notifications.map((n) => (
            <div key={n.id} className="p-2 rounded bg-white/10 mb-2">
              <p className="font-semibold">{n.title}</p>
              <p className="text-xs text-gray-400">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}