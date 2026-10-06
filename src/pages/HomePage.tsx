import React from 'react';
import { ArrowRight, Scissors, Sparkles, Shield, HeartHandshake, Check, Clock, Calendar } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const HomePage: React.FC = () => {
  const { services, settings, navigate, openBookingModal } = useSalon();

  // Signature Services flagged by admin (isFeatured === true)
  const signatureServices = services.filter((s) => s.isFeatured);
  const featuredServices = signatureServices.length > 0 ? signatureServices.slice(0, 6) : services.slice(0, 3);

  const featureBadges = [
    {
      icon: Scissors,
      title: 'Expert Stylists',
      description: 'Master artisans with specialized certifications in Japanese shears precision & couture gel sculpture.'
    },
    {
      icon: Sparkles,
      title: 'Premium Products',
      description: 'Cruelty-free, botanical-derived hair and nail formulations free of harmful formaldehyde & toluene.'
    },
    {
      icon: Shield,
      title: 'Hygiene First',
      description: 'Medical-grade autoclave sterilization for all metal implements with single-use buffers and files.'
    },
    {
      icon: HeartHandshake,
      title: 'Personalized Care',
      description: 'Individual anatomical consultations tailored to hair texture, lifestyle, and nail health history.'
    }
  ];

  const checklistItems =
    settings.checklistItems && settings.checklistItems.length > 0
      ? settings.checklistItems
      : [
          'Private, low-volume styling stations designed for tranquility',
          'Custom Japanese high-carbon shears tailored to hair texture and grain',
          'European dry Russian cuticle detailing and builder gel overlays',
          'Complimentary consultation with every treatment and tailored aftercare regimen'
        ];

  return (
    <div className="bg-[#FAFAFB] text-[#1C1221]">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#1C1221]">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_salon_ambiance_1790223323507.jpg"
            alt="Tiptop Shears & Nails Luxury Salon Interior"
            className="w-full h-full object-cover object-center brightness-60 contrast-105 transform scale-100 hover:scale-102 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
          />
          {/* Measured Scrim for WCAG AA readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1221] via-[#1C1221]/70 to-[#1C1221]/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="text-[#E5A93C] text-xs uppercase tracking-[0.25em] font-semibold mb-4 inline-block drop-shadow-sm">
            Tiptop Shears & Nails · Haute Beauty Atelier
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.1] mb-6 text-balance">
            Beauty that Reflects <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-[#E5A93C]">Your Style</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#DDD7E3] font-light leading-relaxed mb-10 text-balance">
            Experience bespoke hair sculpting, architectural gel nail artistry, and revitalizing botanical spa therapies in our serene private sanctuary.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openBookingModal()}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-widest font-semibold rounded shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => navigate('/services')}
              className="w-full sm:w-auto px-8 py-3.5 border border-white/20 hover:border-[#E5A93C] bg-white/5 hover:bg-white/10 text-white text-xs uppercase tracking-widest font-medium rounded backdrop-blur-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4 text-[#E5A93C]" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURE BADGES */}
      <section className="border-b border-[#ECEBF0] bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureBadges.map((badge, idx) => {
              const IconComp = badge.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-start p-4 rounded-lg bg-[#FAFAFB] border border-[#ECEBF0] hover:border-[#7B2D97]/40 transition-colors"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#7B2D97]/10 text-[#7B2D97] flex items-center justify-center mb-4">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#1C1221] mb-1.5">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-[#6B6175] leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SERVICES PREVIEW GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[#7B2D97] text-xs uppercase tracking-widest font-semibold block mb-2">
              Curated Offerings
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1221] font-light">
              Signature Salon Services
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/services')}
              className="group text-xs uppercase tracking-widest font-semibold text-[#7B2D97] hover:text-[#8F37AE] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* 3-Column Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-lg border border-[#ECEBF0] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1C1221]">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  referrerPolicy="no-referrer"
                />
                {service.isFeatured && (
                  <div className="absolute top-3 left-3 bg-[#E5A93C] text-[#1C1221] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#1C1221]" />
                    <span>Signature</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-[#1C1221]/90 backdrop-blur-sm text-[#E5A93C] text-xs font-mono font-semibold px-2.5 py-1 rounded">
                  ₱{service.price.toLocaleString()}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-[#82788D] mb-1.5 flex items-center gap-2">
                    <span>{service.categoryLabel}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#E5A93C]" />
                      {service.durationMinutes}m
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#1C1221] group-hover:text-[#7B2D97] mb-2 leading-snug transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs text-[#6B6175] leading-relaxed line-clamp-2 mb-4">
                    {service.description}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#ECEBF0] flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="text-xs font-medium text-[#7B2D97] hover:text-[#8F37AE] underline underline-offset-4 cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => openBookingModal(service)}
                    className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded transition-colors cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BRAND ABOUT SNIPPET ("Where Beauty Meets Expertise") */}
      <section className="bg-[#1C1221] text-white py-20 px-4 sm:px-6 lg:px-8 border-y border-[#32223D]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden shadow-2xl border border-[#32223D]">
                <img
                  src="/src/assets/images/about_salon_interior_1790223381558.jpg"
                  alt="Tiptop Salon Interior Lounge"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden sm:block absolute -bottom-6 -right-6 bg-[#E5A93C] text-[#1C1221] p-5 rounded shadow-xl max-w-xs">
                <span className="block text-xs uppercase tracking-widest font-bold mb-1">
                  Boutique Standard
                </span>
                <p className="font-serif text-sm italic">
                  "{settings.aboutQuote || 'Precision shears cut and bespoke nail art crafted for modern elegance.'}"
                </p>
              </div>
            </div>

            {/* Right Column: Editorial Text & Checklist */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[#E5A93C] text-xs uppercase tracking-widest font-semibold block">
                The Atelier Standard
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl text-white font-light leading-tight">
                {settings.aboutStoryHeadline || 'Where Beauty Meets Expertise'}
              </h2>

              <p className="text-sm text-[#DDD7E3] leading-relaxed">
                {settings.aboutStoryBody ||
                  'At Tiptop Shears and Nails, we reject assembly-line salon culture. We believe personal grooming is a grounding, restorative ritual that deserves dedicated time, masterful precision, and the highest standards of cleanliness.'}
              </p>

              {/* Checklist */}
              <div className="space-y-3 pt-2">
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#291B30] text-[#E5A93C] flex items-center justify-center shrink-0 mt-0.5 border border-[#E5A93C]/30">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-xs text-[#DDD7E3] leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => navigate('/about')}
                  className="px-6 py-3 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-wider font-semibold rounded transition-colors cursor-pointer"
                >
                  Discover Our Story
                </button>
                <button
                  onClick={() => navigate('/gallery')}
                  className="px-5 py-3 border border-[#3D2B4A] hover:border-[#E5A93C] text-[#DDD7E3] hover:text-white text-xs uppercase tracking-wider font-medium rounded transition-colors cursor-pointer"
                >
                  View Transformations
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SPECIAL OFFER BANNER (Customizable in Admin Settings) */}
      {settings.promoEnabled !== false && (
        <section className="bg-[#F8F2FC] border-b border-[#E8DAF0] py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1C1221] text-[#E5A93C] rounded text-xs tracking-wider uppercase font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{settings.promoBadge || 'Exclusive Welcome Privilege'}</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl text-[#1C1221] font-light">
              {settings.promoTitle || `Get ${settings.discountPercentage || 20}% Off On Your First Visit`}
            </h3>

            <p className="text-xs sm:text-sm text-[#6B6175] max-w-xl mx-auto leading-relaxed">
              {settings.promoDescription ||
                'Reserve any signature hair sculpting service or couture nail set and receive an introductory privilege applied at checkout.'}
            </p>

            <div className="pt-2">
              <button
                onClick={() => openBookingModal()}
                className="px-8 py-3 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-widest font-semibold rounded shadow transition-all duration-200 cursor-pointer"
              >
                {settings.promoButtonText || 'Claim First Visit Privilege'}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
