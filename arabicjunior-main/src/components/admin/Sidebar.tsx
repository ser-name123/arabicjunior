"use client";

import {
  HomeIcon,
  Mail,
  MenuIcon,
  MessageSquareQuote,
  Newspaper,
  SettingsIcon,
  UserCheck2Icon,
  Users2Icon,
  GraduationCap,
  BarChart3,
  Presentation,
  Tags,
  Briefcase,
  MessageSquare,
  Compass,
  Layout,
  Sparkles,
  BookOpen,
} from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button-2";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import Logo from "../Logo";


const menuItems = [
  { href: '/admin', label: "Home", icon: HomeIcon },
  {
    href: '/admin/users',
    label: "Trial Users",
    icon: Users2Icon,
  },
  {
    href: "/admin/registered-users",
    label: "Registered Users",
    icon: UserCheck2Icon,
  },
  {
    href: "/admin/school-logos",
    label: "School Logos",
    icon: GraduationCap,
  },
  {
    href: "/admin/stats",
    label: "Academy Stats",
    icon: BarChart3,
  },
  {
    href: "/admin/newsletters",
    label: "Newsletters",
    icon: Mail,
  },
  {
    href: "/admin/blogs",
    label: "Blogs",
    icon: Newspaper,
  },
  {
    href: "/admin/teachers",
    label: "Teachers",
    icon: Presentation,
  },
  {
    href: "/admin/pricing",
    label: "Pricing",
    icon: Tags,
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
  },
  {
    href: "/admin/jobs",
    label: "Jobs Manager",
    icon: Briefcase,
  },
  {
    href: "/admin/chatbot",
    label: "Chatbot Leads",
    icon: MessageSquare,
  },
  {
    href: "/admin/trial-landing",
    label: "Trial Landing",
    icon: Compass,
  },
  {
    href: "/admin/homepage-banner",
    label: "Homepage Banner",
    icon: Sparkles,
  },
  {
    href: "/admin/about-juniors",
    label: "About Section",
    icon: BookOpen,
  },
  {
    href: "/admin/contact",
    label: "Contact Messages",
    icon: Mail,
  },
  {
    href: "/admin/footer",
    label: "Footer Settings",
    icon: Layout,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: SettingsIcon,
  }
];

function DesktopSidebar() {
  const pathname = usePathname();

  const routes = menuItems;

  return (
    <div className="hidden relative md:block min-w-[240px] max-w-[240px] min-h-screen overflow-y-auto w-full bg-white border-r border-neutral-100 shadow-sm shrink-0">
      <div className="flex items-center justify-center gap-2 p-5 border-b border-neutral-50 mb-4 bg-white">
        <Logo />
      </div>

      <div className="flex flex-col px-3 gap-1.5 bg-white">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#FF60A8]/10 to-[#FB6238]/10 text-[#FB6238] shadow-sm font-bold border-l-4 border-[#FB6238]"
                  : "text-neutral-600 hover:text-[#FB6238] hover:bg-[#FB6238]/5"
              }`}
            >
              <route.icon size={18} className={isActive ? "text-[#FB6238]" : "text-neutral-400"} />
              {route.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();

  const routes = menuItems;

  return (
    <div className="block md:hidden border-separate bg-background">
      <nav className="flex items-center justify-between md:px-8">
        <Sheet open={isOpen} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="text-black">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[280px] space-y-4 bg-white p-5 text-black"
            side={"left"}
          >
            <div className="flex items-center justify-start pb-4 border-b border-neutral-100 mb-2">
              <Logo />
            </div>
            <div className="flex flex-col gap-1.5">
              {routes.map((route) => {
                const isActive = pathname === route.href;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#FF60A8]/10 to-[#FB6238]/10 text-[#FB6238] shadow-sm font-bold border-l-4 border-[#FB6238]"
                        : "text-neutral-600 hover:text-[#FB6238] hover:bg-[#FB6238]/5"
                    }`}
                  >
                    <route.icon size={18} className={isActive ? "text-[#FB6238]" : "text-neutral-400"} />
                    {route.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}

export default DesktopSidebar;
