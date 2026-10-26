import { Navbar } from "@/components/shell/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Showcase, VoiceBand } from "@/components/landing/showcase";
import { ClosingCTA, SiteFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-base">
      <Navbar variant="landing" />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <VoiceBand />
        <ClosingCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
