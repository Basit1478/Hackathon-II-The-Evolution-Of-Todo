// components/landing/Hero.tsx
"use client";

import Link from "next/link";
import { Bot, ArrowRight, Sparkles, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Hero() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-secondary-950 dark:via-secondary-900 dark:to-primary-950/30">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-800/20" />
        <div className="absolute -right-40 top-1/2 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/20" />
      </div>

      {/* Navigation Header */}
      <nav className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-secondary-900 dark:text-white">TaskMaster AI</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-secondary-600 dark:text-secondary-400 sm:block">
                  Welcome, {user?.name}
                </span>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-100 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                >
                  <Bot className="h-4 w-4" />
                  Chat
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg border border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-100 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-100 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content - rest remains same */}
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 dark:border-primary-800 dark:bg-primary-900/50">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">AI-Powered Task Management</span>
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-6xl lg:text-7xl">
            Manage Tasks with{" "}
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Natural Language</span>
          </h1>
          <p className="mb-10 max-w-2xl text-xl text-secondary-600 dark:text-secondary-400">
            Just tell TaskMaster what you need to do. No forms, no buttons — just natural conversation with an AI that understands you.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary-500 bg-white px-8 py-4 text-lg font-semibold text-primary-600 shadow-lg transition-all hover:bg-primary-50 hover:shadow-xl dark:bg-secondary-900 dark:text-primary-400 dark:hover:bg-secondary-800"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  View Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  href="/chat" 
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30"
                >
                  <Bot className="h-5 w-5" />
                  Start Chatting
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </>
            ) : (
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30"
              >
                <Bot className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}