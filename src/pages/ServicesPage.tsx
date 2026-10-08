import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Search, Scissors, Check, ArrowRight, MapPin, X, Sparkles, Building2 } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { getImageUrl, handleImageError } from '../lib/imageHelper';

export const ServicesPage: React.FC = () => {
  const {
    services,
    categories: dynamicCategories,
    branches,
    activeBranchId,
    setActiveBranchId,
    navigate,
    openBookingModal
  } = useSalon();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compute category tabs dynamically - ONLY include categories with actual available services under activeBranchId!
  const categoryTabs = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalInBranch = 0;

    services.forEach((service) => {
      const isAvailableAtBranch =
        activeBranchId === 'all' ||
        !service.branchIds ||
        service.branchIds.length === 0 ||
        service.branchIds.includes('all') ||
        service.branchIds.includes(activeBranchId);

      if (isAvailableAtBranch) {
        counts[service.category] = (counts[service.category] || 0) + 1;
        totalInBranch++;
      }
    });

    const tabs: { id: string; label: string; count: number }[] = [
      { id: 'all', label: 'All Services', count: totalInBranch }
    ];

    // Exclude empty categories (0 services) and order by displayOrder
    dynamicCategories
      .filter((c) => c.isActive && (counts[c.slug] || 0) > 0)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .forEach((cat) => {
        tabs.push({
          id: cat.slug,
          label: cat.name,
          count: counts[cat.slug] || 0
        });
      });

    return tabs;
  }, [services, dynamicCategories, activeBranchId]);

  // If active category becomes empty under current branch filter, reset to 'all'
  useEffect(() => {
    if (selectedCategory !== 'all' && !categoryTabs.some((t) => t.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categoryTabs, selectedCategory]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === 'all' || service.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        service.title.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.categoryLabel.toLowerCase().includes(q) ||
        (service.features && service.features.some((f) => f.toLowerCase().includes(q)));

      const matchesBranch =
        activeBranchId === 'all' ||
        !service.branchIds ||
        service.branchIds.length === 0 ||
        service.branchIds.includes('all') ||
        service.branchIds.includes(activeBranchId);

      return matchesCategory && matchesSearch && matchesBranch;
    });
  }, [services, selectedCategory, searchQuery, activeBranchId]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    if (activeBranchId !== 'all') {
      setActiveBranchId('all');
    }
  };

  return (
    <div className="bg-[#FAFAFB] min-h-screen">
      {/* Header Banner */}
      <section className="bg-[#1C1221] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#32223D]">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-[#E5A93C] text-xs uppercase tracking-[0.2em] font-semibold block">
            The Complete Atelier Menu
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-white tracking-tight">
            Salon Services & <span className="font-serif italic text-[#E5A93C]">Treatments</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm text-[#DDD7E3] leading-relaxed">
            Every service begins with a comprehensive consultation and concludes with personalized maintenance advice.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-[#ECEBF0] p-4 sm:p-6 shadow-xs space-y-5">
          {/* Top Control Bar: Search Input & Current Filter Summary */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#ECEBF0]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1221]">
                Treatment Categories
              </span>
              <span className="text-xs text-[#8A7E93]">
                ({filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} available)
              </span>
            </div>

            {/* Treatment Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#9B8DA6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search haircuts, gel-x, spa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-[#FAFAFB] border border-[#D9D6E2] rounded-xl text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B8DA6] hover:text-[#1C1221] p-0.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills (Wrap neatly, no weird horizontal scrollbars, no empty categories) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {categoryTabs.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-[#7B2D97] text-white border-[#7B2D97] shadow-sm'
                      : 'bg-[#FAFAFB] text-[#6B6175] border-[#ECEBF0] hover:border-[#7B2D97]/40 hover:text-[#1C1221] hover:bg-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-[#EAE8F0] text-[#7B2D97]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Branch Status Strip (Reflects header branch selection) */}
          {activeBranchId !== 'all' && (
            <div className="flex items-center justify-between flex-wrap gap-2 bg-[#FAF5FE] border border-[#E9D9F2] px-4 py-2.5 rounded-xl text-xs text-[#7B2D97]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#7B2D97] shrink-0" />
                <span>
                  Showing treatments available at <strong className="text-[#1C1221]">{branches.find(b => b.id === activeBranchId)?.name || activeBranchId}</strong> (selected in header)
                </span>
              </div>
              <button
                onClick={() => setActiveBranchId('all')}
                className="text-xs font-semibold underline underline-offset-2 hover:text-[#581A6F] cursor-pointer"
              >
                Show All Branches
              </button>
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="py-8">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#ECEBF0] p-8 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#FAF5FE] text-[#7B2D97] flex items-center justify-center mx-auto">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-[#1C1221]">No treatments match your criteria</h3>
              <p className="text-xs text-[#6B6175] max-w-md mx-auto">
                {activeBranchId !== 'all'
                  ? `No treatments in this category at this location. Try switching branch in the header or showing all branches.`
                  : 'Try adjusting your search query or selecting a different category.'}
              </p>
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors cursor-pointer mt-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white rounded-xl border border-[#ECEBF0] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1C1221]">
                    <img
                      src={getImageUrl(service.imageUrl)}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={handleImageError}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 bg-[#1C1221]/90 backdrop-blur-sm text-[#E5A93C] text-xs font-mono font-bold px-2.5 py-1 rounded">
                      ₱{service.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#82788D] mb-2">
                        <span className="uppercase tracking-wider font-semibold text-[#7B2D97]">
                          {service.categoryLabel}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[#6B6175]">
                          <Clock className="w-3.5 h-3.5 text-[#E5A93C]" />
                          {service.durationMinutes} mins
                        </span>
                      </div>

                      <h2 className="font-serif text-xl font-medium text-[#1C1221] group-hover:text-[#7B2D97] mb-2 leading-snug transition-colors">
                        {service.title}
                      </h2>

                      {/* Branch Exclusivity Tag */}
                      {service.branchIds &&
                        service.branchIds.length > 0 &&
                        !service.branchIds.includes('all') &&
                        service.branchIds.length < branches.length ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#7B2D97] bg-[#FAF5FE] border border-[#E9D9F2] px-2.5 py-1 rounded-md w-fit mb-3 font-medium">
                          <MapPin className="w-3 h-3 text-[#E5A93C] shrink-0" />
                          <span>
                            Available at:{' '}
                            {service.branchIds
                              .map((id) => branches.find((b) => b.id === id)?.mallName || id)
                              .join(', ')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md w-fit mb-3 font-medium">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Available at All Branches</span>
                        </div>
                      )}

                      <p className="text-xs text-[#6B6175] leading-relaxed mb-4">
                        {service.description}
                      </p>

                      {/* Included Highlights */}
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-1.5 mb-6 pt-3 border-t border-[#ECEBF0]">
                          {service.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-[#6B6175]">
                              <Check className="w-3.5 h-3.5 text-[#7B2D97] shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-[#ECEBF0] flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/services/${service.id}`)}
                        className="text-xs font-semibold text-[#7B2D97] hover:text-[#8F37AE] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openBookingModal(service)}
                        className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
