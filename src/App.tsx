import React from 'react';
import { SalonProvider, useSalon } from './context/SalonContext';
import { TopUtilityBar } from './components/layout/TopUtilityBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BookingModal } from './components/booking/BookingModal';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { AboutPage } from './pages/AboutPage';
import { PackagesPage } from './pages/PackagesPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/admin/AdminPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const { currentPath } = useSalon();

  // Robust determination of admin portal mode
  const isAdminView =
    currentPath.startsWith('/admin') ||
    currentPath === 'admin' ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin' ||
        window.location.hash.startsWith('#/admin') ||
        window.location.search.includes('admin=true')));

  // If in admin mode: render a 100% full-screen dedicated SaaS portal.
  // Never render the public website TopUtilityBar, Navbar, or customer Footer.
  if (isAdminView) {
    return (
      <ErrorBoundary>
        <AdminPage />
        <BookingModal />
      </ErrorBoundary>
    );
  }

  const renderRoute = () => {
    // Dynamic Service detail routing (/services/:id)
    if (currentPath.startsWith('/services/') && currentPath.length > 10) {
      return <ServiceDetailPage />;
    }

    // Standard static routes
    switch (currentPath) {
      case '/services':
        return <ServicesPage />;
      case '/packages':
        return <PackagesPage />;
      case '/about':
        return <AboutPage />;
      case '/gallery':
        return <GalleryPage />;
      case '/contact':
        return <ContactPage />;
      case '/':
      default:
        return <HomePage />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#FAFAFB] text-[#1C1221] selection:bg-[#E5A93C] selection:text-[#1C1221] overflow-x-hidden w-full max-w-full">
        {/* Top Utility Announcement Bar */}
        <TopUtilityBar />

        {/* Main Sticky Navigation Bar */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-1">
          {renderRoute()}
        </main>

        {/* Luxury Atelier Footer */}
        <Footer />

        {/* Global Booking Modal */}
        <BookingModal />
      </div>
    </ErrorBoundary>
  );
};

export default function App() {
  return (
    <SalonProvider>
      <AppContent />
    </SalonProvider>
  );
}
