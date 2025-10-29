"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  CalendarDays,
  MessageSquare,
  History,
  Users,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useSidebar } from "./sidebar-context";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: Home },
  { name: "Sessions", href: "/sessions", icon: CalendarDays },
  { name: "Étudiants", href: "/students", icon: Users },
  { name: "Tuteurs", href: "/tutors", icon: GraduationCap },
  { name: "SMS Settings", href: "/sms-settings", icon: MessageSquare },
  { name: "Historique", href: "/activity", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  // Don't show sidebar on login page
  if (pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r-2 border-neutral-200 z-40 transition-all duration-300 lg:translate-x-0 shadow-elevated",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-[80px]" : "lg:w-[200px]"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={cn("flex flex-col h-full transition-all duration-300", isCollapsed ? "p-3" : "p-4")}>
          {/* Header with Logo and Toggle */}
          <div className="mb-6 relative">
            <Link href="/" className={cn("flex items-center group", isCollapsed && "justify-center")}>
              <img 
                src="/logo.svg" 
                alt="ZupDeCo" 
                className={cn("h-auto group-hover:opacity-80 transition-smooth", isCollapsed ? "h-6" : "h-7")}
              />
            </Link>
            
            {/* Desktop Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 hover:bg-neutral-100 z-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="text-neutral-600 hover:text-orange-600 transition-colors duration-200">
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronLeft className="h-3 w-3" />
                )}
              </div>
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className={cn("flex-1 space-y-1", isCollapsed && "space-y-2")}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg transition-card group relative focus:outline-none focus:ring-2 focus:ring-orange-500",
                    isCollapsed ? "justify-center px-3 py-2.5" : "px-3 py-2.5",
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-card"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  )}
                  aria-label={isCollapsed ? item.name : undefined}
                  role="menuitem"
                >
                  <div className={cn("text-neutral-600 group-hover:text-orange-600 transition-colors duration-200", isActive && "text-white")}>
                    <item.icon className={cn("shrink-0", isCollapsed ? "w-4 h-4" : "w-4 h-4")} />
                  </div>
                  {!isCollapsed && (
                    <span className={cn("text-sm font-medium truncate group-hover:text-orange-600 transition-colors duration-200", isActive && "text-white")}>
                      {item.name}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap delay-300 shadow-lg">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          <Separator className={cn("my-4", isCollapsed && "my-3")} />

          {/* Logout Button */}
          <div className="relative group">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className={cn(
                "justify-start text-sm font-medium text-neutral-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-smooth h-auto w-full focus:outline-none focus:ring-2 focus:ring-red-500",
                isCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5 gap-3"
              )}
              aria-label={isCollapsed ? "Déconnexion" : undefined}
              role="menuitem"
            >
              <div className="text-neutral-600 group-hover:text-red-600 transition-colors duration-200">
                <LogOut className={cn("shrink-0", isCollapsed ? "w-4 h-4" : "w-4 h-4")} />
              </div>
              {!isCollapsed && (
                <span className="group-hover:text-red-600 transition-colors duration-200">
                  Déconnexion
                </span>
              )}
            </Button>
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap delay-300 shadow-lg">
                Déconnexion
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

