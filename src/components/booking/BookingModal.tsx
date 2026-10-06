import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Calendar, Clock, User, Phone, Mail, FileText, Sparkles, MapPin, AlertCircle } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { Branch, ServiceItem, BeautyPackage } from '../../types/salon';

const DEFAULT_FALLBACK_BRANCH: Branch = {
  id: 'silang-premier',
  name: 'Premier Mall Silang (Flagship)',
  mallName: 'Premier Mall Silang',
  address: 'Level 2, Premier Mall, Aguinaldo Hwy, Silang, Cavite',
  city: 'Silang, Cavite',
  phone: '+63 46 414 8899',
  email: 'silang@tiptopshears.com',
  operatingHours: '10:00 AM – 9:00 PM Daily',
  isActive: true,
};

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    preselectedItem,
    services = [],
    packages = [],
    createBooking,
    branches = [],
    activeBranchId,
  } = useSalon();

  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    return activeBranchId || (branches[0]?.id ?? DEFAULT_FALLBACK_BRANCH.id);
  });
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    try {
      return tomorrow.toISOString().split('T')[0];
    } catch {
      return '';
    }
  });
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM');
  const [stylist, setStylist] = useState('Master Stylist Claire');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync active branch if modal opens
  useEffect(() => {
    if (activeBranchId) {
      setSelectedBranchId(activeBranchId);
    } else if (branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
  }, [activeBranchId, isBookingModalOpen, branches]);

  // Sync preselected item if opened with one
  useEffect(() => {
    if (preselectedItem && preselectedItem.id) {
      setSelectedServiceId(preselectedItem.id);
    } else if (services.length > 0) {
      setSelectedServiceId(services[0].id);
    } else if (packages.length > 0) {
      setSelectedServiceId(packages[0].id);
    }
  }, [preselectedItem, services, packages]);

  // Safe chosen branch resolution
  const chosenBranch: Branch =
    branches.find((b) => b && b.id === selectedBranchId) ||
    branches[0] ||
    DEFAULT_FALLBACK_BRANCH;

  // Option C: Unified catalog filtered by branch availability (Default = all branches)
  const isAvailableAtBranch = (branchIds?: string[]) => {
    if (!branchIds || !Array.isArray(branchIds) || branchIds.length === 0 || branchIds.includes('all')) {
      return true;
    }
    return branchIds.includes(selectedBranchId);
  };

  const availableServices = (services || []).filter((s) => s && isAvailableAtBranch(s.branchIds));
  const availablePackages = (packages || []).filter((p) => p && isAvailableAtBranch(p.branchIds));

  // Auto-switch selected item if not available at the chosen branch
  useEffect(() => {
    const allItems = [...availableServices, ...availablePackages];
    if (allItems.length > 0) {
      const isCurrentValid = allItems.some((item) => item && item.id === selectedServiceId);
      if (!isCurrentValid) {
        setSelectedServiceId(allItems[0].id);
      }
    }
  }, [selectedBranchId, availableServices.length, availablePackages.length, selectedServiceId]);

  const activeService = (services || []).find((s) => s && s.id === selectedServiceId);
  const activePackage = (packages || []).find((p) => p && p.id === selectedServiceId);

  const selectedTitle =
    activeService?.title ||
    activePackage?.title ||
    (services?.[0]?.title ?? 'Bespoke Salon Ritual');

  const selectedPrice = Number(
    activeService?.price ??
    activePackage?.price ??
    services?.[0]?.price ??
    750
  );

  const selectedDuration = Number(
    activeService?.durationMinutes ??
    activePackage?.durationMinutes ??
    60
  );

  const timeSlots = [
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:30 PM',
    '02:30 PM',
    '03:45 PM',
    '05:00 PM',
    '06:15 PM',
    '07:30 PM',
  ];

  const stylists = [
    'Master Stylist Claire (Hair & Shears Lead)',
    'Artisan Nailist Vivienne (Gel Architecture & Art)',
    'Spa Specialist Maya (Hydrotherapy & Pedicures)',
    'First Available Senior Specialist',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !appointmentDate) {
      setSubmitError('Please complete all required contact and date fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newBooking = await createBooking({
        serviceId: selectedServiceId || (services?.[0]?.id ?? 'custom-booking'),
        serviceTitle: selectedTitle,
        branchId: chosenBranch?.id || 'silang-premier',
        branchName: chosenBranch?.name || 'Premier Mall Silang (Flagship)',
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        appointmentDate,
        appointmentTime,
        stylist,
        notes: notes.trim(),
        totalPrice: selectedPrice,
      });

      setBookingSuccess(newBooking?.id || `TTP-${Date.now().toString().slice(-6)}`);
    } catch (err: unknown) {
      console.error('Booking submission error', err);
      const msg = err instanceof Error ? err.message : 'Unable to confirm appointment. Please check connection and try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setBookingSuccess(null);
    setSubmitError(null);
    closeBookingModal();
  };

  if (!isBookingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140D18]/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#ECEBF0] overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1C1221] px-6 py-5 text-white flex items-center justify-between border-b border-[#32223D] shrink-0">
          <div>
            <span className="text-[#E5A93C] text-[10px] uppercase tracking-widest font-semibold block">
              Tiptop Concierge
            </span>
            <h3 className="font-serif text-2xl font-medium tracking-wide">
              {bookingSuccess ? 'Appointment Confirmed' : 'Reserve Salon Appointment'}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-[#A395AD] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {bookingSuccess ? (
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-[#7B2D97]/15 text-[#7B2D97] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#6B6175] font-semibold block">
                  Booking Reference: <span className="font-mono text-[#1C1221] font-bold text-sm">{bookingSuccess}</span>
                </span>
                <h4 className="font-serif text-2xl text-[#1C1221]">
                  We Look Forward to Welcoming You
                </h4>
                <p className="text-xs text-[#6B6175] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-[#1C1221]">{customerName}</strong>. A reservation has been recorded for your <strong className="text-[#1C1221]">{selectedTitle}</strong> at <strong className="text-[#1C1221]">{chosenBranch?.name}</strong> on <strong className="text-[#1C1221]">{appointmentDate} at {appointmentTime}</strong>.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="bg-[#FAFAFB] border border-[#ECEBF0] rounded-lg p-5 text-left max-w-md mx-auto text-xs space-y-2.5">
                <div className="flex justify-between text-[#6B6175]">
                  <span>Branch Location</span>
                  <span className="text-[#1C1221] font-semibold text-right">{chosenBranch?.name}</span>
                </div>
                <div className="flex justify-between text-[#6B6175]">
                  <span>Address</span>
                  <span className="text-[#1C1221] truncate max-w-[220px] text-right">{chosenBranch?.address}</span>
                </div>
                <div className="flex justify-between text-[#6B6175]">
                  <span>Selected Service</span>
                  <span className="text-[#1C1221] font-medium text-right">{selectedTitle}</span>
                </div>
                <div className="flex justify-between text-[#6B6175]">
                  <span>Duration</span>
                  <span className="text-[#1C1221] font-medium">{selectedDuration} Minutes</span>
                </div>
                <div className="flex justify-between text-[#6B6175]">
                  <span>Specialist</span>
                  <span className="text-[#1C1221] font-medium text-right">
                    {stylist ? stylist.split('(')[0].trim() : 'Senior Specialist'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#1C1221] pt-2.5 border-t border-[#ECEBF0]">
                  <span>Estimated Total Due</span>
                  <span className="text-[#7B2D97] font-mono tabular-nums text-base">₱{selectedPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="px-6 py-3 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow transition-colors cursor-pointer"
              >
                Done & Return to Salon
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Branch Selector */}
              <div className="bg-[#F8F5FA] p-3.5 rounded-lg border border-[#EADBEE]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7B2D97]" />
                  Select Salon Branch
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full bg-white border border-[#D9D6E2] rounded px-3 py-2 text-xs font-medium text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                >
                  {(branches.length > 0 ? branches : [DEFAULT_FALLBACK_BRANCH]).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.city} ({b.operatingHours})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5">
                  Select Service or Package
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2.5 text-xs sm:text-sm text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                >
                  {availableServices.length > 0 && (
                    <optgroup label={`Individual Salon Services (${availableServices.length} Available)`}>
                      {availableServices.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} — ₱{(s.price || 0).toLocaleString()} ({s.durationMinutes || 60} min)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {availablePackages.length > 0 && (
                    <optgroup label={`Curated Beauty Packages (${availablePackages.length} Available)`}>
                      {availablePackages.map((p) => {
                        const price = p.price || 0;
                        const orig = p.originalPrice ?? price;
                        return (
                          <option key={p.id} value={p.id}>
                            {p.title} — ₱{price.toLocaleString()} {orig > price ? `(Valued at ₱${orig.toLocaleString()})` : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                  {availableServices.length === 0 && availablePackages.length === 0 && (
                    <option value="general-consultation">
                      General Beauty & Hair Consultation (₱750)
                    </option>
                  )}
                </select>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7B2D97]" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#7B2D97]" />
                    Preferred Time Slot
                  </label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stylist Preference */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#7B2D97]" />
                  Specialist / Stylist Preference
                </label>
                <select
                  value={stylist}
                  onChange={(e) => setStylist(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                >
                  {stylists.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#7B2D97]" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Santos"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#7B2D97]" />
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+63 917 000 0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#7B2D97]" />
                  Email Address for Confirmation <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="maria@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#7B2D97]" />
                  Special Requests or Styling Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us if you have allergies, specific nail inspiration photos, or prefer a silent consultation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                />
              </div>

              {/* Price Preview Summary */}
              <div className="p-4 bg-[#F8F2FC] rounded-lg border border-[#E8DAF0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7B2D97] shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-[#1C1221] block">
                      Zero Online Deposit Required
                    </span>
                    <span className="text-[11px] text-[#6B6175]">
                      Pay comfortably at {chosenBranch?.name} after your treatment
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#8A7E93] block">Estimated Total</span>
                  <span className="font-serif text-lg font-semibold text-[#7B2D97]">
                    ₱{selectedPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-[#6B6175] hover:text-[#1C1221] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-wider font-semibold rounded shadow hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
