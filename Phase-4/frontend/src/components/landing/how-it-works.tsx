"use client";

import { MessageSquare, Cpu, CheckCircle } from "lucide-react";

const steps = [
  { icon: MessageSquare, title: "Type Your Request", description: "Just describe what you want to do in plain English." },
  { icon: Cpu, title: "AI Processes", description: "TaskMaster AI understands your intent and executes the right action." },
  { icon: CheckCircle, title: "Task Complete", description: "Your task is managed instantly with a friendly confirmation." },
];

export function HowItWorks() {
  return (
    <section className="bg-secondary-50 py-24 dark:bg-secondary-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary-900 dark:text-white sm:text-4xl">How It Works</h2>
          <p className="mx-auto max-w-2xl text-lg text-secondary-600 dark:text-secondary-400">Three simple steps to effortless task management</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 text-white">
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-secondary-900 dark:text-white">{step.title}</h3>
              <p className="text-secondary-600 dark:text-secondary-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
