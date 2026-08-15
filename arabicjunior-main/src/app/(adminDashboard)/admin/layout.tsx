import "../../globals.css";
import React from "react";
import AdminHeader from "./components/AdminHeader";
import ProtectedLayout from "@/providers/ProtectedLayout";
import { Separator } from "@/components/ui/separator";
import DesktopSidebar from "@/components/admin/Sidebar";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

const AdminDashboardLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ProtectedLayout>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <div className="flex min-h-screen">
            {/* <div className="min-h-screen"> */}
            <DesktopSidebar />
            {/* </div> */}

            <div className="flex flex-col flex-1 min-h-screen overflow-x-hidden">
              <AdminHeader />

              <Separator />

              <div className="flex-1 overflow-x-hidden relative">
                <div className="p-4 md:container space-y-4 py-4 text-accent-foreground max-w-full">
                  {children}
                </div>
              </div>
            </div>
          </div>



          {/* old admin layout for backup */}

          {/* <div aria-describedby="admin-layout">
        <AdminHeader />

        <div className="container-fluid">
          <div
            aria-describedby="wrapper"
            className="flex items-start gap-x-5 pt-6"
          >
            <AdminSidebar />
            <div
              aria-describedby="page-parent"
              className="bg-gray-50 overflow-hidden border border-b-0 border-gray-200 rounded-t-lg flex-1 h-[calc(100vh-80px)] p-3"
            >
              {children}
            </div>
          </div>
        </div>
      </div> */}
        </TooltipProvider>
      </ThemeProvider>
    </ProtectedLayout>
  );
};

export default AdminDashboardLayout;
