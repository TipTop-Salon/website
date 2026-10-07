import React from 'react';
import { MapPin, Phone, Sparkles, Clock } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const TopUtilityBar: React.FC = () => {
  const { settings, openBookingModal, branches, activeBranchId, activeBranch, setActiveBranchId } = useSalon();

  return (
    <div className="bg-[#140D18] text-[#E7DFEA] border-b border-[#2E1E38] text-xs py-2 px-3 sm:px-4 transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-2.5">
        {/* Left: Branch Switcher & Location */}
        <div className="flex items-center gap-2 text-[#B3A6BC] flex-wrap justify-center sm:justify-start w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-[#24172C] border border-[#3D294B] rounded px-2 sm:px-2.5 py-0.5 text-[11px] max-w-full">
            <MapPin className="w-3 h-3 text-[#E5A93C] shrink-0" />
            <span className="text-[#A395AD] shrink-0">Branch:</span>
            <select
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1 max-w-[160px] sm:max-w-xs truncate"
              aria-label="Select active salon branch"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#1C1221] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[#3D294B] hidden md:inline">|</span>
          <span className="hidden md:inline truncate max-w-xs text-[11px] text-[#A395AD]">
            {activeBranch?.mallName || activeBranch?.address}
          </span>
        </div>

        {/* Center: Promotional Announcement */}
        <div className="flex items-center gap-1.5 text-center text-xs flex-wrap justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
          <span className="font-medium text-white tracking-wide text-[11px] sm:text-xs">
            {settings.announcementText}
          </span>
          <button
            onClick={() => openBookingModal()}
            className="text-[#E5A93C] hover:text-[#F0B54B] font-semibold underline underline-offset-2 ml-1 cursor-pointer transition-colors shrink-0 text-[11px] sm:text-xs"
          >
            Claim 20% Off
          </button>
        </div>

        {/* Right: Branch Hours & Phone */}
        <div className="hidden lg:flex items-center gap-4 text-[#B3A6BC] text-xs">
          <div className="flex items-center gap-1 text-[11px] text-[#A395AD]">
            <Clock className="w-3 h-3 text-[#E5A93C]" />
            <span>{activeBranch?.operatingHours || '10:00 AM – 9:00 PM'}</span>
          </div>
          <span className="text-[#3D294B]">|</span>
          <a
            href={`tel:${(activeBranch?.phone || settings.phone).replace(/[^0-9]/g, '')}`}
            className="flex items-center gap-1.5 hover:text-[#E5A93C] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span className="font-medium text-white">{activeBranch?.phone || settings.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
