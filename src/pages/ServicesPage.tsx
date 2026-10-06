import React, { useState } from 'react';
import { Clock, Search, Scissors, Sparkles, Check, ArrowRight, MapPin, Filter } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const ServicesPage: React.FC = () => {
  const { services, categories: dynamicCategories, branches, activeBranchId, activeBranch, navigate, openBookingModal } = useSalon();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterByBranch, setFilterByBranch] = useState<boolean>(false);

  const categoryTabs = [
    { id: 'all', label: 'All Services' },
    ...dynamicCategories
      .filter((c) => c.isActive)
      .map((c) => ({ id: c.slug, label: c.name })),
  ];

  const filteredServices = services.filter((service) => {
    const matchesCategory =
      selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    const isAvailableAtActiveBranch =
      !service.branchIds ||
      service.branchIds.length === 0 ||
      service.branchIds.includes('all') ||
      service.branchIds.includes(activeBranchId);

    const matchesBranch = filterByBranch ? isAvailableAtActiveBranch : true;

    return matchesCategory && matchesSearch && matchesBranch;
  });

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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[#ECEBF0]">
          {/* Category Tabs (Segmented controls) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EDEBF2] border border-[#DDD9E5] rounded-lg w-full md:w-auto overflow-x-auto">
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#7B2D97] text-white shadow-sm'
                    : 'text-[#6B6175] hover:text-[#1C1221] hover:bg-white/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Branch Filter */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <button
              onClick={() => setFilterByBranch(!filterByBranch)}
              className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                filterByBranch
                  ? 'bg-[#7B2D97] text-white border-[#7B2D97] shadow-sm'
                  : 'bg-white text-[#6B6175] border-[#D9D6E2] hover:text-[#1C1221]'
              }`}
              title="Filter treatments available at your selected branch"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>{filterByBranch ? `${activeBranch?.name} Only` : 'Show All Branches'}</span>
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#9B8DA6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search treatments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#D9D6E2] rounded-md text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
              />
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="py-8">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-[#ECEBF0] space-y-3">
              <Scissors className="w-8 h-8 text-[#9B8DA6] mx-auto" />
              <h3 className="font-serif text-xl text-[#1C1221]">No services found</h3>
              <p className="text-xs text-[#6B6175]">
                Try adjusting your search terms or view another category.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs text-[#7B2D97] font-semibold underline underline-offset-2"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white rounded-lg border border-[#ECEBF0] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1C1221]">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
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

                      {/* Branch Exclusivity Tag (Option C) */}
                      {service.branchIds &&
                        service.branchIds.length > 0 &&
                        !service.branchIds.includes('all') &&
                        service.branchIds.length < branches.length && (
                          <div className="flex items-center gap-1.5 text-[10px] text-[#7B2D97] bg-[#F7F1FB] border border-[#E8DDF1] px-2 py-0.5 rounded w-fit mb-2.5 font-medium">
                            <MapPin className="w-3 h-3 text-[#E5A93C] shrink-0" />
                            <span>
                              Exclusively at:{' '}
                              {service.branchIds
                                .map((id) => branches.find((b) => b.id === id)?.mallName || id)
                                .join(', ')}
                            </span>
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
                        className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded transition-colors cursor-pointer"
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
