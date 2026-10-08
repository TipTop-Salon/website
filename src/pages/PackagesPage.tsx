import React from 'react';
import { Sparkles, Clock, Check, Calendar, ArrowRight, MapPin } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { getImageUrl, handleImageError } from '../lib/imageHelper';

export const PackagesPage: React.FC = () => {
  const { packages, branches, openBookingModal, navigate } = useSalon();

  return (
    <div className="bg-[#FAFAFB] min-h-screen">
      {/* Header Banner */}
      <section className="bg-[#1C1221] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#32223D]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#E5A93C] text-xs uppercase tracking-[0.2em] font-semibold block">
            Curated Beauty Bundles
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-white tracking-tight">
            Exclusive Atelier <span className="font-serif italic text-[#E5A93C]">Packages</span>
          </h1>
          <p className="text-sm text-[#DDD7E3] leading-relaxed max-w-xl mx-auto">
            Experience comprehensive head-to-toe beauty care with synchronized hair sculpting, architectural manicures, and botanical spa therapies at preferential pricing.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
            const savings = pkg.originalPrice - pkg.price;
            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-xl border flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                  pkg.isPopular
                    ? 'border-[#E5A93C] shadow-xl ring-1 ring-[#E5A93C]/40'
                    : 'border-[#ECEBF0] hover:shadow-lg'
                }`}
              >
                {/* Image Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1C1221]">
                  <img
                    src={getImageUrl(pkg.imageUrl)}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                  />
                  {pkg.badgeText && (
                    <div className="absolute top-3 left-3 bg-[#1C1221]/95 backdrop-blur-sm text-[#E5A93C] border border-[#E5A93C]/40 text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded">
                      {pkg.badgeText}
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-[#1C1221]/90 backdrop-blur-sm text-white text-xs font-mono px-2.5 py-1 rounded flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#E5A93C]" />
                    <span>{pkg.durationMinutes} mins</span>
                  </div>
                </div>

                {/* Package Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-medium text-[#1C1221] mb-1">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-[#82788D] mb-3">
                      {pkg.subtitle}
                    </p>

                    {/* Branch Exclusivity Tag (Option C) */}
                    {pkg.branchIds &&
                      pkg.branchIds.length > 0 &&
                      !pkg.branchIds.includes('all') &&
                      pkg.branchIds.length < branches.length && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#7B2D97] bg-[#F7F1FB] border border-[#E8DDF1] px-2 py-0.5 rounded w-fit mb-3.5 font-medium">
                          <MapPin className="w-3 h-3 text-[#E5A93C] shrink-0" />
                          <span>
                            Available at:{' '}
                            {pkg.branchIds
                              .map((id) => branches.find((b) => b.id === id)?.mallName || id)
                              .join(', ')}
                          </span>
                        </div>
                      )}

                    {/* Price & Savings */}
                    <div className="flex items-baseline gap-3 mb-6 p-3 bg-[#FFF9EE] rounded border border-[#F3E3C3]">
                      <span className="font-serif text-3xl font-semibold text-[#1C1221]">
                        ₱{pkg.price.toLocaleString()}
                      </span>
                      <span className="text-xs line-through text-[#9B8DA6] font-mono">
                        ₱{pkg.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-[#E5A93C] ml-auto">
                        Save ₱{savings.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B6175] leading-relaxed mb-6">
                      {pkg.description}
                    </p>

                    {/* Inclusions List */}
                    <div className="space-y-2 mb-8">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1221] block">
                        Included Treatments:
                      </span>
                      {pkg.includedServices.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[#6B6175]">
                          <Check className="w-3.5 h-3.5 text-[#7B2D97] shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-[#ECEBF0]">
                    <button
                      onClick={() => openBookingModal(pkg)}
                      className={`w-full py-3 text-xs uppercase tracking-widest font-semibold rounded transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                        pkg.isPopular
                          ? 'bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] shadow font-semibold'
                          : 'bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] font-semibold'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Package</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Bundles Banner */}
        <div className="mt-16 bg-[#1C1221] text-white rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#32223D]">
          <div className="space-y-2">
            <span className="text-[#E5A93C] text-xs uppercase tracking-widest font-semibold block">
              Bridal Parties & Private Atelier Hire
            </span>
            <h4 className="font-serif text-2xl sm:text-3xl font-light">
              Looking for a custom group beauty package?
            </h4>
            <p className="text-xs sm:text-sm text-[#DDD7E3] max-w-xl">
              We offer bespoke salon buyouts for bridal suites, editorial photoshoots, and private celebrations with curated refreshment catering.
            </p>
          </div>
          <button
            onClick={() => navigate('/contact?topic=bridal')}
            className="px-6 py-3 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-wider font-semibold rounded shrink-0 cursor-pointer shadow transition-colors"
          >
            Inquire for Private Events
          </button>
        </div>
      </div>
    </div>
  );
};
