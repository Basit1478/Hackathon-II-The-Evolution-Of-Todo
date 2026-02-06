"use client";

import { MessageSquare, ListTodo, CheckCircle2, Edit3, Brain, Zap, Sparkles } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "Natural Language Input", description: "Just type what you want to do. No forms, no learning curve.", color: "primary" },
  { icon: ListTodo, title: "Smart Task Recognition", description: "AI automatically detects when you want to add, view, or modify tasks.", color: "emerald" },
  { icon: CheckCircle2, title: "Quick Task Completion", description: "Say 'done with task 1' and TaskMaster marks it complete instantly.", color: "amber" },
  { icon: Edit3, title: "Easy Updates", description: "Change task titles or descriptions with simple commands.", color: "blue" },
  { icon: Brain, title: "Context Awareness", description: "TaskMaster remembers your conversation context.", color: "purple" },
  { icon: Zap, title: "Lightning Fast", description: "Powered by Gemini AI, responses arrive in seconds.", color: "rose" },
];

const colorMap: Record<string, { bg: string; icon: string }> = {
  primary: { bg: "bg-primary-100 dark:bg-primary-900/50", icon: "text-primary-600 dark:text-primary-400" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/50", icon: "text-emerald-600 dark:text-emerald-400" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/50", icon: "text-amber-600 dark:text-amber-400" },
  blue: { bg: "bg-blue-100 dark:bg-blue-900/50", icon: "text-blue-600 dark:text-blue-400" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/50", icon: "text-purple-600 dark:text-purple-400" },
  rose: { bg: "bg-rose-100 dark:bg-rose-900/50", icon: "text-rose-600 dark:text-rose-400" },
};

export function Features() {
  return (
    <section id="features" className="relative bg-white py-24 dark:bg-secondary-900">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 dark:border-primary-800 dark:bg-primary-900/50">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Powerful Features</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-secondary-900 dark:text-white sm:text-4xl">Everything you need to stay productive</h2>
          <p className="mx-auto max-w-2xl text-lg text-secondary-600 dark:text-secondary-400">TaskMaster AI combines natural language processing with intuitive task management.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const colors = colorMap[feature.color];
            return (
              <div key={index} className="group relative overflow-hidden rounded-2xl border border-secondary-200/50 bg-white/50 p-8 backdrop-blur-sm transition-all hover:shadow-xl dark:border-secondary-700/50 dark:bg-secondary-800/50">
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${colors.bg}`}>
                  <feature.icon className={`h-7 w-7 ${colors.icon}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-secondary-900 dark:text-white">{feature.title}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
