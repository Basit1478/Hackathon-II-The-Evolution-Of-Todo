import { Hero, Features, HowItWorks, CTA } from "@/components/landing";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />

    </main>
  );
}
