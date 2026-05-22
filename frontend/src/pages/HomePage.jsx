import HeroSection from "../sections/HeroSection.jsx";
import FeaturesSection from "../sections/FeaturesSection.jsx";
import TestimonialSection from "../sections/TestimonialSection.jsx";
import PricingSection from "../sections/PricingSection.jsx";
import ContactSection from "../sections/ContactSection.jsx";
import CTASection from "../sections/CTASection.jsx";

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <TestimonialSection />
            <PricingSection />
            <ContactSection />
            <CTASection />
        </>
    );
}
