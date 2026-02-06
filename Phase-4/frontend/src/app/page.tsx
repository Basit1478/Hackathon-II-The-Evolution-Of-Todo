import { Hero, Features, HowItWorks, CTA } from '@/components/landing';

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </div>
  );
}
