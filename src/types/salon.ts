export type ServiceCategory = string;

export interface Branch {
  id: string;
  name: string;
  mallName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  operatingHours: string;
  googleMapsUrl?: string;
  isActive: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export type UserRole = 'super_admin' | 'staff' | 'customer';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId?: string; // staff assigned branch or 'all'
  phone?: string;
  password?: string;
  createdAt: string;
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  price: number;
  durationMinutes: number;
  description: string;
  imageUrl: string;
  features: string[];
  branchIds?: string[]; // Empty or undefined means all branches
  isFeatured?: boolean;
  popular?: boolean;
}

export interface BeautyPackage {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  durationMinutes: number;
  description: string;
  includedServices: string[];
  imageUrl: string;
  branchIds?: string[]; // Empty or undefined means all branches
  isPopular?: boolean;
  badgeText?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  branchId: string;
  branchName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  stylist: string;
  notes?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
}

export interface SalonSettings {
  salonName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  hoursWeekday: string;
  hoursWeekend: string;
  announcementText: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  discountPercentage: number;
  // Exclusive Welcome / Promos Customization
  promoEnabled: boolean;
  promoBadge: string;
  promoTitle: string;
  promoDescription: string;
  promoButtonText: string;
  // Standard (About contents) Customization
  aboutHeroTitle: string;
  aboutHeroSubtitle: string;
  aboutStoryHeadline: string;
  aboutStoryBody: string;
  aboutQuote: string;
  checklistItems: string[];
}
