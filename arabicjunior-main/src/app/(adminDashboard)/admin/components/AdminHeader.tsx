"use client";

import { LogOut, Settings, User } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MobileSidebar } from "@/components/admin/Sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import NotificationPopover from "./NotificationPopover";

const AdminHeader = () => {
  const router = useRouter();
  const { user } = useAuthAdmin()
  // const handleLogout = async () => {
  //   try {
  //     const response = await fetch(
  //       process.env.NEXT_PUBLIC_API_BASE_URL + "/admin/logout",
  //       {
  //         method: "GET",
  //         credentials: "include",
  //       }
  //     );

  //     const result = await response.json();

  //     toast.success(result.message || "Logged out successfully.");
  //     router.push("/");
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //     toast.error("Logout failed!");
  //   }
  // };

  return (
    <React.Fragment>
      <header className="flex items-center justify-between px-6 py-3 w-full max-w-full bg-white">
        <div>
          <MobileSidebar />
        </div>
        <div className="gap-2 flex items-center">
          {/* <ModeToggle /> */}

          {/* <Button size={'icon'} variant={'ghost'}>
            <Mail />
          </Button> */}
          {/* <Button size={'icon'} variant={'ghost'}> */}
          <NotificationPopover />
          {/* </Button> */}
          <div aria-describedby="profile" className="ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none focus:ring-[2px] focus:ring-offset-2 focus:ring-primary rounded-full">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-xs">AU</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  router.push("/admin/settings");
                }}>
                  <User className="h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  router.push("/admin/settings");
                }}>
                  <Settings className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => {
                  localStorage.removeItem("jwtToken");
                  localStorage.removeItem("user");
                  toast.success("Logged Out!");
                  router.replace("/");
                }}>
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>


          {/* old code */}
          {/* account */}
          {/* <div aria-describedby="profile">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="flex items-center text-2xl cursor-pointer">
                  <CircleUserRound />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Billing
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Settings
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Keyboard shortcuts
                    <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("jwtToken");
                    toast.success("Logged Out!");
                    router.replace("/");
                  }}
                >
                  Log out
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </div>
      </header>
    </React.Fragment>
  );
};

export default AdminHeader;
