"use client";

import { Sidebar } from "./sidebar";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import { SidebarProvider } from "./sidebar-context";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen">
      {!isLoginPage && <Sidebar />}
      <div
        className={isLoginPage ? "" : "transition-all duration-300"}
        style={{
          minHeight: isLoginPage ? "auto" : "100vh",
          marginLeft: isLoginPage ? "0" : isCollapsed ? "80px" : "200px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}

