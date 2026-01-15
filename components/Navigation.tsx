"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/english", label: "ダッシュボード", icon: Home },
  { href: "/vocabulary", label: "単語帳", icon: BookOpen },
  { href: "/settings", label: "設定", icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const isSpillover = pathname?.startsWith("/spillover");

  if (isSpillover) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/english" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              英語学習アプリ
            </span>
          </Link>
          
          <div className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

