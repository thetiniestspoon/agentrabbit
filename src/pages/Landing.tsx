import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import MeetTheHelpers from "@/components/landing/MeetTheHelpers";
import PricingBlock from "@/components/landing/PricingBlock";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <HowItWorks />
      <MeetTheHelpers />
      <PricingBlock />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}
