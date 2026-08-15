'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const ADMIN_SIDEBAR_NAV_ITEMS: { label: string; url: string }[] = [
  {
    label: "Overview",
    url: "/admin",
  },
  {
    label: "Users",
    url: "/admin/users",
  },
];


const AdminSidebar = () => {

    const currentPath = usePathname();
    console.log(currentPath);

  return (
    <React.Fragment>
      <div
        aria-describedby="admin-sidebar"
        className="w-52 flex-shrink-0 flex-grow-0 basis-auto"
      >
        <ul className="flex items-start flex-col gap-y-1 w-full">
          {ADMIN_SIDEBAR_NAV_ITEMS.map((navItem, index) => (
            <li key={index} className="flex items-center w-full">
              <Link
                href={navItem.url}
                className={cn(' py-2 px-4 rounded-md w-full transition-colors ease-in-out duration-300 hover:bg-neutral-100',
                    currentPath === navItem.url ? 'bg-neutral-100' : 'bg-transparent',
                )}
              >
                {navItem.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
};

export default AdminSidebar;
