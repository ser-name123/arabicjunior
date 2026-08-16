"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Mail, GraduationCap, UserCheck, Briefcase, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button-2";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AppNotification {
  _id: string;
  type: "contact" | "trial" | "teacher" | "job" | "support";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationPopover() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getToken = () => {
    if (typeof window === "undefined") return "";
    const rawToken = localStorage.getItem("jwtToken") || localStorage.getItem("token") || "";
    if (!rawToken) return "";
    try {
      return JSON.parse(rawToken);
    } catch (e) {
      return rawToken.replace(/^"|"$/g, "");
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/admin/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000); // Fast 5s auto polling for instant updates
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id?: string, markAll = false) => {
    try {
      const token = getToken();
      if (!token) return;
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      await fetch(`${apiBase}/admin/notifications/mark-read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, markAll }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.isRead) {
      handleMarkAsRead(item._id);
    }
    if (item.link) {
      router.push(item.link);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "contact":
      case "support":
        return <Mail className="h-4 w-4 text-blue-500 shrink-0" />;
      case "trial":
        return <GraduationCap className="h-4 w-4 text-orange-500 shrink-0" />;
      case "teacher":
        return <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />;
      case "job":
        return <Briefcase className="h-4 w-4 text-purple-500 shrink-0" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500 shrink-0" />;
    }
  };

  const contactNotifications = notifications.filter((n) => n.type === "contact" || n.type === "support");
  const unreadContactCount = contactNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex items-center gap-1.5">
      {/* 1. Contact / Support Messages Mail Popover */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="relative hover:bg-neutral-100 rounded-full">
            <Mail className="h-5 w-5 text-neutral-600" />
            {unreadContactCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
                {unreadContactCount > 9 ? "9+" : unreadContactCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 sm:w-96 rounded-xl shadow-xl p-0 bg-white border border-neutral-200" align="end">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-800">Form Messages</span>
            </div>
            {unreadContactCount > 0 && (
              <button
                onClick={() => handleMarkAsRead(undefined, true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark read
              </button>
            )}
          </div>
          <DropdownMenuSeparator className="m-0" />
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
            {contactNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 font-medium">No contact messages yet</div>
            ) : (
              contactNotifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start gap-3 p-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                    !item.isRead ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-blue-100/60 mt-0.5">{getNotificationIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-semibold truncate ${!item.isRead ? "text-blue-950 font-bold" : "text-slate-700"}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] text-neutral-400 shrink-0">{formatTime(item.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.message}</p>
                  </div>
                  {!item.isRead && <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 2. All Admin Notifications Bell Popover */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="relative hover:bg-neutral-100 rounded-full">
            <Bell className="h-5 w-5 text-neutral-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow animate-pulse px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 sm:w-96 rounded-xl shadow-xl p-0 bg-white border border-neutral-200" align="end">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-bold text-slate-800">Admin Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-extrabold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => handleMarkAsRead(undefined, true)}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <DropdownMenuSeparator className="m-0" />
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 font-medium">No notifications yet</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start gap-3 p-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                    !item.isRead ? "bg-orange-50/30" : ""
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 mt-0.5 shrink-0">{getNotificationIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs ${!item.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"} truncate`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] text-neutral-400 shrink-0">{formatTime(item.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.message}</p>
                  </div>
                  {!item.isRead && <span className="h-2 w-2 rounded-full bg-orange-500 mt-2 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
