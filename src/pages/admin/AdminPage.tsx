import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Scissors,
  Package,
  Calendar,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Database,
  Lock,
  LogOut,
  ExternalLink,
  Copy,
  Clock,
  Sparkles,
  MapPin,
  Tag,
  Users,
  UserPlus,
  Filter,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  Menu,
  Image as ImageIcon,
  Star,
  Eye,
  Gift,
  FileText,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { ServiceItem, BeautyPackage, Branch, CategoryItem, AppUser, UserRole, GalleryItem } from '../../types/salon';
import { SUPABASE_SQL_SCHEMA, SUPABASE_CLEAN_SCHEMA_SQL, SUPABASE_SEED_SQL } from '../../lib/supabase';

type AdminTab = 'bookings' | 'services' | 'packages' | 'categories' | 'gallery' | 'branches' | 'users' | 'supabase' | 'settings';

export const AdminPage: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminEmail,
    currentUser,
    isSuperAdmin,
    isStaff,
    adminLogin,
    adminLogout,
    services,
    packages,
    bookings,
    gallery,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    settings,
    branches,
    addBranch,
    updateBranch,
    deleteBranch,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    users,
    addUser,
    updateUser,
    deleteUser,
    createService,
    updateService,
    deleteService,
    createPackage,
    updatePackage,
    deletePackage,
    updateBookingStatus,
    updateSettings,
    supabaseConnected,
    supabaseUrl,
    supabaseKey,
    supabaseSyncError,
    setSupabaseCredentials,
    syncWithSupabase,
    fullCloudSync,
    seedSupabaseFromCatalog,
    navigate
  } = useSalon();

  // Tab navigation (Default to Appointments for high daily operational efficiency)
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Bookings filter by branch
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@tiptopshears.com');
  const [loginPassword, setLoginPassword] = useState('tiptop2026!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Service Edit / Modal state
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'hair',
    categoryLabel: 'Hair & Styling',
    price: 750,
    durationMinutes: 60,
    description: '',
    imageUrl: '/src/assets/images/service_precision_shears_1790223342879.jpg',
    features: ['Custom consultation', 'Styling finish'],
    isFeatured: true,
    allBranches: true,
    branchIds: [] as string[]
  });

  // Package Edit / Modal state
  const [editingPackage, setEditingPackage] = useState<BeautyPackage | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageForm, setPackageForm] = useState({
    title: '',
    subtitle: '',
    price: 2100,
    originalPrice: 2650,
    durationMinutes: 120,
    description: '',
    imageUrl: '/src/assets/images/hero_salon_ambiance_1790223323507.jpg',
    includedServices: ['Signature Cut', 'Gel Manicure'],
    badgeText: 'Curated Ritual',
    isPopular: false,
    allBranches: true,
    branchIds: [] as string[]
  });

  // Category Edit / Modal state
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 1,
    isActive: true
  });

  // Branch Edit / Modal state
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: '',
    mallName: '',
    address: '',
    city: 'Silang, Cavite',
    phone: '+63 917 877 5299',
    email: 'kendy.qtie@gmail.com',
    operatingHours: '10:00 AM – 9:00 PM Daily',
    googleMapsUrl: '',
    isActive: true
  });

  // User Edit / Modal state (Super Admin only)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    email: '',
    fullName: '',
    role: 'staff' as UserRole,
    branchId: 'silang-premier',
    phone: '',
    password: '',
    isActive: true
  });

  // Supabase settings state
  const [tempSupabaseUrl, setTempSupabaseUrl] = useState(supabaseUrl);
  const [tempSupabaseKey, setTempSupabaseKey] = useState(supabaseKey);
  const [supabaseMessage, setSupabaseMessage] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Local settings form state
  const [localSettings, setLocalSettings] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // -------------------------------------------------------------
  // LOGIN SUBMISSION
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    const result = await adminLogin(loginEmail, loginPassword);
    if (!result.success) {
      setLoginError(result.error || 'Authentication failed');
    }
    setIsLoggingIn(false);
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
  };

  // -------------------------------------------------------------
  // SERVICE MODAL HANDLERS
  // -------------------------------------------------------------
  const openNewServiceModal = () => {
    setEditingService(null);
    const firstCat = categories[0] || { slug: 'hair', name: 'Hair & Styling' };
    setServiceForm({
      title: '',
      category: firstCat.slug,
      categoryLabel: firstCat.name,
      price: 750,
      durationMinutes: 60,
      description: '',
      imageUrl: '/src/assets/images/service_precision_shears_1790223342879.jpg',
      features: ['Personalized consultation', 'Signature styling finish'],
      isFeatured: true,
      allBranches: true,
      branchIds: []
    });
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (service: ServiceItem) => {
    setEditingService(service);
    const isAll = !service.branchIds || service.branchIds.length === 0 || service.branchIds.includes('all');
    setServiceForm({
      title: service.title,
      category: service.category,
      categoryLabel: service.categoryLabel,
      price: service.price,
      durationMinutes: service.durationMinutes,
      description: service.description,
      imageUrl: service.imageUrl,
      features: [...service.features],
      isFeatured: !!service.isFeatured,
      allBranches: isAll,
      branchIds: isAll ? [] : [...(service.branchIds || [])]
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.price) return;

    const matchedCat = categories.find(c => c.slug === serviceForm.category);
    const catLabel = matchedCat ? matchedCat.name : serviceForm.categoryLabel;
    const finalBranchIds = serviceForm.allBranches ? [] : serviceForm.branchIds;

    if (editingService) {
      await updateService(editingService.id, {
        ...serviceForm,
        categoryLabel: catLabel,
        branchIds: finalBranchIds
      });
    } else {
      await createService({
        ...serviceForm,
        categoryLabel: catLabel,
        branchIds: finalBranchIds
      });
    }
    setIsServiceModalOpen(false);
  };

  // -------------------------------------------------------------
  // PACKAGE MODAL HANDLERS
  // -------------------------------------------------------------
  const openNewPackageModal = () => {
    setEditingPackage(null);
    setPackageForm({
      title: '',
      subtitle: '',
      price: 2100,
      originalPrice: 2650,
      durationMinutes: 120,
      description: '',
      imageUrl: '/src/assets/images/hero_salon_ambiance_1790223323507.jpg',
      includedServices: ['Master Shears Cut', 'Haute Gel Manicure'],
      badgeText: 'Curated Ritual',
      isPopular: false,
      allBranches: true,
      branchIds: []
    });
    setIsPackageModalOpen(true);
  };

  const openEditPackageModal = (pkg: BeautyPackage) => {
    setEditingPackage(pkg);
    const isAll = !pkg.branchIds || pkg.branchIds.length === 0 || pkg.branchIds.includes('all');
    setPackageForm({
      title: pkg.title,
      subtitle: pkg.subtitle,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      durationMinutes: pkg.durationMinutes,
      description: pkg.description,
      imageUrl: pkg.imageUrl,
      includedServices: [...pkg.includedServices],
      badgeText: pkg.badgeText || '',
      isPopular: !!pkg.isPopular,
      allBranches: isAll,
      branchIds: isAll ? [] : [...(pkg.branchIds || [])]
    });
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageForm.title || !packageForm.price) return;
    const finalBranchIds = packageForm.allBranches ? [] : packageForm.branchIds;

    if (editingPackage) {
      await updatePackage(editingPackage.id, {
        ...packageForm,
        branchIds: finalBranchIds
      });
    } else {
      await createPackage({
        ...packageForm,
        branchIds: finalBranchIds
      });
    }
    setIsPackageModalOpen(false);
  };

  // -------------------------------------------------------------
  // CATEGORY MODAL HANDLERS (CRUD)
  // -------------------------------------------------------------
  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      displayOrder: categories.length + 1,
      isActive: true
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      displayOrder: cat.displayOrder,
      isActive: cat.isActive
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    const generatedSlug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        ...categoryForm,
        slug: generatedSlug
      });
    } else {
      await addCategory({
        ...categoryForm,
        slug: generatedSlug
      });
    }
    setIsCategoryModalOpen(false);
  };

  // -------------------------------------------------------------
  // BRANCH MODAL HANDLERS (CRUD)
  // -------------------------------------------------------------
  const openNewBranchModal = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      mallName: '',
      address: '',
      city: 'Silang, Cavite',
      phone: '+63 917 877 5299',
      email: 'kendy.qtie@gmail.com',
      operatingHours: '10:00 AM – 9:00 PM Daily',
      googleMapsUrl: '',
      isActive: true
    });
    setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      mallName: branch.mallName,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      email: branch.email,
      operatingHours: branch.operatingHours,
      googleMapsUrl: branch.googleMapsUrl || '',
      isActive: branch.isActive
    });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.address) return;

    if (editingBranch) {
      await updateBranch(editingBranch.id, branchForm);
    } else {
      await addBranch(branchForm);
    }
    setIsBranchModalOpen(false);
  };

  // -------------------------------------------------------------
  // DYNAMIC GALLERY CATEGORIES & MODAL HANDLERS
  // -------------------------------------------------------------
  const dynamicGalleryCategories = useMemo(() => {
    const list: { id: string; label: string }[] = [{ id: 'all', label: 'All Photos' }];
    categories
      .filter((c) => c.isActive)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .forEach((cat) => {
        list.push({ id: cat.slug, label: cat.name });
      });

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
  }, [categories, gallery]);

  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');
  const [galleryForm, setGalleryForm] = useState<{
    title: string;
    category: string;
    isCustomCategory: boolean;
    imageUrl: string;
    caption: string;
  }>({
    title: '',
    category: 'hair',
    isCustomCategory: false,
    imageUrl: '/src/assets/images/service_precision_shears_1790223342879.jpg',
    caption: ''
  });

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result;
      if (typeof result === 'string') {
        setGalleryForm((prev) => ({
          ...prev,
          imageUrl: result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const openNewGalleryModal = () => {
    setEditingGalleryItem(null);
    const defaultCat = categories.find((c) => c.isActive)?.slug || 'hair';
    setGalleryForm({
      title: '',
      category: defaultCat,
      isCustomCategory: false,
      imageUrl: '/src/assets/images/service_precision_shears_1790223342879.jpg',
      caption: ''
    });
    setIsGalleryModalOpen(true);
  };

  const openEditGalleryModal = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    const isKnown = dynamicGalleryCategories.some(
      (c) => c.id !== 'all' && c.id.toLowerCase() === (item.category || '').toLowerCase()
    );
    setGalleryForm({
      title: item.title,
      category: item.category,
      isCustomCategory: !isKnown,
      imageUrl: item.imageUrl,
      caption: item.caption
    });
    setIsGalleryModalOpen(true);
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title.trim() || !galleryForm.imageUrl.trim()) return;

    const payload = {
      title: galleryForm.title.trim(),
      category: galleryForm.category.trim().toLowerCase(),
      imageUrl: galleryForm.imageUrl.trim(),
      caption: galleryForm.caption.trim()
    };

    if (editingGalleryItem) {
      await updateGalleryItem(editingGalleryItem.id, payload);
    } else {
      await addGalleryItem(payload);
    }
    setIsGalleryModalOpen(false);
  };

  // In-app deletion confirmation (never suppressed by browser or iframe constraints)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'gallery' | 'service' | 'package' | 'category' | 'branch' | 'user';
    id: string;
    title: string;
  } | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    const { type, id } = deleteConfirmTarget;
    try {
      if (type === 'gallery') {
        await deleteGalleryItem(id);
      } else if (type === 'service') {
        await deleteService(id);
      } else if (type === 'package') {
        await deletePackage(id);
      } else if (type === 'category') {
        await deleteCategory(id);
      } else if (type === 'branch') {
        await deleteBranch(id);
      } else if (type === 'user') {
        await deleteUser(id);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteConfirmTarget(null);
    }
  };

  // -------------------------------------------------------------
  // USER MODAL HANDLERS (Super Admin CRUD)
  // -------------------------------------------------------------
  const openNewUserModal = () => {
    setEditingUser(null);
    setUserForm({
      email: '',
      fullName: '',
      role: 'staff',
      branchId: branches[0]?.id || 'silang-premier',
      phone: '',
      password: '',
      isActive: true
    });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: AppUser) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId || 'all',
      phone: user.phone || '',
      password: user.password || '',
      isActive: user.isActive
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.email || !userForm.fullName) return;

    if (editingUser) {
      await updateUser(editingUser.id, userForm);
    } else {
      await addUser(userForm);
    }
    setIsUserModalOpen(false);
  };

  // -------------------------------------------------------------
  // SUPABASE CREDENTIALS & SEED HANDLERS
  // -------------------------------------------------------------
  const [selectedSqlTab, setSelectedSqlTab] = useState<'clean' | 'seed'>('clean');
  const [isSeedingCloud, setIsSeedingCloud] = useState<boolean>(false);

  const handleConnectSupabase = async () => {
    setSupabaseMessage('Validating Supabase credentials and checking tables...');
    const res = await setSupabaseCredentials(tempSupabaseUrl, tempSupabaseKey);
    setSupabaseMessage(res.message);
  };

  const handleFullCloudSync = async () => {
    setIsSeedingCloud(true);
    setSupabaseMessage('Executing Full Cloud Sync: Pushing local/offline changes & refetching all 8 tables...');
    const res = await fullCloudSync();
    setSupabaseMessage(res.message);
    setIsSeedingCloud(false);
  };

  const copySqlSchema = () => {
    const textToCopy = selectedSqlTab === 'clean' ? SUPABASE_CLEAN_SCHEMA_SQL : SUPABASE_SEED_SQL;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  // -------------------------------------------------------------
  // SETTINGS SAVE
  // -------------------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Filtered Bookings by Branch
  const filteredBookings = bookings.filter((b) => {
    if (selectedBranchFilter === 'all') return true;
    return b.branchId === selectedBranchFilter;
  });

  // -------------------------------------------------------------
  // NOT AUTHENTICATED: LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#140D18] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#ECEBF0] p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#7B2D97]/10 text-[#7B2D97] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-3xl text-[#1C1221] font-light">
              Tiptop Atelier Portal
            </h2>
            <p className="text-xs text-[#6B6175] max-w-sm mx-auto">
              Role-based salon management: Super Admin for full control and Supabase sync, or Branch Staff for daily bookings.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
              />
            </div>

            {/* Quick Demo Credentials */}
            <div className="p-3 bg-[#FAF8FC] border border-[#ECE4F2] rounded text-xs space-y-2">
              <div className="text-[11px] font-semibold text-[#7B2D97] uppercase tracking-wider">
                1-Click Quick Demo Sign-Ins:
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@tiptopshears.com', 'tiptop2026!')}
                  className="text-left px-2.5 py-1.5 bg-white border border-[#DDD5E5] hover:border-[#7B2D97] rounded text-xs transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-[#1C1221]">👑 Super Admin (Full Control + Supabase)</span>
                  <span className="text-[10px] text-[#7B2D97] font-mono">admin@tiptopshears.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('staff.silang@tiptopshears.com', 'staff2026!')}
                  className="text-left px-2.5 py-1.5 bg-white border border-[#DDD5E5] hover:border-[#7B2D97] rounded text-xs transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-[#1C1221]">✂️ Branch Staff (Premier Mall Silang)</span>
                  <span className="text-[10px] text-[#6B6175] font-mono">staff.silang@...</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-widest font-semibold rounded shadow transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="pt-2 border-t border-[#ECEBF0] text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-[#7B2D97] hover:underline cursor-pointer"
            >
              ← Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED: STANDALONE FULL-PAGE DASHBOARD WITH SIDEBAR
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F6F4F8] text-[#1C1221] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#140D18] text-white p-4 flex items-center justify-between border-b border-[#291B30]">
        <div className="font-serif text-lg font-light">
          Tiptop <span className="italic text-[#E5A93C]">Atelier</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-[#DDD7E3] hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`${
          mobileSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 lg:w-72 bg-[#140D18] text-[#DDD7E3] border-r border-[#291B30] flex-shrink-0 flex flex-col justify-between h-auto md:min-h-screen sticky top-0 z-30`}
      >
        <div className="p-5 space-y-6">
          {/* Atelier Brand Logo Header */}
          <div className="border-b border-[#291B30] pb-4">
            <button
              onClick={() => navigate('/')}
              className="text-left group cursor-pointer block"
            >
              <h2 className="font-serif text-2xl font-light text-white tracking-wide group-hover:text-[#E5A93C] transition-colors">
                Tiptop <span className="font-serif italic text-[#E5A93C]">Shears & Nails</span>
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-[#9A8DA3] block mt-0.5">
                Atelier Management System
              </span>
            </button>
          </div>

          {/* Current User Card */}
          <div className="bg-[#211627] rounded-lg p-3 border border-[#3A2445] space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white text-xs truncate max-w-[140px]">
                {currentUser?.fullName || adminEmail}
              </div>
              <span
                className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-wider ${
                  isSuperAdmin
                    ? 'bg-[#7B2D97] text-[#E5A93C] border border-[#E5A93C]/40'
                    : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                }`}
              >
                {isSuperAdmin ? 'Super Admin' : 'Staff'}
              </span>
            </div>
            <div className="text-[11px] text-[#A597B0] flex items-center gap-1 truncate">
              <Building2 className="w-3 h-3 text-[#E5A93C] shrink-0" />
              <span className="truncate">
                {currentUser?.branchId === 'all' || !currentUser?.branchId
                  ? 'All Branches Scope'
                  : branches.find(b => b.id === currentUser?.branchId)?.name || 'Premier Mall Silang'}
              </span>
            </div>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="space-y-5 text-xs">
            {/* GROUP 1: OPERATIONS */}
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#7C6C87] px-3 mb-2">
                Operations
              </div>
              <button
                onClick={() => {
                  setActiveTab('bookings');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-[#7B2D97] text-white font-semibold shadow-sm'
                    : 'text-[#DDD7E3] hover:bg-[#211627] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#E5A93C]" />
                  <span>Appointments</span>
                </div>
                <span className="bg-[#140D18]/60 text-[10px] font-mono px-2 py-0.5 rounded text-[#E5A93C]">
                  {bookings.length}
                </span>
              </button>
            </div>

            {/* GROUP 2: CATALOG & MENU */}
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#7C6C87] px-3 mb-2">
                Menu & Catalog
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('services');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-[#7B2D97] text-white font-semibold shadow-sm'
                      : 'text-[#DDD7E3] hover:bg-[#211627] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4 text-[#E5A93C]" />
                    <span>Services Menu</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A597B0]">{services.length}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('packages');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'packages'
                      ? 'bg-[#7B2D97] text-white font-semibold shadow-sm'
                      : 'text-[#DDD7E3] hover:bg-[#211627] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-[#E5A93C]" />
                    <span>Beauty Packages</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A597B0]">{packages.length}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('categories');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'categories'
                      ? 'bg-[#7B2D97] text-white font-semibold shadow-sm'
                      : 'text-[#DDD7E3] hover:bg-[#211627] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-[#E5A93C]" />
                    <span>Category Manager</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A597B0]">{categories.length}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('gallery');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'gallery'
                      ? 'bg-[#7B2D97] text-white font-semibold shadow-sm'
                      : 'text-[#DDD7E3] hover:bg-[#211627] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-[#E5A93C]" />
                    <span>Gallery & Portfolio</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A597B0]">{gallery.length}</span>
                </button>
              </div>
            </div>

            {/* GROUP 3: LOCATIONS */}
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#7C6C87] px-3 mb-2">
                Locations
              </div>
              <button
                onClick={() => {
                  setActiveTab('branches');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'branches'
                    ? 'bg-[#7B2D97] text-white font-semibold shadow-sm'
                    : 'text-[#DDD7E3] hover:bg-[#211627] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#E5A93C]" />
                  <span>Salon Branches</span>
                </div>
                <span className="text-[10px] font-mono text-[#A597B0]">{branches.length}</span>
              </button>
            </div>

            {/* GROUP 4: ADMINISTRATION (SUPER ADMIN ONLY) */}
            {isSuperAdmin && (
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#E5A93C] px-3 mb-2 flex items-center gap-1">
                  <span>👑 System Admin</span>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-[#7B2D97] text-white font-semibold shadow-sm'
                        : 'text-[#DDD7E3] hover:bg-[#211627] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#E5A93C]" />
                      <span>User Accounts</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#A597B0]">{users.length}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('supabase');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'supabase'
                        ? 'bg-[#7B2D97] text-white font-semibold shadow-sm'
                        : 'text-[#DDD7E3] hover:bg-[#211627] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-[#E5A93C]" />
                      <span>Supabase Sync</span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        supabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-[#7B2D97] text-white font-semibold shadow-sm'
                        : 'text-[#DDD7E3] hover:bg-[#211627] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-[#E5A93C]" />
                      <span>Salon Branding</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[#291B30] space-y-2 bg-[#100913]">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-3 rounded bg-[#211627] hover:bg-[#341F3E] text-xs text-[#DDD7E3] hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>Return to Public Site</span>
          </button>
          <button
            onClick={adminLogout}
            className="w-full py-2 px-3 rounded bg-red-950/40 hover:bg-red-900/60 text-xs text-red-300 border border-red-900/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F6F4F8]">
        {/* Top Content Bar */}
        <div className="bg-white border-b border-[#ECEBF0] px-6 py-4 flex items-center justify-between flex-wrap gap-4 shadow-sm">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#8A7E93] font-semibold flex items-center gap-1.5">
              <span>Back Office</span>
              <ChevronRight className="w-3 h-3 text-[#A597B0]" />
              <span className="text-[#7B2D97] capitalize">{activeTab}</span>
            </div>
            <h1 className="font-serif text-2xl font-normal text-[#1C1221] mt-0.5">
              {activeTab === 'bookings' && 'Guest Appointments & Reservations'}
              {activeTab === 'services' && 'Salon Services Menu'}
              {activeTab === 'packages' && 'Curated Promotional Packages'}
              {activeTab === 'categories' && 'Dynamic Categories Management'}
              {activeTab === 'gallery' && 'Visual Portfolio & Atelier Gallery'}
              {activeTab === 'branches' && 'Multi-Branch Salon Locations'}
              {activeTab === 'users' && 'User Accounts & Staff Permissions'}
              {activeTab === 'supabase' && 'Supabase Cloud Database Synchronization'}
              {activeTab === 'settings' && 'Salon Branding & Website Customizer'}
            </h1>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            {activeTab === 'services' && (
              <button
                onClick={openNewServiceModal}
                className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            )}

            {activeTab === 'packages' && (
              <button
                onClick={openNewPackageModal}
                className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Package</span>
              </button>
            )}

            {activeTab === 'categories' && (
              <button
                onClick={openNewCategoryModal}
                className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </button>
            )}

            {activeTab === 'gallery' && (
              <button
                onClick={openNewGalleryModal}
                className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Photo</span>
              </button>
            )}

            {activeTab === 'branches' && (
              <button
                onClick={openNewBranchModal}
                className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Branch</span>
              </button>
            )}

            {activeTab === 'users' && isSuperAdmin && (
              <button
                onClick={openNewUserModal}
                className="px-4 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow flex items-center gap-2 cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </button>
            )}
          </div>
        </div>

        {/* View Content Body */}
        <div className="p-6 md:p-8 space-y-6 flex-1">
          {/* ========================================================= */}
          {/* TAB: APPOINTMENTS / BOOKINGS */}
          {/* ========================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-xs text-[#6B6175]">
                  Showing real-time appointments. Filter by branch location or update confirmation status.
                </p>

                {/* Branch Filter dropdown */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#ECEBF0] text-xs shadow-sm">
                  <Filter className="w-3.5 h-3.5 text-[#7B2D97]" />
                  <span className="font-medium text-[#6B6175]">Location:</span>
                  <select
                    value={selectedBranchFilter}
                    onChange={(e) => setSelectedBranchFilter(e.target.value)}
                    className="bg-transparent font-semibold text-[#1C1221] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Branches ({bookings.length})</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({bookings.filter((bk) => bk.branchId === b.id).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#ECEBF0] overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFB] border-b border-[#ECEBF0] text-[#6B6175] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Branch Location</th>
                      <th className="p-4">Guest Details</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Specialist</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEBF0]">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-xs text-[#6B6175]">
                          No bookings found for the selected branch.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((bk) => (
                        <tr key={bk.id} className="hover:bg-[#FAFAFB] transition-colors">
                          <td className="p-4 font-mono font-bold text-[#1C1221]">
                            {bk.id}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded bg-[#FAF5FE] text-[#7B2D97] border border-[#E9D9F2] text-[11px] font-semibold block truncate max-w-[150px]">
                              {bk.branchName || 'Premier Mall Silang'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold block text-[#1C1221]">{bk.customerName}</span>
                            <span className="text-[11px] text-[#6B6175] block">{bk.customerPhone}</span>
                            <span className="text-[11px] text-[#8A7E93] block">{bk.customerEmail}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-[#1C1221] block">{bk.serviceTitle}</span>
                            <span className="text-[11px] font-mono text-[#7B2D97]">₱{bk.totalPrice.toLocaleString()}</span>
                          </td>
                          <td className="p-4 text-[#6B6175]">
                            <span className="font-semibold block text-[#1C1221]">{bk.appointmentDate}</span>
                            <span className="text-[11px]">{bk.appointmentTime}</span>
                          </td>
                          <td className="p-4 text-[#6B6175]">
                            {bk.stylist.split('(')[0]}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${
                                bk.status === 'confirmed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : bk.status === 'completed'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : bk.status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {bk.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={bk.status}
                              onChange={(e) => updateBookingStatus(bk.id, e.target.value as any)}
                              className="bg-[#FAFAFB] border border-[#D9D6E2] text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#7B2D97] cursor-pointer"
                            >
                              <option value="pending">Mark Pending</option>
                              <option value="confirmed">Confirm Slot</option>
                              <option value="completed">Complete Visit</option>
                              <option value="cancelled">Cancel</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: SERVICES MANAGER */}
          {/* ========================================================= */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#ECEBF0] overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFB] border-b border-[#ECEBF0] text-[#6B6175] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Service</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Branch Availability</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4 text-center">Signature Offer</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEBF0]">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-[#FAFAFB] transition-colors">
                        <td className="p-4 font-medium text-[#1C1221] flex items-center gap-3">
                          <img
                            src={service.imageUrl}
                            alt={service.title}
                            className="w-10 h-10 rounded object-cover border border-[#ECEBF0]"
                          />
                          <div>
                            <span className="font-semibold block">{service.title}</span>
                            <span className="text-[11px] text-[#6B6175] line-clamp-1">{service.description}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[#6B6175]">
                          <span className="px-2.5 py-1 bg-[#F5EFF9] text-[#7B2D97] rounded text-[11px] font-medium">
                            {service.categoryLabel}
                          </span>
                        </td>
                        <td className="p-4 text-[#6B6175]">
                          {!service.branchIds || service.branchIds.length === 0 || service.branchIds.includes('all') ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                              All Branches
                            </span>
                          ) : (
                            <span
                              className="px-2 py-0.5 rounded bg-purple-50 text-[#7B2D97] text-[10px] font-semibold border border-[#E9D9F2]"
                              title={service.branchIds.map((id) => branches.find((b) => b.id === id)?.name || id).join(', ')}
                            >
                              {service.branchIds.length} of {branches.length} Branches
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono font-semibold text-[#1C1221]">
                          ₱{service.price.toLocaleString()}
                        </td>
                        <td className="p-4 text-[#6B6175]">
                          {service.durationMinutes} min
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => updateService(service.id, { isFeatured: !service.isFeatured })}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                              service.isFeatured
                                ? 'bg-[#FAF3E0] text-[#B87D1B] border border-[#E5A93C]/60 hover:bg-[#F5E6BE]'
                                : 'bg-[#F2EFF5] text-[#8A7E93] hover:text-[#1C1221] hover:bg-[#E5E0EB]'
                            }`}
                            title="Click to toggle Signature status on Homepage"
                          >
                            <Star className={`w-3 h-3 ${service.isFeatured ? 'fill-[#E5A93C] text-[#E5A93C]' : ''}`} />
                            <span>{service.isFeatured ? 'Signature' : 'Standard'}</span>
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditServiceModal(service)}
                            className="p-1.5 hover:bg-[#F0EEF5] text-[#7B2D97] rounded cursor-pointer transition-colors"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmTarget({
                                type: 'service',
                                id: service.id,
                                title: service.title
                              })
                            }
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: PACKAGES MANAGER */}
          {/* ========================================================= */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#ECEBF0] overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFB] border-b border-[#ECEBF0] text-[#6B6175] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Package</th>
                      <th className="p-4">Included Items</th>
                      <th className="p-4">Branch Availability</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Valued At</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4 text-center">Featured Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEBF0]">
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-[#FAFAFB] transition-colors">
                        <td className="p-4 font-medium text-[#1C1221] flex items-center gap-3">
                          <img
                            src={pkg.imageUrl}
                            alt={pkg.title}
                            className="w-10 h-10 rounded object-cover border border-[#ECEBF0]"
                          />
                          <div>
                            <span className="font-semibold block">{pkg.title}</span>
                            <span className="text-[11px] text-[#6B6175]">{pkg.subtitle}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[#6B6175]">
                          <span className="text-[11px]">{pkg.includedServices.length} treatments included</span>
                        </td>
                        <td className="p-4 text-[#6B6175]">
                          {!pkg.branchIds || pkg.branchIds.length === 0 || pkg.branchIds.includes('all') ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                              All Branches
                            </span>
                          ) : (
                            <span
                              className="px-2 py-0.5 rounded bg-purple-50 text-[#7B2D97] text-[10px] font-semibold border border-[#E9D9F2]"
                              title={pkg.branchIds.map((id) => branches.find((b) => b.id === id)?.name || id).join(', ')}
                            >
                              {pkg.branchIds.length} of {branches.length} Branches
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-[#7B2D97]">
                          ₱{pkg.price.toLocaleString()}
                        </td>
                        <td className="p-4 font-mono text-[#8A7E93] line-through">
                          ₱{pkg.originalPrice.toLocaleString()}
                        </td>
                        <td className="p-4 text-[#6B6175]">
                          {pkg.durationMinutes} min
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => updatePackage(pkg.id, { isPopular: !pkg.isPopular })}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                              pkg.isPopular
                                ? 'bg-[#FAF3E0] text-[#B87D1B] border border-[#E5A93C]/60 hover:bg-[#F5E6BE]'
                                : 'bg-[#F2EFF5] text-[#8A7E93] hover:text-[#1C1221] hover:bg-[#E5E0EB]'
                            }`}
                            title="Click to toggle Featured / Popular status"
                          >
                            <Star className={`w-3 h-3 ${pkg.isPopular ? 'fill-[#E5A93C] text-[#E5A93C]' : ''}`} />
                            <span>{pkg.isPopular ? 'Featured' : 'Standard'}</span>
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditPackageModal(pkg)}
                            className="p-1.5 hover:bg-[#F0EEF5] text-[#7B2D97] rounded cursor-pointer transition-colors"
                            title="Edit Package"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmTarget({
                                type: 'package',
                                id: pkg.id,
                                title: pkg.title
                              })
                            }
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors"
                            title="Delete Package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: CATEGORIES */}
          {/* ========================================================= */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-xl border border-[#ECEBF0] p-5 shadow-sm space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#8A7E93] uppercase tracking-wider block">
                          Slug: {cat.slug} · Order #{cat.displayOrder}
                        </span>
                        <h4 className="font-serif text-lg font-semibold text-[#1C1221]">
                          {cat.name}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B6175] min-h-[36px] line-clamp-2">
                      {cat.description || 'No description provided.'}
                    </p>

                    <div className="pt-3 border-t border-[#ECEBF0] flex items-center justify-between">
                      <span className="text-[11px] text-[#7B2D97] font-medium">
                        {services.filter((s) => s.category === cat.slug).length} Services Linked
                      </span>
                      <div className="space-x-1">
                        <button
                          onClick={() => openEditCategoryModal(cat)}
                          className="p-1.5 hover:bg-[#F0EEF5] text-[#7B2D97] rounded cursor-pointer transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmTarget({
                              type: 'category',
                              id: cat.id,
                              title: cat.name
                            })
                          }
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: GALLERY & PORTFOLIO */}
          {/* ========================================================= */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {/* Category Filter Pills (Dynamic from Category Manager & Tags) */}
              <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-3.5 rounded-xl border border-[#ECEBF0]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {dynamicGalleryCategories.map((c) => {
                    const count =
                      c.id === 'all'
                        ? gallery.length
                        : gallery.filter((g) => (g.category || '').toLowerCase() === c.id.toLowerCase()).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setGalleryCategoryFilter(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          galleryCategoryFilter.toLowerCase() === c.id.toLowerCase()
                            ? 'bg-[#7B2D97] text-white shadow-sm'
                            : 'bg-[#FAFAFB] text-[#6B6175] hover:text-[#1C1221] hover:bg-[#F0EEF5]'
                        }`}
                      >
                        {c.label} ({count})
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={openNewGalleryModal}
                  className="px-3.5 py-1.5 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
              </div>

              {/* Gallery Grid */}
              {gallery.filter(
                (g) =>
                  galleryCategoryFilter === 'all' ||
                  (g.category || '').toLowerCase() === galleryCategoryFilter.toLowerCase()
              ).length === 0 ? (
                <div className="bg-white rounded-xl border border-[#ECEBF0] p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF5FE] text-[#7B2D97] flex items-center justify-center mx-auto">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg text-[#1C1221]">No Photos in this Category</h4>
                  <p className="text-xs text-[#6B6175] max-w-sm mx-auto">
                    Showcase client transformations, interior lounge ambiance, or precision shears styling.
                  </p>
                  <button
                    onClick={openNewGalleryModal}
                    className="px-4 py-2 bg-[#7B2D97] text-white text-xs uppercase tracking-wider font-semibold rounded cursor-pointer"
                  >
                    Add First Photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gallery
                    .filter(
                      (g) =>
                        galleryCategoryFilter === 'all' ||
                        (g.category || '').toLowerCase() === galleryCategoryFilter.toLowerCase()
                    )
                    .map((photo) => {
                      const displayCat =
                        dynamicGalleryCategories.find(
                          (c) => c.id.toLowerCase() === (photo.category || '').toLowerCase()
                        )?.label || photo.category;

                      return (
                        <div
                          key={photo.id}
                          className="bg-white rounded-xl border border-[#ECEBF0] overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1C1221]">
                            <img
                              src={photo.imageUrl}
                              alt={photo.title}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2.5 py-0.5 rounded bg-[#1C1221]/80 backdrop-blur-sm text-[#E5A93C] text-[10px] font-semibold uppercase tracking-wider border border-[#E5A93C]/30">
                                {displayCat}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <h4 className="font-serif text-base font-semibold text-[#1C1221] group-hover:text-[#7B2D97] transition-colors">
                                {photo.title}
                              </h4>
                              <p className="text-xs text-[#6B6175] mt-1 line-clamp-2 leading-relaxed">
                                {photo.caption}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-[#ECEBF0] flex items-center justify-between text-xs text-[#8A7E93]">
                              <span className="font-mono text-[10px]">{photo.id}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditGalleryModal(photo)}
                                  className="p-1.5 hover:bg-[#F0EEF5] text-[#7B2D97] rounded cursor-pointer transition-colors"
                                  title="Edit Photo"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirmTarget({
                                      type: 'gallery',
                                      id: photo.id,
                                      title: photo.title
                                    })
                                  }
                                  className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors"
                                  title="Delete Photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: BRANCHES */}
          {/* ========================================================= */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-xl border border-[#ECEBF0] p-6 shadow-sm space-y-4 relative flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-[#7B2D97]" />
                          <h4 className="font-serif text-base font-semibold text-[#1C1221]">
                            {b.name}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                            b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {b.isActive ? 'Open & Active' : 'Closed'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-[#6B6175] pt-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#E5A93C] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{b.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
                          <span>{b.operatingHours}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
                          <span>{b.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#ECEBF0] flex items-center justify-between">
                      <span className="text-[11px] text-[#7B2D97] font-semibold">
                        {bookings.filter((bk) => bk.branchId === b.id).length} Bookings Logged
                      </span>
                      <div className="space-x-1">
                        <button
                          onClick={() => openEditBranchModal(b)}
                          className="p-1.5 hover:bg-[#F0EEF5] text-[#7B2D97] rounded cursor-pointer transition-colors"
                          title="Edit Branch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmTarget({
                              type: 'branch',
                              id: b.id,
                              title: b.name
                            })
                          }
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors"
                          title="Delete Branch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: USER ACCOUNTS (SUPER ADMIN ONLY) */}
          {/* ========================================================= */}
          {activeTab === 'users' && isSuperAdmin && (
            <div className="space-y-4">
              {/* Users Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-3.5 rounded-xl border border-[#ECEBF0]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1C1221]">Total Profiles: {users.length}</span>
                  <span className="text-[11px] text-[#8A7E93]">
                    ({users.filter(u => u.role === 'super_admin').length} Super Admins, {users.filter(u => u.role === 'staff').length} Staff, {users.filter(u => u.role === 'customer').length} Customers)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={openNewUserModal}
                    className="px-3.5 py-1.5 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add New User</span>
                  </button>
                </div>
              </div>

              {/* Explanatory Info Card */}
              <div className="p-3.5 bg-[#FAF9FC] border border-[#ECEBF0] rounded-xl flex items-start gap-3 text-xs text-[#6B6175]">
                <ShieldCheck className="w-4 h-4 text-[#7B2D97] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-[#1C1221]">
                    Unified User Management (`public.app_users` table)
                  </div>
                  <p className="leading-relaxed">
                    All user roles (<strong>Super Admin</strong>, <strong>Branch Staff</strong>, and <strong>Customer</strong>) are stored in your Supabase <code>public.app_users</code> table. When users register in <strong>Supabase Dashboard &gt; Authentication &gt; Users</strong>, our database trigger automatically syncs them here. You can click the <strong>Edit</strong> icon on any user to change their role, assign their branch, or update details.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#ECEBF0] overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAFB] border-b border-[#ECEBF0] text-[#6B6175] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Assigned Branch</th>
                      <th className="p-4">Contact Phone</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEBF0]">
                    {users.map((u) => {
                      const assignedBranch = branches.find((b) => b.id === u.branchId);
                      return (
                        <tr key={u.id} className="hover:bg-[#FAFAFB] transition-colors">
                          <td className="p-4">
                            <span className="font-semibold block text-[#1C1221]">{u.fullName}</span>
                            <span className="text-[11px] text-[#6B6175] font-mono">{u.email}</span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'super_admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'staff'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {u.role === 'super_admin' ? '👑 Super Admin' : u.role === 'staff' ? '✂️ Branch Staff' : '📱 Customer'}
                            </span>
                          </td>
                          <td className="p-4 text-[#6B6175]">
                            {u.branchId === 'all' || !u.branchId ? (
                              <span className="text-[11px] text-[#7B2D97] font-semibold">All Branches (Global)</span>
                            ) : (
                              <span>{assignedBranch?.name || u.branchId}</span>
                            )}
                          </td>
                          <td className="p-4 text-[#6B6175]">
                            {u.phone || '—'}
                          </td>
                          <td className="p-4">
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                              }`}
                            >
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => openEditUserModal(u)}
                              className="p-1.5 hover:bg-[#F0EEF5] text-[#7B2D97] rounded cursor-pointer transition-colors"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {u.email !== 'admin@tiptopshears.com' && (
                              <button
                                onClick={() =>
                                  setDeleteConfirmTarget({
                                    type: 'user',
                                    id: u.id,
                                    title: u.fullName
                                  })
                                }
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: SUPABASE SYNC (SUPER ADMIN ONLY) */}
          {/* ========================================================= */}
          {activeTab === 'supabase' && isSuperAdmin && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#ECEBF0] p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-2xl text-[#1C1221]">
                        Supabase Cloud Database & Auth Architecture
                      </h3>
                      <span className="bg-[#7B2D97] text-[#E5A93C] text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                        Super Admin Only
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6175] mt-1">
                      Connect your production Supabase PostgreSQL project for persistent multi-branch tables, user auth, and cross-platform syncing.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#FAFAFB] border border-[#ECEBF0] text-xs">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        supabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-medium text-[#1C1221]">
                      {supabaseConnected ? 'Connected & Live Syncing' : 'Local Storage Mode (Ready to Connect)'}
                    </span>
                  </div>
                </div>

                {supabaseMessage && (
                  <div className="p-3 bg-[#FFF9EE] border border-[#F3E3C3] rounded text-xs text-[#7A5612] flex items-center justify-between">
                    <span>{supabaseMessage}</span>
                    <button
                      onClick={() => setSupabaseMessage(null)}
                      className="text-xs font-semibold hover:underline ml-4 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {supabaseSyncError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
                    <span>⚠️ {supabaseSyncError}</span>
                    <button
                      onClick={syncWithSupabase}
                      className="text-xs font-semibold underline ml-4 cursor-pointer hover:text-amber-950"
                    >
                      Retry Sync
                    </button>
                  </div>
                )}

                {/* Cloud Live Data Counters (When Connected) */}
                {supabaseConnected && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-[#FAF8FC] border border-[#E8E2EE] rounded-xl">
                    <div className="text-center p-2">
                      <div className="text-xs text-[#6B6175] uppercase tracking-wider font-semibold">Branches</div>
                      <div className="text-xl font-serif font-bold text-[#7B2D97] mt-0.5">{branches.length}</div>
                    </div>
                    <div className="text-center p-2">
                      <div className="text-xs text-[#6B6175] uppercase tracking-wider font-semibold">Categories</div>
                      <div className="text-xl font-serif font-bold text-[#7B2D97] mt-0.5">{categories.length}</div>
                    </div>
                    <div className="text-center p-2">
                      <div className="text-xs text-[#6B6175] uppercase tracking-wider font-semibold">Services</div>
                      <div className="text-xl font-serif font-bold text-[#7B2D97] mt-0.5">{services.length}</div>
                    </div>
                    <div className="text-center p-2">
                      <div className="text-xs text-[#6B6175] uppercase tracking-wider font-semibold">Packages</div>
                      <div className="text-xl font-serif font-bold text-[#7B2D97] mt-0.5">{packages.length}</div>
                    </div>
                    <div className="text-center p-2">
                      <div className="text-xs text-[#6B6175] uppercase tracking-wider font-semibold">Bookings</div>
                      <div className="text-xl font-serif font-bold text-[#7B2D97] mt-0.5">{bookings.length}</div>
                    </div>
                    <div className="text-center p-2">
                      <div className="text-xs text-[#6B6175] uppercase tracking-wider font-semibold">Gallery</div>
                      <div className="text-xl font-serif font-bold text-[#7B2D97] mt-0.5">{gallery.length}</div>
                    </div>
                  </div>
                )}

                {/* Credentials Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={tempSupabaseUrl}
                      onChange={(e) => setTempSupabaseUrl(e.target.value)}
                      className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2.5 text-xs font-mono text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1.5">
                      Supabase Anon Public Key
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={tempSupabaseKey}
                      onChange={(e) => setTempSupabaseKey(e.target.value)}
                      className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2.5 text-xs font-mono text-[#1C1221] focus:outline-none focus:ring-2 focus:ring-[#7B2D97]"
                    />
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-3 pt-2">
                  {supabaseConnected && (
                    <button
                      onClick={handleFullCloudSync}
                      disabled={isSeedingCloud}
                      className="px-5 py-2.5 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2"
                      title="Pushes all offline changes across all 8 tables to Supabase, then refetches latest fresh cloud state"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
                      <span>{isSeedingCloud ? 'Synchronizing All 8 Tables...' : '🔄 Full Cloud Sync (All 8 Tables)'}</span>
                    </button>
                  )}
                  <button
                    onClick={syncWithSupabase}
                    className="px-4 py-2.5 bg-[#FAFAFB] hover:bg-[#EDEBF2] border border-[#D9D6E2] text-[#1C1221] text-xs uppercase tracking-wider font-medium rounded cursor-pointer transition-colors flex items-center gap-1.5"
                    title="Refetch all tables directly from Supabase"
                  >
                    <span>☁️ Refresh From Cloud</span>
                  </button>
                  <button
                    onClick={handleConnectSupabase}
                    className="px-4 py-2.5 bg-[#FAFAFB] hover:bg-[#EDEBF2] border border-[#D9D6E2] text-[#1C1221] text-xs uppercase tracking-wider font-medium rounded cursor-pointer transition-colors"
                  >
                    Save & Test Connection
                  </button>
                </div>

                {/* Explanation Card for Auth & Super Admin Setup */}
                <div className="p-4 bg-[#FAF9FC] border border-[#ECEBF0] rounded-xl space-y-2 text-xs text-[#6B6175]">
                  <h4 className="font-semibold text-[#1C1221] flex items-center gap-1.5 text-sm">
                    <ShieldCheck className="w-4 h-4 text-[#7B2D97]" />
                    <span>How Supabase Authentication & Super Admin Setup Works</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-[#5A4E65]">
                    <li>
                      <strong>Real Supabase Auth:</strong> You can create users directly in your <strong>Supabase Dashboard &gt; Authentication &gt; Users</strong> with their email &amp; password.
                    </li>
                    <li>
                      <strong>Automatic Role Sync:</strong> When a user is created in Supabase Auth, our included Postgres trigger automatically generates their corresponding profile in <code>public.app_users</code>.
                    </li>
                    <li>
                      <strong>Super Admin Privileges:</strong> The email <code>admin@tiptopshears.com</code> (or any user with <code>role: 'super_admin'</code>) gains global privileges across all branches and tabs.
                    </li>
                    <li>
                      <strong>Branch Staff Isolation:</strong> Branch staff accounts have access restricted to their assigned branch bookings and operations.
                    </li>
                  </ul>
                </div>

                {/* Migration Script Selector & Code Box */}
                <div className="pt-6 border-t border-[#ECEBF0] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1">
                      <h4 className="font-serif text-lg font-medium text-[#1C1221]">
                        SQL Migration & Schema Scripts
                      </h4>
                      <p className="text-[11px] text-[#6B6175]">
                        Choose clean schema without seed data or view the optional demo seeds script.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-[#F0EEF5] p-1 rounded-lg flex items-center text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedSqlTab('clean')}
                          className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-all ${
                            selectedSqlTab === 'clean'
                              ? 'bg-white text-[#7B2D97] shadow-sm font-semibold'
                              : 'text-[#6B6175] hover:text-[#1C1221]'
                          }`}
                        >
                          1. Clean Schema (Zero Seeds)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSqlTab('seed')}
                          className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-all ${
                            selectedSqlTab === 'seed'
                              ? 'bg-white text-[#7B2D97] shadow-sm font-semibold'
                              : 'text-[#6B6175] hover:text-[#1C1221]'
                          }`}
                        >
                          2. Optional Demo Seeds
                        </button>
                      </div>

                      <button
                        onClick={copySqlSchema}
                        className="px-3.5 py-1.5 rounded bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                      >
                        {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 bg-[#140D18] text-[#DDD7E3] text-[11px] font-mono rounded overflow-x-auto max-h-64 leading-relaxed border border-[#32223D]">
                    {selectedSqlTab === 'clean' ? SUPABASE_CLEAN_SCHEMA_SQL : SUPABASE_SEED_SQL}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: WEBSITE CUSTOMIZER (SETTINGS, PROMOS & ABOUT CONTENT) */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* Header with Save Status */}
                <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-xl border border-[#ECEBF0] shadow-sm">
                  <div>
                    <h3 className="font-serif text-2xl text-[#1C1221]">
                      Website Sections & Content Customizer
                    </h3>
                    <p className="text-xs text-[#6B6175] mt-1">
                      Customize dynamic content sections: Exclusive Welcome Promos, About Philosophy, Atelier Checklist, and Salon Branding.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {settingsSaved && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium animate-in fade-in">
                        ✓ All Website Settings Saved!
                      </span>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-widest font-semibold rounded shadow cursor-pointer transition-colors"
                    >
                      Save All Changes
                    </button>
                  </div>
                </div>

                {/* SECTION 1: EXCLUSIVE WELCOME & PROMOTIONAL BANNER */}
                <div className="bg-white rounded-xl border border-[#ECEBF0] p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4 border-b border-[#ECEBF0] pb-4">
                    <div className="flex items-center gap-2.5">
                      <Gift className="w-5 h-5 text-[#E5A93C]" />
                      <div>
                        <h4 className="font-serif text-xl text-[#1C1221]">
                          Exclusive Welcome Privilege & Special Offers
                        </h4>
                        <p className="text-xs text-[#6B6175]">
                          Controls the introductory promotional banner on the homepage and announcement ribbon.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-[#F8F5FA] px-3.5 py-1.5 rounded-lg border border-[#EADBEE]">
                      <input
                        type="checkbox"
                        checked={localSettings.promoEnabled !== false}
                        onChange={(e) => setLocalSettings({ ...localSettings, promoEnabled: e.target.checked })}
                        className="rounded text-[#7B2D97] focus:ring-[#7B2D97]"
                      />
                      <span className="text-xs font-semibold text-[#1C1221]">
                        {localSettings.promoEnabled !== false ? 'Promo Active' : 'Promo Hidden'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Promo Badge Tagline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Exclusive Welcome Privilege"
                        value={localSettings.promoBadge || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, promoBadge: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Promo Main Headline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Get 20% Off On Your First Visit"
                        value={localSettings.promoTitle || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, promoTitle: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Promo Description / Terms
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Reserve any signature hair sculpting service or couture nail set..."
                        value={localSettings.promoDescription || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, promoDescription: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Button CTA Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Claim First Visit Privilege"
                        value={localSettings.promoButtonText || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, promoButtonText: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                      <div className="mt-3">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                          Discount Percentage (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={localSettings.discountPercentage || 20}
                          onChange={(e) => setLocalSettings({ ...localSettings, discountPercentage: Number(e.target.value) })}
                          className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                      Top Utility Announcement Bar Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New Customer? Get 20% Off On Your First Visit"
                      value={localSettings.announcementText || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, announcementText: e.target.value })}
                      className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                    />
                  </div>
                </div>

                {/* SECTION 2: THE ATELIER STANDARD & ABOUT STORY CONTENT */}
                <div className="bg-white rounded-xl border border-[#ECEBF0] p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-[#ECEBF0] pb-4">
                    <FileText className="w-5 h-5 text-[#7B2D97]" />
                    <div>
                      <h4 className="font-serif text-xl text-[#1C1221]">
                        The Atelier Standard & About Us Contents
                      </h4>
                      <p className="text-xs text-[#6B6175]">
                        Controls the storytelling section on the homepage and the dedicated About Us page.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        About Page Hero Headline
                      </label>
                      <input
                        type="text"
                        value={localSettings.aboutHeroTitle || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, aboutHeroTitle: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        About Page Hero Ethos Subtitle
                      </label>
                      <input
                        type="text"
                        value={localSettings.aboutHeroSubtitle || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, aboutHeroSubtitle: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Journey / Standard Headline
                      </label>
                      <input
                        type="text"
                        value={localSettings.aboutStoryHeadline || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, aboutStoryHeadline: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Boutique Standard Quote
                      </label>
                      <input
                        type="text"
                        value={localSettings.aboutQuote || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, aboutQuote: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                      Story & Atelier Philosophy Body Text
                    </label>
                    <textarea
                      rows={4}
                      value={localSettings.aboutStoryBody || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, aboutStoryBody: e.target.value })}
                      className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221] leading-relaxed"
                    />
                  </div>

                  {/* Checklist Items Editor */}
                  <div className="space-y-3 pt-2 border-t border-[#ECEBF0]">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221]">
                        Homepage Atelier Standard Checklist Items
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setLocalSettings({
                            ...localSettings,
                            checklistItems: [...(localSettings.checklistItems || []), 'New standard quality assurance feature']
                          })
                        }
                        className="text-xs text-[#7B2D97] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Bullet Point</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(localSettings.checklistItems || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updated = [...(localSettings.checklistItems || [])];
                              updated[idx] = e.target.value;
                              setLocalSettings({ ...localSettings, checklistItems: updated });
                            }}
                            className="flex-1 bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-1.5 text-xs text-[#1C1221]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (localSettings.checklistItems || []).filter((_, i) => i !== idx);
                              setLocalSettings({ ...localSettings, checklistItems: updated });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                            title="Remove bullet point"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: SALON BRANDING & GENERAL DETAILS */}
                <div className="bg-white rounded-xl border border-[#ECEBF0] p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-[#ECEBF0] pb-4">
                    <Building2 className="w-5 h-5 text-[#7B2D97]" />
                    <div>
                      <h4 className="font-serif text-xl text-[#1C1221]">
                        Salon Identity & Contact Concierge
                      </h4>
                      <p className="text-xs text-[#6B6175]">
                        Public contact numbers, primary salon address, and social links.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Salon Public Name
                      </label>
                      <input
                        type="text"
                        value={localSettings.salonName}
                        onChange={(e) => setLocalSettings({ ...localSettings, salonName: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Brand Tagline
                      </label>
                      <input
                        type="text"
                        value={localSettings.tagline}
                        onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Customer Concierge Phone
                      </label>
                      <input
                        type="text"
                        value={localSettings.phone}
                        onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Concierge Email
                      </label>
                      <input
                        type="email"
                        value={localSettings.email}
                        onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                      Primary Salon / Flagship Mall Address
                    </label>
                    <input
                      type="text"
                      value={localSettings.address}
                      onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                      className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs text-[#1C1221]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Facebook Page URL
                      </label>
                      <input
                        type="url"
                        value={localSettings.facebookUrl}
                        onChange={(e) => setLocalSettings({ ...localSettings, facebookUrl: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs font-mono text-[#1C1221]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={localSettings.instagramUrl || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                        className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3.5 py-2 text-xs font-mono text-[#1C1221]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-widest font-semibold rounded shadow cursor-pointer transition-colors"
                    >
                      Save All Settings
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: SERVICE (CREATE / EDIT) */}
      {/* ========================================================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1221]/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#ECEBF0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#ECEBF0] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#1C1221]">
                {editingService ? 'Edit Salon Service' : 'Add New Salon Service'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-[#B3A6BC] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5 text-[#6B6175]" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Treatment Title
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Dynamic Category
                  </label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Price (₱ PHP)
                  </label>
                  <input
                    type="number"
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs font-mono text-[#1C1221]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    value={serviceForm.durationMinutes}
                    onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs font-mono text-[#1C1221]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={serviceForm.isFeatured}
                    onChange={(e) => setServiceForm({ ...serviceForm, isFeatured: e.target.checked })}
                    className="rounded border-[#D9D6E2] text-[#7B2D97] focus:ring-[#7B2D97]"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-medium text-[#1C1221]">
                    Highlight on Homepage
                  </label>
                </div>
              </div>

              {/* Branch Availability Selector (Option C) */}
              <div className="bg-[#FAF8FC] p-3.5 rounded-lg border border-[#ECE4F2] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7B2D97]" />
                    Branch Availability
                  </label>
                  <span className="text-[10px] text-[#6B6175]">Default: All branches</span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="serviceBranchAvailability"
                      checked={serviceForm.allBranches}
                      onChange={() => setServiceForm({ ...serviceForm, allBranches: true })}
                      className="text-[#7B2D97] focus:ring-[#7B2D97]"
                    />
                    <span className="font-medium text-[#1C1221]">Available Across All Branches</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="serviceBranchAvailability"
                      checked={!serviceForm.allBranches}
                      onChange={() =>
                        setServiceForm({
                          ...serviceForm,
                          allBranches: false,
                          branchIds:
                            serviceForm.branchIds.length > 0
                              ? serviceForm.branchIds
                              : [branches[0]?.id || 'silang-premier']
                        })
                      }
                      className="text-[#7B2D97] focus:ring-[#7B2D97]"
                    />
                    <span className="font-medium text-[#1C1221]">Specific Branches Only</span>
                  </label>
                </div>

                {!serviceForm.allBranches && (
                  <div className="pt-2 border-t border-[#EAE3F0] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {branches.map((b) => {
                      const isChecked = serviceForm.branchIds.includes(b.id);
                      return (
                        <label
                          key={b.id}
                          className="flex items-center gap-2 text-xs text-[#1C1221] cursor-pointer bg-white p-2 rounded border border-[#DDD5E5]"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setServiceForm({
                                  ...serviceForm,
                                  branchIds: [...serviceForm.branchIds, b.id]
                                });
                              } else {
                                setServiceForm({
                                  ...serviceForm,
                                  branchIds: serviceForm.branchIds.filter((id) => id !== b.id)
                                });
                              }
                            }}
                            className="rounded text-[#7B2D97] focus:ring-[#7B2D97]"
                          />
                          <span className="truncate">{b.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Flag as Signature Service */}
              <div className="bg-[#FAF8FC] p-3 rounded-lg border border-[#ECE4F2] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1C1221] flex items-center gap-1.5">
                    <Star className={`w-3.5 h-3.5 ${serviceForm.isFeatured ? 'fill-[#E5A93C] text-[#E5A93C]' : 'text-[#8A7E93]'}`} />
                    Flag as Signature Service
                  </span>
                  <p className="text-[11px] text-[#6B6175]">Highlight this service on the Homepage with a gold Signature badge</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded border border-[#DDD5E5]">
                  <input
                    type="checkbox"
                    checked={serviceForm.isFeatured}
                    onChange={(e) => setServiceForm({ ...serviceForm, isFeatured: e.target.checked })}
                    className="rounded text-[#7B2D97] focus:ring-[#7B2D97]"
                  />
                  <span className="text-xs font-medium text-[#1C1221]">
                    {serviceForm.isFeatured ? 'Signature Active' : 'Standard'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECEBF0]">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#8A7E93] hover:text-[#1C1221] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PACKAGE (CREATE / EDIT) */}
      {/* ========================================================= */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1221]/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#ECEBF0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#ECEBF0] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#1C1221]">
                {editingPackage ? 'Edit Beauty Package' : 'Add New Beauty Package'}
              </h3>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="text-[#B3A6BC] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5 text-[#6B6175]" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  required
                  value={packageForm.title}
                  onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={packageForm.subtitle}
                  onChange={(e) => setPackageForm({ ...packageForm, subtitle: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Special Promo Price (₱ PHP)
                  </label>
                  <input
                    type="number"
                    required
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs font-mono text-[#1C1221]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Original Valuation (₱ PHP)
                  </label>
                  <input
                    type="number"
                    required
                    value={packageForm.originalPrice}
                    onChange={(e) => setPackageForm({ ...packageForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs font-mono text-[#1C1221]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Included Treatments (Comma Separated)
                </label>
                <input
                  type="text"
                  value={packageForm.includedServices.join(', ')}
                  onChange={(e) =>
                    setPackageForm({
                      ...packageForm,
                      includedServices: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              {/* Branch Availability Selector (Option C) */}
              <div className="bg-[#FAF8FC] p-3.5 rounded-lg border border-[#ECE4F2] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7B2D97]" />
                    Branch Availability
                  </label>
                  <span className="text-[10px] text-[#6B6175]">Default: All branches</span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="packageBranchAvailability"
                      checked={packageForm.allBranches}
                      onChange={() => setPackageForm({ ...packageForm, allBranches: true })}
                      className="text-[#7B2D97] focus:ring-[#7B2D97]"
                    />
                    <span className="font-medium text-[#1C1221]">Available Across All Branches</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="packageBranchAvailability"
                      checked={!packageForm.allBranches}
                      onChange={() =>
                        setPackageForm({
                          ...packageForm,
                          allBranches: false,
                          branchIds:
                            packageForm.branchIds.length > 0
                              ? packageForm.branchIds
                              : [branches[0]?.id || 'silang-premier']
                        })
                      }
                      className="text-[#7B2D97] focus:ring-[#7B2D97]"
                    />
                    <span className="font-medium text-[#1C1221]">Specific Branches Only</span>
                  </label>
                </div>

                {!packageForm.allBranches && (
                  <div className="pt-2 border-t border-[#EAE3F0] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {branches.map((b) => {
                      const isChecked = packageForm.branchIds.includes(b.id);
                      return (
                        <label
                          key={b.id}
                          className="flex items-center gap-2 text-xs text-[#1C1221] cursor-pointer bg-white p-2 rounded border border-[#DDD5E5]"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPackageForm({
                                  ...packageForm,
                                  branchIds: [...packageForm.branchIds, b.id]
                                });
                              } else {
                                setPackageForm({
                                  ...packageForm,
                                  branchIds: packageForm.branchIds.filter((id) => id !== b.id)
                                });
                              }
                            }}
                            className="rounded text-[#7B2D97] focus:ring-[#7B2D97]"
                          />
                          <span className="truncate">{b.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Flag as Featured / Popular Package */}
              <div className="bg-[#FAF8FC] p-3.5 rounded-lg border border-[#ECE4F2] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#1C1221] flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${packageForm.isPopular ? 'fill-[#E5A93C] text-[#E5A93C]' : 'text-[#8A7E93]'}`} />
                      Flag as Featured / Popular Package
                    </span>
                    <p className="text-[11px] text-[#6B6175]">Highlight this ritual package with a special badge in booking and services</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded border border-[#DDD5E5]">
                    <input
                      type="checkbox"
                      checked={packageForm.isPopular}
                      onChange={(e) => setPackageForm({ ...packageForm, isPopular: e.target.checked })}
                      className="rounded text-[#7B2D97] focus:ring-[#7B2D97]"
                    />
                    <span className="text-xs font-medium text-[#1C1221]">
                      {packageForm.isPopular ? 'Featured' : 'Standard'}
                    </span>
                  </label>
                </div>

                {packageForm.isPopular && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                      Custom Badge Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Most Popular Ritual, Curated Special"
                      value={packageForm.badgeText}
                      onChange={(e) => setPackageForm({ ...packageForm, badgeText: e.target.value })}
                      className="w-full bg-white border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECEBF0]">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#8A7E93] hover:text-[#1C1221] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CATEGORY (CREATE / EDIT) */}
      {/* ========================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1221]/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#ECEBF0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#ECEBF0] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#1C1221]">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-[#B3A6BC] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5 text-[#6B6175]" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lashes & Brows"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  URL Slug (Optional, auto-generated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. lashes"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs font-mono text-[#1C1221]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })}
                    className="w-24 bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-1.5 text-xs text-[#1C1221]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="catActive"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    className="rounded border-[#D9D6E2] text-[#7B2D97] focus:ring-[#7B2D97]"
                  />
                  <label htmlFor="catActive" className="text-xs font-medium text-[#1C1221]">
                    Active on Menu
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECEBF0]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#8A7E93] hover:text-[#1C1221] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: BRANCH (CREATE / EDIT) */}
      {/* ========================================================= */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1221]/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#ECEBF0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#ECEBF0] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#1C1221]">
                {editingBranch ? 'Edit Salon Branch' : 'Add New Branch'}
              </h3>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="text-[#B3A6BC] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5 text-[#6B6175]" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premier Mall Silang (Flagship)"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Mall / Building
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd Level, Premier Mall"
                    value={branchForm.mallName}
                    onChange={(e) => setBranchForm({ ...branchForm, mallName: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    City / Municipality
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Silang, Cavite"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Full Street Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Aguinaldo Highway, Silang, Cavite, 4118"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Direct Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Branch Email
                  </label>
                  <input
                    type="email"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  required
                  value={branchForm.operatingHours}
                  onChange={(e) => setBranchForm({ ...branchForm, operatingHours: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="branchActive"
                  checked={branchForm.isActive}
                  onChange={(e) => setBranchForm({ ...branchForm, isActive: e.target.checked })}
                  className="rounded border-[#D9D6E2] text-[#7B2D97] focus:ring-[#7B2D97]"
                />
                <label htmlFor="branchActive" className="text-xs font-medium text-[#1C1221]">
                  Branch is Open & Accepting Online Bookings
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECEBF0]">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#8A7E93] hover:text-[#1C1221] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: USER ACCOUNT (CREATE / EDIT - SUPER ADMIN ONLY) */}
      {/* ========================================================= */}
      {isUserModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1221]/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#ECEBF0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#ECEBF0] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#1C1221]">
                {editingUser ? 'Edit User Account' : 'Create New User Account'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-[#B3A6BC] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5 text-[#6B6175]" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Login Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@tiptopshears.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    System Role
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  >
                    <option value="staff">✂️ Branch Staff</option>
                    <option value="customer">📱 Mobile / Customer</option>
                    <option value="super_admin">👑 Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Assigned Branch
                  </label>
                  <select
                    value={userForm.branchId}
                    onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  >
                    <option value="all">All Branches (Global)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+63 917 000 0000"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Set password..."
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                  className="rounded border-[#D9D6E2] text-[#7B2D97] focus:ring-[#7B2D97]"
                />
                <label htmlFor="userActive" className="text-xs font-medium text-[#1C1221]">
                  Account is Active & Allowed to Sign In
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECEBF0]">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#8A7E93] hover:text-[#1C1221] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7B2D97] hover:bg-[#641F7D] text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: GALLERY ITEM (UPLOAD / EDIT) */}
      {/* ========================================================= */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1221]/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#ECEBF0] p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#ECEBF0] pb-3">
              <h3 className="font-serif text-xl font-medium text-[#1C1221] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#7B2D97]" />
                <span>{editingGalleryItem ? 'Edit Portfolio Photo' : 'Upload Portfolio Photo'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="text-[#6B6175] hover:text-[#1C1221] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Photo Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Japanese Precision Shears Bob, Haute Chrome Nails"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              {/* Dynamic Category Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221]">
                  Category Tag (Dynamic)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={galleryForm.isCustomCategory ? '__custom__' : galleryForm.category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setGalleryForm({ ...galleryForm, isCustomCategory: true });
                      } else {
                        setGalleryForm({
                          ...galleryForm,
                          category: e.target.value,
                          isCustomCategory: false
                        });
                      }
                    }}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                  >
                    {dynamicGalleryCategories
                      .filter((c) => c.id !== 'all')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    <option value="__custom__">➕ Custom Category Tag...</option>
                  </select>

                  {galleryForm.isCustomCategory && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom category name..."
                      value={galleryForm.category}
                      onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                      className="w-full bg-[#FAFAFB] border border-[#7B2D97] rounded px-3 py-2 text-xs text-[#1C1221]"
                    />
                  )}
                </div>
                <p className="text-[11px] text-[#6B6175]">
                  Ties directly to your Category Manager or enter a custom tag for the gallery portfolio.
                </p>
              </div>

              {/* Image Input: File Upload or Direct URL */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221]">
                  Photo Image (Upload Device File or Paste URL)
                </label>

                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#C5BCD0] hover:border-[#7B2D97] rounded-lg cursor-pointer bg-[#FAF8FC] hover:bg-[#F5EFF9] text-center transition-colors">
                  <Upload className="w-5 h-5 text-[#7B2D97] mb-1" />
                  <span className="text-xs font-semibold text-[#7B2D97]">Upload photo from device / computer</span>
                  <span className="text-[10px] text-[#8A7E93] mt-0.5">Supports JPG, PNG, WEBP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>

                <div>
                  <span className="text-[11px] text-[#6B6175] block mb-1">Or provide direct image URL:</span>
                  <input
                    type="text"
                    required
                    placeholder="https://... or /src/assets/images/..."
                    value={galleryForm.imageUrl}
                    onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221] font-mono"
                  />
                </div>

                {/* Live Preview */}
                {galleryForm.imageUrl && (
                  <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border border-[#D9D6E2] bg-[#1C1221]">
                    <img
                      src={galleryForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#1C1221]/80 text-[#E5A93C] text-[10px] font-mono">
                      Image Preview
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] mb-1">
                  Caption / Treatment Details
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Sculpted with Japanese high-carbon shears for effortless movement."
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#D9D6E2] rounded px-3 py-2 text-xs text-[#1C1221]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECEBF0]">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#8A7E93] hover:text-[#1C1221] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!galleryForm.title || !galleryForm.imageUrl}
                  className="px-5 py-2 bg-[#7B2D97] hover:bg-[#641F7D] disabled:opacity-50 text-white hover:text-[#E5A93C] text-xs uppercase tracking-wider font-semibold rounded shadow cursor-pointer transition-colors"
                >
                  {editingGalleryItem ? 'Save Changes' : 'Upload to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: IN-APP DELETION CONFIRMATION */}
      {/* ========================================================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1221]/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-red-100 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-semibold text-[#1C1221]">
                Confirm Deletion
              </h3>
              <p className="text-xs text-[#6B6175] leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-[#1C1221]">"{deleteConfirmTarget.title}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-xs font-semibold uppercase tracking-wider text-[#6B6175] rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-xs font-semibold uppercase tracking-wider text-white rounded transition-colors shadow cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
