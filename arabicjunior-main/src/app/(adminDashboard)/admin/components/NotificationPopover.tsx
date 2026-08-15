"use client";

import { Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button-2";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const dummyNotifications = [
    { id: 1, title: "New user registered", date: "10:00 AM", unread: true },
    { id: 2, title: "Server restarted", date: "09:45 AM", unread: false },
    { id: 3, title: "New comment on blog", date: "Yesterday 08:30 PM", unread: true },
    { id: 4, title: "Payment received", date: "Yesterday 07:00 PM", unread: false },
    { id: 5, title: "Weekly report ready", date: "2 days ago", unread: false },
];

export default function NotificationPopover() {
    return (
        <div className="flex gap-2">
            {/* Mail */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                        <Mail />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-80 rounded-lg shadow-lg p-2 bg-white border border-gray-200"
                >
                    <DropdownMenuLabel className="text-base font-semibold px-3 py-2">
                        Messages
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                        {dummyNotifications.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                className="flex justify-between items-start gap-2 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    {item.unread && <span className="w-2 h-2 bg-green-500 rounded-full mt-1" />}
                                    <span className="text-sm font-medium">{item.title}</span>
                                </div>
                                <span className="text-xs text-gray-400">{item.date}</span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                        <Bell />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-80 rounded-lg shadow-lg p-2 bg-white border border-gray-200"
                >
                    <DropdownMenuLabel className="text-base font-semibold px-3 py-2">
                        Notifications
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                        {dummyNotifications.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                className="flex justify-between items-start gap-2 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    {item.unread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
                                    <span className="text-sm font-medium">{item.title}</span>
                                </div>
                                <span className="text-xs text-gray-400">{item.date}</span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
