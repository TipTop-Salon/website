import React, { useState, useMemo } from 'react';
import { X, ZoomIn, Sparkles, Filter } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { GalleryItem } from '../types/salon';

export const GalleryPage: React.FC = () => {
  const { gallery, categories: salonCategories } = useSalon();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  // Dynamically constructed from Category Manager + any unique tags in portfolio
  const categories = useMemo(() => {
    const list: { id: string; label: string }[] = [{ id: 'all', label: 'All Portfolios' }];

    // Active categories from Category Manager
    salonCategories
      .filter((c) => c.isActive)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .forEach((cat) => {
        list.push({ id: cat.slug, label: cat.name });
      });

    // Also include any unique category slugs in gallery not already in categories
    gallery.forEach((item) => {
      const slug = item.category?.toLowerCase() || '';
      if (slug && slug !== 'all' && !list.some((c) => c.id.toLowerCase() === slug)) {
        list.push({
          id: item.category,
          label: item.category.charAt(0).toUpperCase() + item.category.slice(1).replace(/-/g, ' ')
        });
      }
    });

    return list;
  }, [salonCategories, gallery]);

  const filteredItems = gallery.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  const getCategoryLabel = (catSlug: string) => {
    const found = categories.find((c) => c.id.toLowerCase() === (catSlug || '').toLowerCase());
    return found ? found.label : catSlug;
  };

  return (
    <div className="bg-[#FAFAFB] min-h-screen">
      {/* Header Banner */}
      <section className="bg-[#1C1221] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#32223D]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[#E5A93C] text-xs uppercase tracking-[0.2em] font-semibold block">
            Visual Portfolio
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-white tracking-tight">
            The Atelier <span className="font-serif italic text-[#E5A93C]">Gallery</span>
          </h1>
          <p className="text-sm text-[#DDD7E3] leading-relaxed max-w-xl mx-auto">
            A visual documentation of precision shears haircuts, architectural gel transformations, and the serene corners of our sanctuary.
          </p>
        </div>
      </section>

      {/* Filter Tabs & Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#7B2D97] text-white shadow-sm'
                  : 'bg-white text-[#6B6175] border border-[#ECEBF0] hover:text-[#1C1221]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group relative bg-white rounded-lg border border-[#ECEBF0] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1C1221]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1221]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                  <div className="text-white">
                    <span className="text-[#E5A93C] text-[11px] uppercase tracking-wider font-semibold block mb-1">
                      {getCategoryLabel(item.category)}
                    </span>
                    <h4 className="font-serif text-lg font-medium">
                      {item.title}
                    </h4>
                  </div>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1C1221]/80 text-[#E5A93C] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              <div className="p-4 bg-white">
                <h4 className="font-serif text-base font-semibold text-[#1C1221] mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-[#6B6175] line-clamp-2">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1221]/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#1C1221] rounded-xl overflow-hidden shadow-2xl border border-[#32223D]"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#1C1221]/80 text-white hover:text-[#E5A93C] transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative aspect-[16/10] w-full bg-black">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-6 text-white bg-[#1C1221] border-t border-[#32223D]">
              <span className="text-[#E5A93C] text-xs uppercase tracking-widest font-semibold block mb-1">
                {selectedPhoto.category}
              </span>
              <h3 className="font-serif text-2xl font-medium mb-2">
                {selectedPhoto.title}
              </h3>
              <p className="text-sm text-[#DDD7E3] leading-relaxed">
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
