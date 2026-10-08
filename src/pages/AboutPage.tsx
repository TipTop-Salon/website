import React from 'react';
import { Sparkles, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { getImageUrl, handleImageError, CDN_IMAGES } from '../lib/imageHelper';

export const AboutPage: React.FC = () => {
  const { settings, navigate, openBookingModal } = useSalon();

  const pillars = [
    {
      title: 'Precision Over Speed',
      description: 'We allocate generous, unhurried appointments so that our master artists never rush a cut, color transition, or cuticle treatment.'
    },
    {
      title: 'Clean Formulation Science',
      description: 'We partner exclusively with low-chemical, botanical-rich, and cruelty-free manufacturers who respect human biology and hair cuticle integrity.'
    },
    {
      title: 'Serene Spatial Sanctuary',
      description: 'Our salon environment is intentionally acoustic-balanced, with natural air purification and private styling stations free of chaotic chatter.'
    }
  ];

  return (
    <div className="bg-[#FAFAFB] text-[#1C1221]">
      {/* Header Banner */}
      <section className="bg-[#1C1221] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#32223D]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#E5A93C] text-xs uppercase tracking-[0.25em] font-semibold block">
            Our Atelier Ethos
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight">
            {settings.aboutHeroTitle || 'The Philosophy of Tiptop'}
          </h1>
          <p className="text-base text-[#DDD7E3] leading-relaxed max-w-2xl mx-auto font-light">
            {settings.aboutHeroSubtitle ||
              'Founded on the conviction that true beauty emerges when masterful technique is paired with genuine hospitality and unhurried craftsmanship.'}
          </p>
        </div>
      </section>

      {/* Story & Founders Section */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Story Prose */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[#7B2D97] text-xs uppercase tracking-widest font-semibold block">
              The Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1221] font-light leading-snug">
              {settings.aboutStoryHeadline || 'From Passion Project to Premier Boutique Atelier'}
            </h2>
            <p className="text-sm text-[#6B6175] leading-relaxed whitespace-pre-line">
              {settings.aboutStoryBody ||
                'Tiptop Shears and Nails began with a singular goal: to create a modern salon experience where guests never feel rushed through an assembly line. We set out to build an intimate space where Japanese high-carbon shears, European builder gel chemistry, and organic botanical trichology coexist under one roof.'}
            </p>

            <div className="pt-2 flex items-center gap-6 text-xs text-[#1C1221] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7B2D97]" />
                <span>100% Autoclave Sterilized</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7B2D97]" />
                <span>Cruelty-Free Botanical Formulations</span>
              </div>
            </div>
          </div>

          {/* Right Column: Imagery */}
          <div className="lg:col-span-6">
            <div className="relative rounded-lg overflow-hidden border border-[#ECEBF0] shadow-xl">
              <img
                src={getImageUrl(CDN_IMAGES.interiorReception)}
                alt="Tiptop Salon Interior and Reception"
                className="w-full h-full object-cover"
                onError={handleImageError}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="bg-white border-y border-[#ECEBF0] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[#7B2D97] text-xs uppercase tracking-widest font-semibold block">
              Foundational Standards
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1221] font-light">
              Our Triad of Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-8 rounded-lg bg-[#FAFAFB] border border-[#ECEBF0] hover:border-[#7B2D97]/40 transition-colors space-y-3"
              >
                <span className="font-serif text-3xl font-light text-[#E5A93C] block">
                  0{idx + 1}.
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#1C1221]">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#6B6175] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Invitation Banner */}
      <section className="bg-[#1C1221] text-white py-16 px-4 text-center border-t border-[#32223D]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="font-serif text-3xl sm:text-4xl font-light">
            Ready to Experience the Tiptop Standard?
          </h3>
          <p className="text-sm text-[#DDD7E3] leading-relaxed">
            Reserve your bespoke styling session today. New clients enjoy 20% off during their initial visit.
          </p>
          <button
            onClick={() => openBookingModal()}
            className="px-8 py-3.5 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-widest font-semibold rounded shadow transition-colors cursor-pointer"
          >
            Book Your Consultation
          </button>
        </div>
      </section>
    </div>
  );
};
