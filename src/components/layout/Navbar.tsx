import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';

export const Navbar: React.FC = () => {
  const { currentPath, navigate, openBookingModal } = useSalon();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Packages', path: '/packages' },
    { label: 'About', path: '/about' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#1C1221]/95 backdrop-blur-md shadow-lg border-b border-[#32223D]'
          : 'bg-[#1C1221] border-b border-[#32223D]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/');
            }}
            className="group flex flex-col justify-center min-w-0 shrink"
          >
            <span className="font-serif text-lg sm:text-2xl md:text-3xl font-medium tracking-wide text-white group-hover:text-[#E5A93C] transition-colors truncate">
              Tiptop <span className="font-serif italic font-normal text-[#E5A93C]">Shears & Nails</span>
            </span>
          </a>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive =
                currentPath === link.path ||
                (link.path !== '/' && currentPath.startsWith(link.path));

              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`relative text-sm tracking-wider uppercase transition-colors duration-200 py-1 cursor-pointer whitespace-nowrap font-medium ${
                    isActive
                      ? 'text-[#E5A93C]'
                      : 'text-[#DDD7E3] hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#E5A93C]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Desktop / Tablet CTA: Book Appointment */}
            <button
              onClick={() => openBookingModal()}
              className="hidden sm:flex px-4 md:px-5 py-2.5 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-wider font-semibold rounded transition-all duration-200 shadow-sm hover:shadow-md items-center gap-2 cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            {/* Mobile Compact Book Button */}
            <button
              onClick={() => openBookingModal()}
              className="sm:hidden px-2.5 py-1.5 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-[11px] uppercase tracking-wider font-bold rounded flex items-center gap-1 cursor-pointer active:scale-[0.98] shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden p-1.5 text-[#DDD7E3] hover:text-white focus:outline-none cursor-pointer rounded-lg hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#180E1D] border-b border-[#32223D] px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const isActive =
              currentPath === link.path ||
              (link.path !== '/' && currentPath.startsWith(link.path));

            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`w-full text-left px-3 py-2.5 rounded text-sm uppercase tracking-wider font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2E1E38] text-[#E5A93C] border-l-2 border-[#E5A93C]'
                    : 'text-[#DDD7E3] hover:bg-[#24172C] hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-[#32223D] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openBookingModal();
              }}
              className="w-full py-3 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-wider font-semibold rounded text-center flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
