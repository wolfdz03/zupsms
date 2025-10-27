"use client";

import { Sidebar } from "./sidebar";
import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen">
      {!isLoginPage && <Sidebar />}
      <div
        className={isLoginPage ? "" : "lg:ml-[300px]"}
        style={isLoginPage ? {} : { minHeight: "100vh" }}
      >
        {children}
      </div>
    </div>
  );
}

