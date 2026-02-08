"use client";

import Link from "next/link";
import { Bot, Home, Plus, LogOut, User, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  userName?: string;
  onNewChat?: () => void;
  onMenuClick?: () => void;
}

export function ChatHeader({ userName, onNewChat, onMenuClick }: ChatHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle (Mobile) */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Home Link */}
          <Link 
            href="/dashboard" 
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>

          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                TaskMaster AI
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your AI assistant
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          {onNewChat && (
            <Button
              onClick={onNewChat}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          )}

          {/* User Info */}
          {userName && (
            <div className="hidden items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 md:flex dark:bg-gray-800">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <User className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {userName}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <Button
            onClick={logout}
            variant="ghost"
            size="icon"
            title="Logout"
            className="text-gray-600 dark:text-gray-400"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}