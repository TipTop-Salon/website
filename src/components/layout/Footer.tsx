import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight, Facebook, Instagram } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const Footer: React.FC = () => {
  const { settings, navigate, openBookingModal } = useSalon();

  return (
    <footer className="bg-[#140D18] text-[#DDD7E3] border-t border-[#2E1E38]">
      {/* Top Banner Pre-Footer CTA */}
      <div className="border-b border-[#2E1E38] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[#E5A93C] text-xs uppercase tracking-widest font-semibold block mb-1">
              Reserve Your Experience
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
              Elevate your personal grooming and beauty ritual.
            </h3>
          </div>
          <button
            onClick={() => openBookingModal()}
            className="px-6 py-3 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-wider font-semibold rounded transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Book Appointment Online</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <h4 className="font-serif text-2xl text-white tracking-wide">
              Tiptop <span className="font-serif italic text-[#E5A93C]">Shears & Nails</span>
            </h4>
            <p className="text-sm text-[#A395AD] leading-relaxed">
              A boutique sanctuary combining master Japanese shears craftsmanship, European gel architecture, and organic botanical wellness. Built for discerning clients who value precision and tranquility.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded bg-[#24172C] hover:bg-[#7B2D97] hover:text-white text-[#DDD7E3] flex items-center justify-center transition-colors"
                title="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded bg-[#24172C] hover:bg-[#7B2D97] hover:text-white text-[#DDD7E3] flex items-center justify-center transition-colors"
                title="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation & Services */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-[#E5A93C] mb-5">
              Explore Salon
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/services')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer text-[#B3A6BC]"
                >
                  Full Service Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/packages')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer text-[#B3A6BC]"
                >
                  Curated Packages & Rituals
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/gallery')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer text-[#B3A6BC]"
                >
                  Gallery & Transformations
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer text-[#B3A6BC]"
                >
                  Our Story & Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer text-[#B3A6BC]"
                >
                  Directions & Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Operating Hours */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-[#E5A93C] mb-5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E5A93C]" />
              Mall Operating Hours
            </h5>
            <div className="space-y-3 text-sm text-[#B3A6BC]">
              <div>
                <span className="block font-medium text-white">Monday – Sunday</span>
                <span className="text-xs text-[#9B8DA6]">10:00 AM – 9:00 PM (Mall Hours)</span>
              </div>
              <div className="pt-2 text-xs text-[#E5A93C] border-t border-[#2E1E38]">
                Premier Mall Silang hours. Private appointments & bridal bookings available upon request.
              </div>
            </div>
          </div>

          {/* Col 4: Location & Contact */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-widest text-[#E5A93C] mb-5">
              Contact & Studio
            </h5>
            <div className="space-y-3 text-sm text-[#B3A6BC]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E5A93C] shrink-0" />
                <a href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`} className="hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E5A93C] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-14 pt-8 border-t border-[#2E1E38] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7C94]">
          <p>© {new Date().getFullYear()} Tiptop Shears and Nails. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Bespoke Beauty Care</span>
            <span>·</span>
            <span>Organic Certified Products</span>
            <span>·</span>
            <span>Sterilization Grade Hygiene</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
