"use client";

import {
  HomeIcon,
  Mail,
  MenuIcon,
  Newspaper,
  SettingsIcon,
  UserCheck2Icon,
  Users2Icon,
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
    href: "/admin/settings",
    label: "Settings",
    icon: SettingsIcon,
  }
];

function DesktopSidebar() {
  const pathname = usePathname();

  const routes = menuItems;

  return (
    // <SidebarProvider>
    <div className="hidden relative md:block min-w-[230px] max-w-[230px] min-h-screen overflow-hidden w-full bg-primary/5 dark:bg-secondary/30 dark:text-foreground text-muted-foreground border-r-0 border-separate">
      <div className="flex items-center justify-center gap-2 p-3">
        <Logo />
      </div>

      <div className="flex flex-col p-2 gap-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={buttonVariants({
              variant:
                pathname === route.href
                  ? "sidebarActiveItem"
                  : "sidebarItem",
            })}
          >
            <route.icon size={20} />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
    // </SidebarProvider>
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
            <Button variant={"ghost"} size={"icon"}>
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[300px] sm:w-[540px] space-y-4"
            side={"left"}
          >
            <Logo />
            <div className="flex flex-col gap-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={buttonVariants({
                    variant:
                      pathname === route.href
                        ? "sidebarActiveItem"
                        : "sidebarItem",
                  })}
                >
                  <route.icon size={20} />
                  {route.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}

export default DesktopSidebar;
