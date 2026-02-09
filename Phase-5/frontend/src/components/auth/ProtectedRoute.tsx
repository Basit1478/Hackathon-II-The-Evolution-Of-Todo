"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bot } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading state - Modern design
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Logo */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
          
          {/* Loading Text */}
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Loading...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we set things up
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - Show nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - Show protected content
  return <>{children}</>;
}