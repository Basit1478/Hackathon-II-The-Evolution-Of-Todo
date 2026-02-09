"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, MessageSquare, ListTodo, LayoutDashboard, Settings, Menu, Home, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface MenuBarProps {
  title?: string;
  subtitle?: string;
}

export function MenuBar({ title = "Dashboard", subtitle }: MenuBarProps) {
  const pathname = usePathname();

  // Define top-level navigation items
  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: ListTodo, label: "Tasks", href: "/dashboard/tasks" },
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b border-secondary-200/50 bg-white/70 px-6 backdrop-blur-xl dark:border-secondary-700/50 dark:bg-secondary-900/70">
      {/* Mobile menu button */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ListTodo className="mr-2 h-4 w-4" />
              New Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div>
          <h1 className="text-xl font-semibold text-secondary-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-secondary-500">{subtitle}</p>}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        <Button size="sm" className="gap-2 hidden md:flex">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
        <Button size="sm" className="gap-2 md:hidden">
          <Plus className="h-4 w-4" />
        </Button>

        {/* AI Status Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-50 to-emerald-50 px-3 py-2">
          <Sparkles className="h-4 w-4 text-primary-500" />
          <span className="text-xs font-medium">AI Ready</span>
        </div>

        {/* Menu button should not be wrapped in another button to avoid nested <button> elements */}
        <MenuButton className="h-10 w-10" />
      </div>
    </header>
  );
}