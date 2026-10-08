import { ServiceItem, BeautyPackage, GalleryItem, SalonSettings, Branch, CategoryItem, AppUser, ContactMessage } from '../types/salon';
import { CDN_IMAGES } from '../lib/imageHelper';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'silang-premier',
    name: 'Premier Mall Silang (Flagship)',
    mallName: 'Premier Mall Silang',
    address: '2nd Level, Premier Mall, Aguinaldo Hwy, Silang, Cavite, 4118',
    city: 'Silang, Cavite',
    phone: '+63 917 877 5299',
    email: 'kendy.qtie@gmail.com',
    operatingHours: '10:00 AM – 9:00 PM Daily',
    googleMapsUrl: 'https://maps.google.com/?q=Premier+Mall+Silang+Cavite',
    isActive: true,
  },
  {
    id: 'tagaytay-serin',
    name: 'Ayala Malls Serin Tagaytay',
    mallName: 'Ayala Malls Serin',
    address: 'Ground Floor, Tagaytay - Nasugbu Hwy, Tagaytay, Cavite',
    city: 'Tagaytay City',
    phone: '+63 917 888 6300',
    email: 'serin@tiptopshears.com',
    operatingHours: '10:00 AM – 8:00 PM (Weekdays), 10:00 AM – 9:00 PM (Weekends)',
    googleMapsUrl: 'https://maps.google.com/?q=Ayala+Malls+Serin+Tagaytay',
    isActive: true,
  },
  {
    id: 'dasmarinas-central',
    name: 'SM City Dasmariñas Suite',
    mallName: 'SM City Dasmariñas',
    address: 'Upper Ground Level, Wellness Zone, Governor\'s Dr, Dasmariñas, Cavite',
    city: 'Dasmariñas, Cavite',
    phone: '+63 917 555 4210',
    email: 'dasma@tiptopshears.com',
    operatingHours: '10:00 AM – 9:00 PM Daily',
    googleMapsUrl: 'https://maps.google.com/?q=SM+City+Dasmarinas',
    isActive: true,
  }
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-hair',
    name: 'Hair & Styling',
    slug: 'hair',
    description: 'Precision shears sculpting, balayage, dimensional glossing, and keratin restorations',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-nails',
    name: 'Nails & Extensions',
    slug: 'nails',
    description: 'Russian dry manicures, Haute Gel-X extensions, glazed chrome, and bespoke nail art',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-spa',
    name: 'Spa & Wellness',
    slug: 'spa',
    description: 'Volcanic basalt stone foot rituals, Japanese scalp hydrotherapy, and holistic treatments',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-lashes',
    name: 'Lashes & Brows',
    slug: 'lashes',
    description: 'Keratin lash lifts, Russian volume extensions, brow lamination, and architecture',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-ambiance',
    name: 'Salon Ambiance & Lounge',
    slug: 'ambiance',
    description: 'Serene interior corners, private styling stations, and boutique sanctuary architecture',
    displayOrder: 5,
    isActive: true,
  }
];

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@tiptopshears.com',
    fullName: 'Kendy (Executive Director)',
    role: 'super_admin',
    branchId: 'all',
    phone: '+63 917 877 5299',
    password: 'tiptop2026!',
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
  },
  {
    id: 'usr-staff-silang',
    email: 'staff.silang@tiptopshears.com',
    fullName: 'Maria Santos (Front Desk Lead)',
    role: 'staff',
    branchId: 'silang-premier',
    phone: '+63 919 123 4567',
    password: 'staff2026!',
    createdAt: '2026-02-15T00:00:00Z',
    isActive: true,
  },
  {
    id: 'usr-staff-serin',
    email: 'staff.serin@tiptopshears.com',
    fullName: 'Camille Reyes (Reception Concierge)',
    role: 'staff',
    branchId: 'tagaytay-serin',
    phone: '+63 919 987 6543',
    password: 'staff2026!',
    createdAt: '2026-03-01T00:00:00Z',
    isActive: true,
  },
  {
    id: 'usr-client-1',
    email: 'client.sofia@example.com',
    fullName: 'Sofia Villareal',
    role: 'customer',
    branchId: 'silang-premier',
    phone: '+63 920 444 7788',
    password: 'client2026!',
    createdAt: '2026-04-10T00:00:00Z',
    isActive: true,
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'precision-master-cut',
    title: 'Signature Shears & Sculpt Cut',
    category: 'hair',
    categoryLabel: 'Hair & Styling',
    price: 750,
    durationMinutes: 60,
    description: 'Custom anatomical shears haircut personalized to your facial bone structure and hair texture, accompanied by an organic botanical clarifying scalp wash and blowout finish.',
    imageUrl: CDN_IMAGES.hairShears,
    features: [
      'Tailored consultation with Master Stylist',
      'Botanical scalp scrub & deep moisture mask',
      'Japanese high-carbon shears sculpting',
      'Signature thermal silk blowout & finish'
    ],
    isFeatured: true,
    popular: true,
  },
  {
    id: 'glazed-couture-manicure',
    title: 'Haute Glaze Gel Manicure',
    category: 'nails',
    categoryLabel: 'Nails & Extensions',
    price: 650,
    durationMinutes: 50,
    description: 'High-gloss couture gel manicure featuring hypoallergenic builder gel, immaculate e-file Russian cuticle refinement, and mirror chrome or gold leaf finish.',
    imageUrl: CDN_IMAGES.nailsCouture,
    features: [
      'Dry Russian precision cuticle detailing',
      'Non-toxic strengthening builder base',
      'Custom artisan nail shaping (almond/coffin/square)',
      'Subtle metallic foil or glazed chrome overlay'
    ],
    isFeatured: true,
    popular: true,
  },
  {
    id: 'botanical-stone-pedicure',
    title: 'Aura Botanical Stone Pedicure',
    category: 'spa',
    categoryLabel: 'Spa & Wellness',
    price: 850,
    durationMinutes: 75,
    description: 'Deep restorative foot ritual featuring warm Himalayan mineral foot soak, eucalyptus sugar exfoliation, volcanic basalt stone massage, and breathable high-shine polish.',
    imageUrl: CDN_IMAGES.pedicureSpa,
    features: [
      'Warm rose & dead sea mineral foot bath',
      'Aromatherapeutic brown sugar polish',
      '20-minute hot basalt stone acupressure',
      'Organic shea butter bootie moisture treatment'
    ],
    isFeatured: true,
    popular: false,
  },
  {
    id: 'balayage-dimensional-gloss',
    title: 'Artisan Balayage & Silk Gloss',
    category: 'hair',
    categoryLabel: 'Hair & Styling',
    price: 3800,
    durationMinutes: 150,
    description: 'Sun-kissed hand-painted multidimensional color seamless blend, followed by an acidic bonding gloss treatment for glass-like reflection.',
    imageUrl: CDN_IMAGES.hairBalayage,
    features: [
      'Custom freehand balayage painting',
      'Bond-builder protective infusion',
      'Formulated acidic toner glossing',
      'Volumizing blowout and soft brush waves'
    ],
    isFeatured: true,
    popular: true,
    branchIds: ['silang-premier', 'tagaytay-serin'],
  },
  {
    id: 'russian-apres-gel-x',
    title: 'Apres Gel-X Architectural Extensions',
    category: 'nails',
    categoryLabel: 'Nails & Extensions',
    price: 1450,
    durationMinutes: 90,
    description: 'Soft gel full-coverage extensions providing natural-looking length with zero damage to the natural nail plate, paired with editorial nail art.',
    imageUrl: CDN_IMAGES.nailsGelX,
    features: [
      'Full-cover soft gel tips tailored to nail beds',
      'Dry cuticle care for long-lasting retention',
      'Reinforced apex for slender architectural strength',
      'Includes choice of French micro-line or minimalist chrome'
    ],
    branchIds: ['silang-premier', 'dasmarinas-central'],
    isFeatured: false,
    popular: false,
  },
  {
    id: 'scalp-detox-head-spa',
    title: 'Zenith Scalp Detox & Hydrotherapy',
    category: 'spa',
    categoryLabel: 'Spa & Wellness',
    price: 1200,
    durationMinutes: 60,
    description: 'Japanese-style head spa incorporating high-definition trichoscopic scalp analysis, waterfall hydro-mist steam, and pressure-point neck massage.',
    imageUrl: CDN_IMAGES.scalpHydro,
    features: [
      'Micro-camera scalp & follicle diagnosis',
      'Warm herbal water halo cascade ring',
      'Anti-aging lymphatic drainage head massage',
      'Keratin restoration blowout'
    ],
    branchIds: ['silang-premier', 'tagaytay-serin'],
    isFeatured: false,
    popular: true,
  }
];

export const INITIAL_PACKAGES: BeautyPackage[] = [
  {
    id: 'pkg-royal-glow',
    title: 'The Royal Shears & Nails Ritual',
    subtitle: 'Our ultimate head-to-toe luxury transformation package',
    price: 2100,
    originalPrice: 2650,
    durationMinutes: 180,
    description: 'Indulge in a curated afternoon of refined pampering combining our Signature Shears Cut, Haute Glaze Gel Manicure, and Botanical Stone Pedicure with complimentary refreshment service.',
    includedServices: [
      'Signature Shears & Sculpt Cut with Silk Blowout',
      'Haute Glaze Gel Manicure with Chrome / Foil',
      'Aura Botanical Stone Pedicure with Foot Mask',
      'Complimentary organic herbal tea or specialty beverage'
    ],
    imageUrl: CDN_IMAGES.hero,
    branchIds: [],
    isPopular: true,
    badgeText: 'Most Requested',
  },
  {
    id: 'pkg-bridal-luxe',
    title: 'The Haute Bridal & Event Suite',
    subtitle: 'Flawless styling designed for high-stakes occasions',
    price: 4200,
    originalPrice: 5200,
    durationMinutes: 240,
    description: 'Complete couture hair styling, Apres Gel-X luxury extensions with customized bridal nail art, soothing scalp massage, and deluxe hand hydration.',
    includedServices: [
      'Couture Updo or Hollywood Wave Styling',
      'Apres Gel-X Architectural Extensions & Bridal Art',
      'Deluxe Rose Petal Manicure & Hand Peel',
      'Take-home touch-up styling kit'
    ],
    imageUrl: CDN_IMAGES.nailsCouture,
    branchIds: ['silang-premier'],
    isPopular: false,
    badgeText: 'Flagship Exclusive',
  },
  {
    id: 'pkg-express-refresh',
    title: 'The Midweek Executive Refresh',
    subtitle: 'Streamlined polish and poise for the busy professional',
    price: 1350,
    originalPrice: 1700,
    durationMinutes: 90,
    description: 'Synchronized dual-technician service: enjoy an invigorating scalp wash and blowout while your nails receive an express gel manicure.',
    includedServices: [
      'Invigorating Aromatherapy Scalp Wash',
      'Signature Velvet Blowout & Style',
      'Express Russian Cuticle Care & Gel Polish',
      'Quick tension-release neck massage'
    ],
    imageUrl: CDN_IMAGES.hairShears,
    isPopular: false,
    badgeText: 'Dual-Tech Service',
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Precision Shears Detailing',
    category: 'hair',
    imageUrl: CDN_IMAGES.hairShears,
    caption: 'Clean, architectural angles sculpted with Japanese steel shears for natural volume and movement.'
  },
  {
    id: 'gal-2',
    title: 'Glazed Almond Couture Nails',
    category: 'nails',
    imageUrl: CDN_IMAGES.nailsCouture,
    caption: 'Soft nude overlay with micro gold leaf inlay and ultra-glossy glass topcoat.'
  },
  {
    id: 'gal-3',
    title: 'The Serene Sanctuary Lounge',
    category: 'ambiance',
    imageUrl: CDN_IMAGES.ambiance,
    caption: 'Warm ambient illumination and deep forest green velvet stations designed for calm and privacy.'
  },
  {
    id: 'gal-4',
    title: 'Basalt Stone Pedicure Suite',
    category: 'spa',
    imageUrl: CDN_IMAGES.pedicureSpa,
    caption: 'Sculpted natural stone basins with botanical soaks and warm volcanic basalt stones.'
  },
  {
    id: 'gal-5',
    title: 'Boutique Reception & Care Bar',
    category: 'ambiance',
    imageUrl: CDN_IMAGES.interiorReception,
    caption: 'Fluted wood detailing, warm curved archways, and organic plant botanicals.'
  },
  {
    id: 'gal-6',
    title: 'French Micro-Line Architecture',
    category: 'nails',
    imageUrl: CDN_IMAGES.nailsGelX,
    caption: 'Ultra-fine chrome metallic tips on square-oval Russian builder gel structure.'
  }
];

export const INITIAL_SETTINGS: SalonSettings = {
  salonName: 'Tiptop Shears and Nails',
  tagline: 'Beauty that Reflects Your Style',
  address: 'Premier Mall, Silang, Philippines, 4118',
  phone: '+63 917 877 5299',
  email: 'kendy.qtie@gmail.com',
  hoursWeekday: 'Monday – Sunday: 10:00 AM – 9:00 PM (Mall Hours)',
  hoursWeekend: 'Mall Hours: 10:00 AM – 9:00 PM',
  announcementText: 'New Customer? Get 20% Off On Your First Visit',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61589363127257',
  instagramUrl: 'https://www.instagram.com/tiptop_salon/',
  tiktokUrl: 'https://tiktok.com/@tiptopshears',
  discountPercentage: 20,
  // Exclusive Welcome / Promos Customization
  promoEnabled: true,
  promoBadge: 'Exclusive Welcome Privilege',
  promoTitle: 'Get 20% Off On Your First Visit',
  promoDescription: 'Reserve any signature hair sculpting service or couture nail set and receive an introductory 20% privilege applied at checkout.',
  promoButtonText: 'Claim First Visit Privilege',
  // Standard (About contents) Customization
  aboutHeroTitle: 'The Philosophy of Tiptop',
  aboutHeroSubtitle: 'Founded on the conviction that true beauty emerges when masterful technique is paired with genuine hospitality and unhurried craftsmanship.',
  aboutStoryHeadline: 'From Passion Project to Premier Boutique Atelier',
  aboutStoryBody: 'Tiptop Shears and Nails began with a singular goal: to create a modern salon experience where guests never feel rushed through an assembly line. We set out to build an intimate space where Japanese high-carbon shears, European builder gel chemistry, and organic botanical trichology coexist under one roof. Every client is treated to a personalized anatomical consultation tailored to their face structure, skin tone, and everyday lifestyle.',
  aboutQuote: 'Precision shears cut and bespoke nail art crafted for modern elegance.',
  checklistItems: [
    'Private, low-volume styling stations designed for tranquility',
    'Custom Japanese high-carbon shears tailored to hair texture and grain',
    'European dry Russian cuticle detailing and builder gel overlays',
    'Complimentary consultation with every treatment and tailored aftercare regimen'
  ]
};

export const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Clarisse Monteverde',
    email: 'clarisse.m@gmail.com',
    phone: '+63 917 234 5678',
    inquiryType: 'Bridal & Group Booking',
    message: 'Hello! Inquiring for bridal hair and bespoke nail architecture packages for 5 bridesmaids this coming December at Premier Mall Silang. Do you offer private atelier buyouts?',
    branchId: 'silang-premier',
    branchName: 'Premier Mall Silang (Flagship)',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg-2',
    name: 'Gianna Reyes',
    email: 'gianna.reyes@outlook.com',
    phone: '+63 928 456 7890',
    inquiryType: 'Appointment Inquiry',
    message: 'Hi team, would love to book a Japanese high-carbon shears haircut and dimensional balayage for next Saturday afternoon. Which senior colorist would you recommend?',
    branchId: 'tagaytay-serin',
    branchName: 'Ayala Malls Serin Tagaytay',
    status: 'read',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    replyNotes: 'Advised client on weekend slots with Master Stylist.'
  }
];

