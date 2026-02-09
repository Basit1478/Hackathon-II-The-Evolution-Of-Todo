"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Moon, Sun, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export function Header({ 
  title = "Dashboard", 
  subtitle,
  onMenuClick,
  showMenu = false
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  // Check initial theme on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    // Save preference to localStorage
    localStorage.setItem("theme", !isDark ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showMenu && onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Quick Action Button */}
          <Button
            size="sm"
            className="hidden sm:flex gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </div>
    </header>
  );
}