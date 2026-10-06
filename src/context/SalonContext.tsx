import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ServiceItem,
  BeautyPackage,
  Booking,
  GalleryItem,
  SalonSettings,
  Branch,
  CategoryItem,
  AppUser,
  UserRole,
} from '../types/salon';
import {
  INITIAL_SERVICES,
  INITIAL_PACKAGES,
  INITIAL_GALLERY,
  INITIAL_SETTINGS,
  INITIAL_BRANCHES,
  INITIAL_CATEGORIES,
  INITIAL_USERS,
} from '../data/initialData';
import { getSupabaseClient } from '../lib/supabase';

interface SalonContextType {
  // Navigation & Routing
  currentPath: string;
  navigate: (path: string) => void;
  serviceIdParam: string | null;

  // Data
  services: ServiceItem[];
  packages: BeautyPackage[];
  bookings: Booking[];
  gallery: GalleryItem[];
  settings: SalonSettings;
  isLoading: boolean;

  // Multi-Branch Management
  branches: Branch[];
  activeBranchId: string;
  activeBranch: Branch;
  setActiveBranchId: (id: string) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<Branch>;
  updateBranch: (id: string, updates: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;

  // Category Management
  categories: CategoryItem[];
  addCategory: (cat: Omit<CategoryItem, 'id'>) => Promise<CategoryItem>;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // User Accounts & Roles
  users: AppUser[];
  currentUser: AppUser | null;
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => Promise<AppUser>;
  updateUser: (id: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  isSuperAdmin: boolean;
  isStaff: boolean;

  // Supabase Status
  supabaseConnected: boolean;
  supabaseUrl: string;
  supabaseKey: string;
  supabaseSyncError: string | null;
  setSupabaseCredentials: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  syncWithSupabase: () => Promise<void>;
  fullCloudSync: () => Promise<{ success: boolean; message: string }>;
  seedSupabaseFromCatalog: () => Promise<{ success: boolean; message: string }>;

  // Admin Auth
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;

  // CRUD Operations for Services & Packages
  createService: (service: Omit<ServiceItem, 'id'>) => Promise<ServiceItem>;
  updateService: (id: string, updates: Partial<ServiceItem>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  createPackage: (pkg: Omit<BeautyPackage, 'id'>) => Promise<BeautyPackage>;
  updatePackage: (id: string, updates: Partial<BeautyPackage>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;

  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;

  updateSettings: (updates: Partial<SalonSettings>) => void;

  // Gallery Portfolio CRUD
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<GalleryItem>;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;

  // Booking Modal
  isBookingModalOpen: boolean;
  preselectedItem: ServiceItem | BeautyPackage | null;
  openBookingModal: (item?: ServiceItem | BeautyPackage) => void;
  closeBookingModal: () => void;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  SERVICES: 'tiptop_services_data',
  PACKAGES: 'tiptop_packages_data',
  BOOKINGS: 'tiptop_bookings_data',
  SETTINGS: 'tiptop_settings_data',
  GALLERY: 'tiptop_gallery_data',
  BRANCHES: 'tiptop_branches_data',
  ACTIVE_BRANCH_ID: 'tiptop_active_branch_id',
  CATEGORIES: 'tiptop_categories_data',
  USERS: 'tiptop_users_data',
  AUTH: 'tiptop_admin_authenticated',
  ADMIN_EMAIL: 'tiptop_admin_email',
  CURRENT_USER: 'tiptop_current_user',
  SUPABASE_URL: 'tiptop_supabase_url',
  SUPABASE_KEY: 'tiptop_supabase_key',
};

export const SalonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Routing with robust support for /admin path and #admin hash
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const h = window.location.hash;
      const s = window.location.search;
      if (p.startsWith('/admin') || h === '#admin' || h.startsWith('#/admin') || s.includes('admin=true')) {
        return '/admin';
      }
      return p || '/';
    }
    return '/';
  });

  // 1. Branches State
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BRANCHES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing cached branches', e);
      }
    }
    return INITIAL_BRANCHES;
  });

  const [activeBranchId, setActiveBranchIdState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVE_BRANCH_ID) || 'silang-premier';
  });

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0] || INITIAL_BRANCHES[0];

  const setActiveBranchId = (id: string) => {
    setActiveBranchIdState(id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_BRANCH_ID, id);
  };

  // 2. Categories State
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing cached categories', e);
      }
    }
    return INITIAL_CATEGORIES;
  });

  // 3. User Accounts & Roles State
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing cached users', e);
      }
    }
    return INITIAL_USERS;
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing cached user', e);
      }
    }
    const isAuth = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH) === 'true';
    const email = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_EMAIL);
    if (isAuth && email) {
      const match = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      return match || {
        id: 'usr-admin-default',
        email,
        fullName: 'Administrator',
        role: 'super_admin',
        branchId: 'all',
        createdAt: new Date().toISOString(),
        isActive: true,
      };
    }
    return null;
  });

  // Services State
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SERVICES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].price < 300) {
          return INITIAL_SERVICES;
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing cached services', e);
      }
    }
    return INITIAL_SERVICES;
  });

  // Packages State
  const [packages, setPackages] = useState<BeautyPackage[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PACKAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].price < 1000) {
          return INITIAL_PACKAGES;
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing cached packages', e);
      }
    }
    return INITIAL_PACKAGES;
  });

  // Bookings State (Branch-aware)
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Normalize any old bookings to have branch data
        return parsed.map((item: any) => ({
          ...item,
          branchId: item.branchId || 'silang-premier',
          branchName: item.branchName || 'Premier Mall Silang (Flagship)',
        }));
      } catch (e) {
        console.error('Error parsing cached bookings', e);
      }
    }
    return [
      {
        id: 'bk-demo-1',
        serviceId: 'precision-master-cut',
        serviceTitle: 'Signature Shears & Sculpt Cut',
        branchId: 'silang-premier',
        branchName: 'Premier Mall Silang (Flagship)',
        customerName: 'Eleanor Vance',
        customerEmail: 'eleanor.v@example.com',
        customerPhone: '+63 917 123 4567',
        appointmentDate: '2026-10-06',
        appointmentTime: '11:00 AM',
        stylist: 'Master Stylist Claire',
        notes: 'First time visitor, interested in face-framing layers.',
        totalPrice: 750,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'bk-demo-2',
        serviceId: 'glazed-couture-manicure',
        serviceTitle: 'Haute Glaze Gel Manicure',
        branchId: 'tagaytay-serin',
        branchName: 'Ayala Malls Serin Tagaytay',
        customerName: 'Sophia Laurent',
        customerEmail: 'sophia.l@example.com',
        customerPhone: '+63 918 765 4321',
        appointmentDate: '2026-10-07',
        appointmentTime: '2:30 PM',
        stylist: 'Artisan Nailist Vivienne',
        notes: 'Prefers almond shape with subtle chrome dust.',
        totalPrice: 650,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 'bk-demo-3',
        serviceId: 'scalp-detox-head-spa',
        serviceTitle: 'Zenith Scalp Detox & Hydrotherapy',
        branchId: 'dasmarinas-central',
        branchName: 'SM City Dasmariñas Suite',
        customerName: 'Patricia Gomez',
        customerEmail: 'patricia.g@example.com',
        customerPhone: '+63 919 444 3322',
        appointmentDate: '2026-10-08',
        appointmentTime: '3:45 PM',
        stylist: 'Spa Specialist Maya',
        notes: 'Requested quiet relaxation session.',
        totalPrice: 1200,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.GALLERY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing cached gallery', e);
      }
    }
    return INITIAL_GALLERY;
  });

  const [settings, setSettings] = useState<SalonSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_SETTINGS, ...parsed };
      } catch (e) {
        console.error('Error parsing cached settings', e);
      }
    }
    return INITIAL_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Supabase status
  const [supabaseUrl, setSupabaseUrlState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.SUPABASE_URL) || import.meta.env.VITE_SUPABASE_URL || '';
  });
  const [supabaseKey, setSupabaseKeyState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.SUPABASE_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  });
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseSyncError, setSupabaseSyncError] = useState<string | null>(null);

  // Admin Auth
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH) === 'true';
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_EMAIL) || null;
  });

  // Role Checks
  const isSuperAdmin = currentUser?.role === 'super_admin' || adminEmail === 'admin@tiptopshears.com';
  const isStaff = currentUser?.role === 'staff' || isSuperAdmin;

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedItem, setPreselectedItem] = useState<ServiceItem | BeautyPackage | null>(null);

  // Browser popstate and hashchange handler
  useEffect(() => {
    const handleUrlChange = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      const s = window.location.search;
      if (p.startsWith('/admin') || h === '#admin' || h.startsWith('#/admin') || s.includes('admin=true')) {
        setCurrentPath('/admin');
      } else {
        setCurrentPath(p || '/');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Keyboard shortcut for staff/superadmin to quietly enter portal: Alt + A or Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigate = (path: string) => {
    if (path.startsWith('/admin')) {
      try {
        window.history.pushState({}, '', '/admin');
      } catch (e) {
        // fallback
      }
      try {
        window.location.hash = 'admin';
      } catch (e) {
        // ignore
      }
      setCurrentPath('/admin');
    } else {
      if (window.location.hash === '#admin' || window.location.hash.startsWith('#/admin')) {
        try {
          window.history.replaceState(null, '', path);
        } catch (e) {
          window.location.hash = '';
        }
      } else {
        try {
          window.history.pushState({}, '', path);
        } catch (e) {
          // ignore
        }
      }
      setCurrentPath(path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
  }, [gallery]);

  // Check Supabase connection on load
  useEffect(() => {
    const checkSupabase = async () => {
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (client) {
        try {
          const { error } = await client.from('services').select('id').limit(1);
          if (!error) {
            setSupabaseConnected(true);
            await syncWithSupabase();
          } else {
            setSupabaseConnected(false);
          }
        } catch {
          setSupabaseConnected(false);
        }
      }
    };
    checkSupabase();
  }, [supabaseUrl, supabaseKey]);

  // Sync with Supabase (Services, Packages, Bookings, Branches, Categories)
  const syncWithSupabase = async () => {
    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (!client) return;

    try {
      setIsLoading(true);

      // Fetch branches if table exists
      try {
        const { data: bList, error: bErr } = await client.from('branches').select('*');
        if (!bErr && bList && bList.length > 0) {
          const mappedBranches: Branch[] = bList.map(item => ({
            id: item.id,
            name: item.name,
            mallName: item.mall_name || '',
            address: item.address,
            city: item.city,
            phone: item.phone,
            email: item.email || '',
            operatingHours: item.operating_hours,
            googleMapsUrl: item.google_maps_url,
            isActive: item.is_active ?? true,
          }));
          setBranches(mappedBranches);
        }
      } catch (err) {
        console.warn('Branches sync note:', err);
      }

      // Fetch categories if table exists
      try {
        const { data: cList, error: cErr } = await client.from('service_categories').select('*').order('display_order', { ascending: true });
        if (!cErr && cList && cList.length > 0) {
          const mappedCategories: CategoryItem[] = cList.map(item => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description || '',
            displayOrder: item.display_order || 0,
            isActive: item.is_active ?? true,
          }));
          setCategories(mappedCategories);
        }
      } catch (err) {
        console.warn('Categories sync note:', err);
      }

      // Fetch app_users if table exists
      try {
        const { data: uList, error: uErr } = await client.from('app_users').select('*').order('created_at', { ascending: false });
        if (!uErr && uList && uList.length > 0) {
          const mappedUsers: AppUser[] = uList.map(item => ({
            id: item.id,
            email: item.email,
            fullName: item.full_name,
            role: item.role as UserRole,
            branchId: item.branch_id || 'all',
            phone: item.phone || '',
            isActive: item.is_active ?? true,
            createdAt: item.created_at
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.warn('Users sync note:', err);
      }

      // Fetch services
      const { data: sData, error: sErr } = await client.from('services').select('*');
      if (!sErr && sData && sData.length > 0) {
        const mappedServices: ServiceItem[] = sData.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          categoryLabel: item.category_label,
          price: Number(item.price),
          durationMinutes: Number(item.duration_minutes),
          description: item.description,
          imageUrl: item.image_url,
          features: item.features || [],
          branchIds: item.branch_ids || [],
          isFeatured: item.is_featured,
          popular: item.popular
        }));
        setServices(mappedServices);
      }

      // Fetch packages
      const { data: pData, error: pErr } = await client.from('packages').select('*');
      if (!pErr && pData && pData.length > 0) {
        const mappedPackages: BeautyPackage[] = pData.map(item => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          price: Number(item.price),
          originalPrice: Number(item.original_price),
          durationMinutes: Number(item.duration_minutes),
          description: item.description,
          includedServices: item.included_services || [],
          imageUrl: item.image_url,
          branchIds: item.branch_ids || [],
          isPopular: item.is_popular,
          badgeText: item.badge_text
        }));
        setPackages(mappedPackages);
      }

      // Fetch bookings
      const { data: bData, error: bErr } = await client.from('bookings').select('*').order('created_at', { ascending: false });
      if (!bErr && bData && bData.length > 0) {
        const mappedBookings: Booking[] = bData.map(item => ({
          id: item.id,
          serviceId: item.service_id,
          serviceTitle: item.service_title,
          branchId: item.branch_id || 'silang-premier',
          branchName: item.branch_name || 'Premier Mall Silang (Flagship)',
          customerName: item.customer_name,
          customerEmail: item.customer_email,
          customerPhone: item.customer_phone,
          appointmentDate: item.appointment_date,
          appointmentTime: item.appointment_time,
          stylist: item.stylist,
          notes: item.notes,
          totalPrice: Number(item.total_price),
          status: item.status,
          createdAt: item.created_at
        }));
        setBookings(mappedBookings);
      }

      // Fetch gallery if table exists
      try {
        const { data: gData, error: gErr } = await client.from('gallery').select('*').order('created_at', { ascending: false });
        if (!gErr && gData && gData.length > 0) {
          const mappedGallery: GalleryItem[] = gData.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            imageUrl: item.image_url || item.imageUrl || '',
            caption: item.caption || ''
          }));
          setGallery(mappedGallery);
        }
      } catch (err) {
        console.warn('Gallery sync note:', err);
      }

      // Fetch salon settings if table exists
      try {
        const { data: setRow, error: setErr } = await client.from('salon_settings').select('settings_json').eq('id', 'primary').single();
        if (!setErr && setRow && setRow.settings_json) {
          setSettings(prev => ({ ...prev, ...setRow.settings_json }));
        }
      } catch (err) {
        console.warn('Settings sync note:', err);
      }

      setSupabaseSyncError(null);
    } catch (e: any) {
      console.warn('Sync error with Supabase, staying with local state:', e);
      setSupabaseSyncError('Cloud synchronization is momentarily unavailable. The atelier is running smoothly on cached catalog mode.');
    } finally {
      setIsLoading(false);
    }
  };

  // One-click manual seed to Supabase from the local catalog on demand
  const seedSupabaseFromCatalog = async (): Promise<{ success: boolean; message: string }> => {
    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (!client || !supabaseConnected) {
      return { success: false, message: 'Please connect to Supabase first before seeding.' };
    }

    try {
      setIsLoading(true);

      // 1. Branches
      if (branches.length > 0) {
        await client.from('branches').upsert(
          branches.map(b => ({
            id: b.id,
            name: b.name,
            mall_name: b.mallName,
            address: b.address,
            city: b.city,
            phone: b.phone,
            email: b.email,
            operating_hours: b.operatingHours,
            google_maps_url: b.googleMapsUrl,
            is_active: b.isActive
          }))
        );
      }

      // 2. Categories
      if (categories.length > 0) {
        await client.from('service_categories').upsert(
          categories.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            display_order: c.displayOrder,
            is_active: c.isActive
          }))
        );
      }

      // 3. Services
      if (services.length > 0) {
        await client.from('services').upsert(
          services.map(s => ({
            id: s.id,
            title: s.title,
            category: s.category,
            category_label: s.categoryLabel,
            price: s.price,
            duration_minutes: s.durationMinutes,
            description: s.description,
            image_url: s.imageUrl,
            features: s.features,
            branch_ids: s.branchIds,
            is_featured: s.isFeatured,
            popular: s.popular
          }))
        );
      }

      // 4. Packages
      if (packages.length > 0) {
        await client.from('packages').upsert(
          packages.map(p => ({
            id: p.id,
            title: p.title,
            subtitle: p.subtitle,
            price: p.price,
            original_price: p.originalPrice,
            duration_minutes: p.durationMinutes,
            description: p.description,
            included_services: p.includedServices,
            image_url: p.imageUrl,
            branch_ids: p.branchIds,
            is_popular: p.isPopular,
            badge_text: p.badgeText
          }))
        );
      }

      // 5. Bookings
      if (bookings.length > 0) {
        await client.from('bookings').upsert(
          bookings.map(bk => ({
            id: bk.id,
            service_id: bk.serviceId,
            service_title: bk.serviceTitle,
            branch_id: bk.branchId,
            branch_name: bk.branchName,
            customer_name: bk.customerName,
            customer_email: bk.customerEmail,
            customer_phone: bk.customerPhone,
            appointment_date: bk.appointmentDate,
            appointment_time: bk.appointmentTime,
            stylist: bk.stylist,
            notes: bk.notes,
            total_price: bk.totalPrice,
            status: bk.status
          }))
        );
      }

      // 6. Gallery
      if (gallery.length > 0) {
        await client.from('gallery').upsert(
          gallery.map(g => ({
            id: g.id,
            title: g.title,
            category: g.category,
            image_url: g.imageUrl,
            caption: g.caption
          }))
        );
      }

      // 7. Salon Settings
      await client.from('salon_settings').upsert({
        id: 'primary',
        settings_json: settings,
        updated_at: new Date().toISOString()
      });

      // 8. App Users
      if (users.length > 0) {
        await client.from('app_users').upsert(
          users.map(u => ({
            id: u.id,
            email: u.email,
            full_name: u.fullName,
            role: u.role,
            branch_id: u.branchId === 'all' ? null : u.branchId,
            phone: u.phone,
            is_active: u.isActive
          }))
        );
      }

      await syncWithSupabase();
      return {
        success: true,
        message: `Full Cloud Sync Complete! All 8 tables synchronized with Supabase: ${branches.length} branches, ${categories.length} categories, ${services.length} services, ${packages.length} packages, ${bookings.length} bookings, ${gallery.length} gallery photos, and ${users.length} users.`
      };
    } catch (err: any) {
      console.error('Cloud sync error:', err);
      return { success: false, message: err.message || 'Failed to complete full cloud sync.' };
    } finally {
      setIsLoading(false);
    }
  };

  const fullCloudSync = seedSupabaseFromCatalog;

  const setSupabaseCredentials = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUPABASE_URL, url);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUPABASE_KEY, key);
    setSupabaseUrlState(url);
    setSupabaseKeyState(key);

    const client = getSupabaseClient(url, key);
    if (!client) {
      setSupabaseConnected(false);
      return { success: false, message: 'Invalid Supabase URL or credentials format.' };
    }

    try {
      const { error } = await client.from('services').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return {
          success: true,
          message: 'Connected to Supabase project! (Ensure the multi-branch SQL migration is executed in SQL Editor)'
        };
      }
      setSupabaseConnected(true);
      await syncWithSupabase();
      return { success: true, message: 'Successfully connected and synchronized with Supabase!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to connect to Supabase.' };
    }
  };

  // Admin Auth handlers with Role Support
  const adminLogin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth if connected
    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });
        if (!error && data.user) {
          const matchingAppUser = users.find(u => u.email.toLowerCase() === cleanEmail);
          const assignedRole = matchingAppUser?.role || (cleanEmail.includes('admin') ? 'super_admin' : 'staff');
          const authenticatedUser: AppUser = matchingAppUser || {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            fullName: data.user.user_metadata?.full_name || 'Staff Member',
            role: assignedRole,
            branchId: 'all',
            createdAt: new Date().toISOString(),
            isActive: true,
          };

          setIsAdminAuthenticated(true);
          setAdminEmail(authenticatedUser.email);
          setCurrentUser(authenticatedUser);
          localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
          localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_EMAIL, authenticatedUser.email);
          localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(authenticatedUser));
          return { success: true };
        }
      } catch (e) {
        console.warn('Supabase auth fallback to local credentials', e);
      }
    }

    // 2. Check local users list
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (foundUser) {
      // Validate password if configured, or default demo password
      const validPass = foundUser.password ? foundUser.password === pass : (pass === 'tiptop2026!' || pass === 'staff2026!' || pass === 'admin123');
      if (validPass) {
        setIsAdminAuthenticated(true);
        setAdminEmail(foundUser.email);
        setCurrentUser(foundUser);
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
        localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_EMAIL, foundUser.email);
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(foundUser));
        return { success: true };
      }
    }

    // 3. Fallback demo super_admin shortcut
    if (cleanEmail === 'admin@tiptopshears.com' && (pass === 'tiptop2026!' || pass === 'admin123')) {
      const superAdminUser: AppUser = {
        id: 'usr-admin-1',
        email: 'admin@tiptopshears.com',
        fullName: 'Kendy (Executive Director)',
        role: 'super_admin',
        branchId: 'all',
        phone: '+63 917 877 5299',
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      setIsAdminAuthenticated(true);
      setAdminEmail(superAdminUser.email);
      setCurrentUser(superAdminUser);
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_EMAIL, superAdminUser.email);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(superAdminUser));
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Try Super Admin: admin@tiptopshears.com / tiptop2026! or Staff: staff.silang@tiptopshears.com / staff2026!'
    };
  };

  const adminLogout = () => {
    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client) {
      void client.auth.signOut();
    }
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ADMIN_EMAIL);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
  };

  // CRUD for Branches
  const addBranch = async (branchData: Omit<Branch, 'id'>): Promise<Branch> => {
    const newId = branchData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `branch-${Date.now()}`;
    const newBranch: Branch = {
      ...branchData,
      id: newId,
    };
    setBranches(prev => [...prev, newBranch]);

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('branches').insert({
        id: newId,
        name: newBranch.name,
        mall_name: newBranch.mallName,
        address: newBranch.address,
        city: newBranch.city,
        phone: newBranch.phone,
        email: newBranch.email,
        operating_hours: newBranch.operatingHours,
        google_maps_url: newBranch.googleMapsUrl,
        is_active: newBranch.isActive,
      }).then(({ error }) => {
        if (error) console.error('Supabase branch insert error', error);
      });
    }

    return newBranch;
  };

  const updateBranch = async (id: string, updates: Partial<Branch>): Promise<void> => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.mallName !== undefined) payload.mall_name = updates.mallName;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.city !== undefined) payload.city = updates.city;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.operatingHours !== undefined) payload.operating_hours = updates.operatingHours;
      if (updates.googleMapsUrl !== undefined) payload.google_maps_url = updates.googleMapsUrl;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      client.from('branches').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase branch update error', error);
      });
    }
  };

  const deleteBranch = async (id: string): Promise<void> => {
    setBranches(prev => prev.filter(b => b.id !== id));
    if (activeBranchId === id) {
      const remaining = branches.filter(b => b.id !== id);
      if (remaining.length > 0) {
        setActiveBranchId(remaining[0].id);
      }
    }

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('branches').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase branch delete error', error);
      });
    }
  };

  // CRUD for Categories
  const addCategory = async (catData: Omit<CategoryItem, 'id'>): Promise<CategoryItem> => {
    const slug = catData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
    const newCategory: CategoryItem = {
      ...catData,
      id: `cat-${slug}`,
      slug,
      displayOrder: catData.displayOrder || categories.length + 1,
    };

    setCategories(prev => [...prev, newCategory]);

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('service_categories').insert({
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        display_order: newCategory.displayOrder,
        is_active: newCategory.isActive,
      }).then(({ error }) => {
        if (error) console.error('Supabase category insert error', error);
      });
    }

    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<CategoryItem>): Promise<void> => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.slug !== undefined) payload.slug = updates.slug;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      client.from('service_categories').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase category update error', error);
      });
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    setCategories(prev => prev.filter(c => c.id !== id));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('service_categories').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase category delete error', error);
      });
    }
  };

  // CRUD for Users
  const addUser = async (userData: Omit<AppUser, 'id' | 'createdAt'>): Promise<AppUser> => {
    const newId = `usr-${Date.now().toString().slice(-6)}`;
    const newUser: AppUser = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('app_users').insert({
        id: newId,
        email: newUser.email,
        full_name: newUser.fullName,
        role: newUser.role,
        branch_id: newUser.branchId === 'all' ? null : newUser.branchId,
        phone: newUser.phone,
        is_active: newUser.isActive,
      }).then(({ error }) => {
        if (error) console.error('Supabase user insert error', error);
      });
    }

    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<AppUser>): Promise<void> => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      const payload: any = {};
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.branchId !== undefined) payload.branch_id = updates.branchId === 'all' ? null : updates.branchId;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      client.from('app_users').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase user update error', error);
      });
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    setUsers(prev => prev.filter(u => u.id !== id));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('app_users').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase user delete error', error);
      });
    }
  };

  // CRUD for Services
  const createService = async (newServiceData: Omit<ServiceItem, 'id'>): Promise<ServiceItem> => {
    const newId = `srv-${Date.now()}`;
    const newService: ServiceItem = {
      ...newServiceData,
      id: newId
    };

    setServices(prev => [newService, ...prev]);

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('services').insert({
        id: newId,
        title: newService.title,
        category: newService.category,
        category_label: newService.categoryLabel,
        price: newService.price,
        duration_minutes: newService.durationMinutes,
        description: newService.description,
        image_url: newService.imageUrl,
        features: newService.features,
        branch_ids: newService.branchIds || [],
        is_featured: newService.isFeatured,
        popular: newService.popular
      }).then(({ error }) => {
        if (error) console.error('Supabase service insert error', error);
      });
    }

    return newService;
  };

  const updateService = async (id: string, updates: Partial<ServiceItem>): Promise<void> => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      const payload: any = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.categoryLabel !== undefined) payload.category_label = updates.categoryLabel;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.durationMinutes !== undefined) payload.duration_minutes = updates.durationMinutes;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
      if (updates.features !== undefined) payload.features = updates.features;
      if (updates.branchIds !== undefined) payload.branch_ids = updates.branchIds;
      if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
      if (updates.popular !== undefined) payload.popular = updates.popular;

      client.from('services').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase service update error', error);
      });
    }
  };

  const deleteService = async (id: string): Promise<void> => {
    setServices(prev => prev.filter(s => s.id !== id));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('services').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase service delete error', error);
      });
    }
  };

  // CRUD for Packages
  const createPackage = async (newPkgData: Omit<BeautyPackage, 'id'>): Promise<BeautyPackage> => {
    const newId = `pkg-${Date.now()}`;
    const newPackage: BeautyPackage = {
      ...newPkgData,
      id: newId
    };

    setPackages(prev => [newPackage, ...prev]);

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('packages').insert({
        id: newId,
        title: newPackage.title,
        subtitle: newPackage.subtitle,
        price: newPackage.price,
        original_price: newPackage.originalPrice,
        duration_minutes: newPackage.durationMinutes,
        description: newPackage.description,
        included_services: newPackage.includedServices,
        image_url: newPackage.imageUrl,
        branch_ids: newPackage.branchIds || [],
        is_popular: newPackage.isPopular,
        badge_text: newPackage.badgeText
      }).then(({ error }) => {
        if (error) console.error('Supabase package insert error', error);
      });
    }

    return newPackage;
  };

  const updatePackage = async (id: string, updates: Partial<BeautyPackage>): Promise<void> => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      const payload: any = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice;
      if (updates.durationMinutes !== undefined) payload.duration_minutes = updates.durationMinutes;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.includedServices !== undefined) payload.included_services = updates.includedServices;
      if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
      if (updates.branchIds !== undefined) payload.branch_ids = updates.branchIds;
      if (updates.isPopular !== undefined) payload.is_popular = updates.isPopular;
      if (updates.badgeText !== undefined) payload.badge_text = updates.badgeText;

      client.from('packages').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase package update error', error);
      });
    }
  };

  const deletePackage = async (id: string): Promise<void> => {
    setPackages(prev => prev.filter(p => p.id !== id));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('packages').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase package delete error', error);
      });
    }
  };

  // CRUD for Bookings (Branch-Aware)
  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
    const newId = `bk-${Date.now().toString().slice(-6)}`;
    const branchToUse = branches.find(b => b.id === bookingData.branchId) || activeBranch;

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      branchId: branchToUse.id,
      branchName: branchToUse.name,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('bookings').insert({
        id: newId,
        service_id: newBooking.serviceId,
        service_title: newBooking.serviceTitle,
        branch_id: newBooking.branchId,
        branch_name: newBooking.branchName,
        customer_name: newBooking.customerName,
        customer_email: newBooking.customerEmail,
        customer_phone: newBooking.customerPhone,
        appointment_date: newBooking.appointmentDate,
        appointment_time: newBooking.appointmentTime,
        stylist: newBooking.stylist,
        notes: newBooking.notes,
        total_price: newBooking.totalPrice,
        status: 'pending'
      }).then(({ error }) => {
        if (error) console.error('Supabase booking insert error', error);
      });
    }

    return newBooking;
  };

  const updateBookingStatus = async (id: string, status: Booking['status']): Promise<void> => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('bookings').update({ status }).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase booking status error', error);
      });
    }
  };

  const updateSettings = (updates: Partial<SalonSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      const client = getSupabaseClient(supabaseUrl, supabaseKey);
      if (client && supabaseConnected) {
        client
          .from('salon_settings')
          .upsert({ id: 'primary', settings_json: next, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (error) console.error('Supabase settings upsert error', error);
          });
      }
      return next;
    });
  };

  // Gallery Operations
  const addGalleryItem = async (item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> => {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
    };
    setGallery(prev => [newItem, ...prev]);

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client
        .from('gallery')
        .insert([{
          id: newItem.id,
          title: newItem.title,
          category: newItem.category,
          image_url: newItem.imageUrl,
          caption: newItem.caption
        }])
        .then(({ error }) => {
          if (error) console.error('Supabase gallery insert error', error);
        });
    }

    return newItem;
  };

  const updateGalleryItem = async (id: string, updates: Partial<GalleryItem>): Promise<void> => {
    setGallery(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
      if (updates.caption !== undefined) payload.caption = updates.caption;

      client.from('gallery').update(payload).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase gallery update error', error);
      });
    }
  };

  const deleteGalleryItem = async (id: string): Promise<void> => {
    setGallery(prev => prev.filter(g => g.id !== id));

    const client = getSupabaseClient(supabaseUrl, supabaseKey);
    if (client && supabaseConnected) {
      client.from('gallery').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase gallery delete error', error);
      });
    }
  };

  // Booking Modal
  const openBookingModal = (item?: ServiceItem | BeautyPackage) => {
    setPreselectedItem(item || null);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setPreselectedItem(null);
  };

  // Parse service detail ID param if on `/services/:id`
  const serviceIdParam = currentPath.startsWith('/services/') ? currentPath.replace('/services/', '').split('?')[0] : null;

  return (
    <SalonContext.Provider
      value={{
        currentPath,
        navigate,
        serviceIdParam,
        services,
        packages,
        bookings,
        gallery,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        settings,
        isLoading,
        branches,
        activeBranchId,
        activeBranch,
        setActiveBranchId,
        addBranch,
        updateBranch,
        deleteBranch,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        users,
        currentUser,
        addUser,
        updateUser,
        deleteUser,
        isSuperAdmin,
        isStaff,
        supabaseConnected,
        supabaseUrl,
        supabaseKey,
        supabaseSyncError,
        setSupabaseCredentials,
        syncWithSupabase,
        fullCloudSync,
        seedSupabaseFromCatalog,
        isAdminAuthenticated,
        adminEmail,
        adminLogin,
        adminLogout,
        createService,
        updateService,
        deleteService,
        createPackage,
        updatePackage,
        deletePackage,
        createBooking,
        updateBookingStatus,
        updateSettings,
        isBookingModalOpen,
        preselectedItem,
        openBookingModal,
        closeBookingModal
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = (): SalonContextType => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
