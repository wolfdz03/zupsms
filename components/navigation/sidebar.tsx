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
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

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
          "fixed left-0 top-0 h-screen bg-white border-r-2 border-neutral-200 z-40 transition-transform duration-300 lg:translate-x-0 shadow-elevated",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ width: "300px" }}
      >
        <div className="flex flex-col h-full p-8">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center group">
              <img 
                src="/logo.svg" 
                alt="ZupDeCo" 
                className="h-8 w-auto group-hover:opacity-80 transition-smooth"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-xl text-base font-semibold transition-card",
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-card"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-white")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-8" />

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-4 px-5 py-4 text-base font-semibold text-neutral-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-smooth h-auto"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
}

