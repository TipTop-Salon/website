import React from 'react';
import { ArrowLeft, Clock, Check, Sparkles, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { getImageUrl, handleImageError } from '../lib/imageHelper';

export const ServiceDetailPage: React.FC = () => {
  const { serviceIdParam, services, navigate, openBookingModal } = useSalon();

  const service = services.find((s) => s.id === serviceIdParam);

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl text-[#1C1221]">Service Not Found</h2>
        <p className="text-sm text-[#6B6175]">
          The service you are looking for may have been updated or moved.
        </p>
        <button
          onClick={() => navigate('/services')}
          className="px-6 py-2.5 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider rounded font-semibold transition-colors cursor-pointer"
        >
          Return to All Services
        </button>
      </div>
    );
  }

  const relatedServices = services
    .filter((s) => s.id !== service.id && s.category === service.category)
    .slice(0, 2);

  return (
    <div className="bg-[#FAFAFB] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => navigate('/services')}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#6B6175] hover:text-[#7B2D97] mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services Catalog</span>
        </button>

        {/* Main Service Split Container */}
        <div className="bg-white rounded-xl border border-[#ECEBF0] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 mb-16">
          {/* Left Column: High-Res Image (7 cols) */}
          <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[500px] bg-[#1C1221]">
            <img
              src={getImageUrl(service.imageUrl)}
              alt={service.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 bg-[#1C1221]/90 backdrop-blur-sm text-[#E5A93C] text-xs uppercase tracking-widest font-semibold px-3 py-1.5 rounded">
              {service.categoryLabel}
            </div>
          </div>

          {/* Right Column: Contiguous Purchase & Details Module (5 cols) */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-[#FAFAFB]">
            <div>
              <div className="flex items-center justify-between text-xs text-[#82788D] mb-3">
                <span className="flex items-center gap-1.5 font-mono text-[#6B6175]">
                  <Clock className="w-4 h-4 text-[#E5A93C]" />
                  {service.durationMinutes} Minutes Session
                </span>
                <span className="text-[#7B2D97] font-semibold uppercase tracking-wider">
                  Bespoke Formulation
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1221] font-medium leading-tight mb-4">
                {service.title}
              </h1>

              {/* Price Callout */}
              <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[#ECEBF0]">
                <span className="font-serif text-3xl font-semibold text-[#1C1221]">
                  ₱{service.price.toLocaleString()}
                </span>
                <span className="text-xs text-[#82788D]">
                  Inclusive of private consultation & styling wash
                </span>
              </div>

              <p className="text-sm text-[#6B6175] leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Service Features Checklist */}
              <div className="space-y-2.5 mb-8">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1221]">
                  What Is Included
                </h4>
                {service.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#6B6175]">
                    <Check className="w-4 h-4 text-[#7B2D97] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA Box */}
            <div className="pt-6 border-t border-[#ECEBF0] space-y-3">
              <button
                onClick={() => openBookingModal(service)}
                className="w-full py-3.5 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-widest font-semibold rounded shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Calendar className="w-4 h-4" />
                <span>Book This Service Online</span>
              </button>
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#82788D]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7B2D97]" />
                <span>Zero deposit required · Flexible 24h cancellation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality & Safety Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-white rounded-lg border border-[#ECEBF0] space-y-2">
            <Sparkles className="w-5 h-5 text-[#7B2D97]" />
            <h4 className="font-serif text-base font-semibold text-[#1C1221]">
              Tailored Consultation
            </h4>
            <p className="text-xs text-[#6B6175] leading-relaxed">
              Every guest receives an individual anatomical analysis before cutting or coloring begins.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#ECEBF0] space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#7B2D97]" />
            <h4 className="font-serif text-base font-semibold text-[#1C1221]">
              Hospital-Grade Hygiene
            </h4>
            <p className="text-xs text-[#6B6175] leading-relaxed">
              Implements are vacuum autoclave sterilized in single-client sealed pouches.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#ECEBF0] space-y-2">
            <Heart className="w-5 h-5 text-[#7B2D97]" />
            <h4 className="font-serif text-base font-semibold text-[#1C1221]">
              Botanical Integrity
            </h4>
            <p className="text-xs text-[#6B6175] leading-relaxed">
              We exclusively use low-tox, vegan, cruelty-free professional hair and gel formulas.
            </p>
          </div>
        </div>

        {/* Related Services Recommendation */}
        {relatedServices.length > 0 && (
          <div className="border-t border-[#ECEBF0] pt-12">
            <h3 className="font-serif text-2xl text-[#1C1221] mb-6">
              Complementary Atelier Treatments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedServices.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/services/${rel.id}`)}
                  className="p-5 bg-white rounded-lg border border-[#ECEBF0] hover:border-[#7B2D97] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getImageUrl(rel.imageUrl)}
                      alt={rel.title}
                      className="w-16 h-16 rounded object-cover"
                      onError={handleImageError}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif text-base text-[#1C1221] group-hover:text-[#7B2D97] transition-colors">
                        {rel.title}
                      </h4>
                      <span className="text-xs text-[#82788D] font-mono">
                        ₱{rel.price.toLocaleString()} · {rel.durationMinutes}m
                      </span>
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#7B2D97] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
