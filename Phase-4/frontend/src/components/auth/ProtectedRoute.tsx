"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires authentication; if false, redirects away if authenticated
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to login if authentication is required but user is not authenticated
        router.push("/");
      } else if (!requireAuth && isAuthenticated) {
        // Redirect away if user is authenticated but route should be for non-authenticated users
        router.push("/chat");
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated and auth is required, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If user is authenticated but auth is not required, don't render children
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
