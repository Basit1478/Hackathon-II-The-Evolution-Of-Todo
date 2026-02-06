"use client";

import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-gradient-to-br from-primary-500 to-primary-600 py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">Ready to Transform Your Productivity?</h2>
        <p className="mb-10 text-xl text-primary-100">Start managing your tasks with the power of AI. No sign-up required.</p>
        <Link href="/chat" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary-600 shadow-lg transition-all hover:bg-primary-50">
          <Bot className="h-5 w-5" />
          Start Now
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
