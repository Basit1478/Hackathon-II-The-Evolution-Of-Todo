"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, MessageSquare, ListTodo, LayoutDashboard, Settings, ChevronLeft, ChevronRight, Sparkles, Home, Plus, MoreHorizontal, PlusCircle, FileText, FolderPlus, Star, History, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuButton } from "@/components/ui/menu-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: ListTodo, label: "Tasks", href: "/dashboard/tasks" },
];

// Additional menu items for the Claude.ai-like experience
const additionalActions = [
  { icon: PlusCircle, label: "New Chat", href: "/chat" },
  { icon: FileText, label: "New Task", href: "/dashboard/tasks" },
  { icon: FolderPlus, label: "New Project", href: "/dashboard/projects" },
];

const aiFeatures = [
  { icon: Sparkles, label: "AI Assistant", href: "/chat" },
  { icon: Star, label: "Favorites", href: "/favorites" },
  { icon: History, label: "History", href: "/history" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-screen flex-col border-r border-secondary-200/50 bg-white/70 backdrop-blur-xl transition-all", collapsed ? "w-20" : "w-64")}>
      <div className="flex h-16 items-center justify-between border-b border-secondary-200/50 px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600"><Bot className="h-6 w-6 text-white" /></div>
          {!collapsed && <span className="text-lg font-bold">Assistant<span className="text-primary-500">AI</span></span>}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="flex h-8 w-8 items-center justify-center rounded-lg">{collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}</button>
      </div>

      {/* AI Status Card */}
      <div className="p-4">
        <div className={cn("flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary-50 to-emerald-50 p-3", collapsed && "justify-center")}>
          <Sparkles className="h-5 w-5 text-primary-500" />
          {!collapsed && (
            <div>
              <p className="text-sm font-medium">AI Ready</p>
              <p className="text-xs text-secondary-500">Gemini 2.0</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium group",
                isActive ? "bg-primary-100 text-primary-700" : "text-secondary-600 hover:bg-secondary-100",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <MenuButton className="h-6 w-6" />
                </div>
              )}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="my-2 h-px bg-secondary-200/50"></div>

        {/* Quick Actions */}
        {!collapsed && (
          <>
            <div className="mb-2 px-3 py-1 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
              Quick Actions
            </div>
            {additionalActions.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    isActive ? "bg-primary-100 text-primary-700" : "text-secondary-600 hover:bg-secondary-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="my-2 h-px bg-secondary-200/50"></div>

            <div className="mb-2 px-3 py-1 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
              AI Features
            </div>
            {aiFeatures.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    isActive ? "bg-primary-100 text-primary-700" : "text-secondary-600 hover:bg-secondary-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-secondary-200/50 p-4">
        <div className={cn("flex items-center gap-3 rounded-xl bg-secondary-50 p-3", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white">U</div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">Guest User</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-secondary-500">Free Plan</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-md hover:bg-secondary-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {collapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md hover:bg-secondary-200 ml-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </aside>
  );
}
