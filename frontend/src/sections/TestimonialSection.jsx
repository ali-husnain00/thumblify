import SectionTitle from "../components/SectionTitle.jsx";
import TestimonialCard from "../components/TestimonialCard.jsx";
import { testimonialsData } from "../data/testimonial.js";
import Marquee from "react-fast-marquee";

export default function TestimonialSection() {
    return (
        <div id="testimonials" className="px-4 md:px-16 lg:px-24 xl:px-32">
            <SectionTitle text1="Testimonials" text2="Loved by creators" text3="Real feedback from people who swapped slow design workflows for AI thumbnails that fit their niche." />

            <Marquee className="max-w-5xl mx-auto mt-11" gradient={true} speed={25} gradientColor="#000">
                <div className="flex items-center justify-center py-5 overflow-hidden">
                    {[...testimonialsData, ...testimonialsData].map((testimonial, index) => (
                        <TestimonialCard key={index} index={index} testimonial={testimonial} />
                    ))}
                </div>
            </Marquee>
            <Marquee className="max-w-5xl mx-auto" gradient={true} speed={25} direction="right" gradientColor="#000">
                <div className="flex items-center justify-center py-5 overflow-hidden">
                    {[...testimonialsData, ...testimonialsData].map((testimonial, index) => (
                        <TestimonialCard key={index} index={index} testimonial={testimonial} />
                    ))}
                </div>
            </Marquee>

        </div>
    );
}
