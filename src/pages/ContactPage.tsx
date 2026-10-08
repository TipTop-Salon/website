import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Facebook, Instagram, Navigation, Sparkles } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const ContactPage: React.FC = () => {
  const { currentPath, settings, openBookingModal, branches, activeBranchId, activeBranch, setActiveBranchId, createContactMessage } = useSalon();
  
  const checkIsBridal = (pathStr?: string) => {
    const combined = ((pathStr || '') + ' ' + (typeof window !== 'undefined' ? window.location.search + ' ' + window.location.hash : '')).toLowerCase();
    return combined.includes('bridal') || combined.includes('events') || combined.includes('group');
  };

  const [formData, setFormData] = useState(() => {
    const isBridal = checkIsBridal();
    return {
      name: '',
      email: '',
      phone: '',
      inquiryType: isBridal ? 'Bridal & Group Booking' : 'Appointment Inquiry',
      message: isBridal
        ? 'Hello, we are inquiring about private atelier reservation / bridal group packages. Please let us know availability and consultation details.'
        : ''
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Synchronize when currentPath or navigation query updates
  useEffect(() => {
    if (checkIsBridal(currentPath)) {
      setFormData(prev => ({
        ...prev,
        inquiryType: 'Bridal & Group Booking',
        message: prev.message && prev.message !== 'Hello, we are inquiring about private atelier reservation / bridal group packages. Please let us know availability and consultation details.'
          ? prev.message
          : 'Hello, we are inquiring about private atelier reservation / bridal group packages. Please let us know availability and consultation details.'
      }));
    }
  }, [currentPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    try {
      await createContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        inquiryType: formData.inquiryType,
        message: formData.message.trim(),
        branchId: activeBranchId !== 'all' ? activeBranch?.id : undefined,
        branchName: activeBranchId !== 'all' ? activeBranch?.name : 'General Concierge (All Branches)',
      });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAFAFB] min-h-screen">
      {/* Header Banner */}
      <section className="bg-[#1C1221] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#32223D]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#E5A93C] text-xs uppercase tracking-[0.2em] font-semibold block">
            Studio & Concierge
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-white tracking-tight">
            Connect with <span className="font-serif italic text-[#E5A93C]">Tiptop</span>
          </h1>
          <p className="text-sm text-[#DDD7E3] leading-relaxed max-w-xl mx-auto">
            We welcome your questions regarding our specialty shears haircutting, European nail architecture, or private atelier hire.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#ECEBF0] p-8 sm:p-10 shadow-sm">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-[#7B2D97]/10 text-[#7B2D97] rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-[#1C1221]">
                  Message Received with Pleasure
                </h3>
                <p className="text-xs text-[#6B6175] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Our concierge will review your inquiry and respond within 24 business hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', inquiryType: 'Appointment Inquiry', message: '' });
                  }}
                  className="px-5 py-2.5 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider rounded font-medium cursor-pointer transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <span className="text-[#7B2D97] text-xs uppercase tracking-widest font-semibold block">
                      Send a Direct Note
                    </span>
                    {formData.inquiryType === 'Bridal & Group Booking' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E5A93C]/15 text-[#9E6E17] border border-[#E5A93C]/30">
                        <Sparkles className="w-3 h-3 text-[#E5A93C]" />
                        Private Atelier & Events Inquiry
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1221] font-light">
                    How May We Assist You?
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lauren Bennett"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2.5 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="lauren@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2.5 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+63 917 877 5299"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2.5 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2.5 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                    >
                      <option value="Appointment Inquiry">Appointment Inquiry</option>
                      <option value="Bridal & Group Booking">Bridal & Group Booking</option>
                      <option value="Custom Hair Consultation">Custom Hair Consultation</option>
                      <option value="Specialist Application">Specialist Careers</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about the look you have in mind or any questions you have..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2.5 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#82788D]">
                    We treat all consultations with complete privacy.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-widest font-semibold rounded shadow transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Information & Map Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Salon Details Box */}
            <div className="bg-[#1C1221] text-white rounded-xl p-8 border border-[#32223D] space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-serif text-2xl font-light">
                  Salon Information
                </h3>
                <span className="bg-[#291B30] text-[#E5A93C] text-[11px] font-semibold px-2.5 py-1 rounded border border-[#3D294B]">
                  {activeBranchId === 'all' ? `All Atelier Locations (${branches.length})` : activeBranch?.name}
                </span>
              </div>

              <div className="space-y-4 text-xs text-[#DDD7E3]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-white block">
                      {activeBranch?.name}
                    </span>
                    <span>{activeBranch?.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-white block">Direct Line & SMS Concierge</span>
                    <a href={`tel:${(activeBranch?.phone || settings.phone).replace(/[^0-9]/g, '')}`} className="hover:text-[#E5A93C] transition-colors">
                      {activeBranch?.phone || settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-white block">Electronic Mail</span>
                    <a href={`mailto:${activeBranch?.email || settings.email}`} className="hover:text-[#E5A93C] transition-colors">
                      {activeBranch?.email || settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-white block">Operating Schedule</span>
                    <span>{activeBranch?.operatingHours || settings.hoursWeekday}</span>
                  </div>
                </div>
              </div>

              {/* Social Channels including client Facebook */}
              <div className="pt-4 border-t border-[#32223D] flex items-center justify-between">
                <span className="text-xs text-[#A395AD]">Follow Our Journey:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#291B30] hover:bg-[#7B2D97] hover:text-white text-[#DDD7E3] text-xs transition-colors"
                  >
                    <Facebook className="w-3.5 h-3.5 text-[#E5A93C]" />
                    <span>Facebook Profile</span>
                  </a>
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded bg-[#291B30] hover:bg-[#7B2D97] hover:text-white text-[#DDD7E3] transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Map Visual Placeholder */}
            <div className="bg-white rounded-xl border border-[#ECEBF0] overflow-hidden shadow-sm">
              <div className="relative h-64 bg-[#EDEBF2] flex flex-col items-center justify-center p-6 text-center">
                {/* Stylized Map Canvas Background */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#7B2D97_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="relative z-10 w-12 h-12 rounded-full bg-[#7B2D97] text-[#E5A93C] flex items-center justify-center shadow-lg mb-3">
                  <Navigation className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="relative z-10 font-serif text-lg font-semibold text-[#1C1221]">
                  {activeBranch?.name}
                </h4>
                <p className="relative z-10 text-xs text-[#6B6175] max-w-xs mb-3">
                  {activeBranch?.address}
                </p>
                <a
                  href={activeBranch?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(activeBranch?.name + ' ' + activeBranch?.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 px-4 py-1.5 bg-[#1C1221] hover:bg-[#291B30] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider rounded font-medium transition-colors"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
