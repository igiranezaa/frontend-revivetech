import axios from 'axios';
import type { Listing } from '../features/marketplace/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type ApiRole = 'CUSTOMER' | 'ADMIN' | 'TECHNICIAN' | 'FINANCE_OFFICER' | 'SUPPORT_AGENT';

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: ApiRole;
}

export interface ApiDevice {
  id: string;
  brand: string;
  model: string;
  condition: string;
  batteryHealth?: number;
  trustScore?: number;
  eWasteSavedKg?: number;
  carbonSavedKg?: number;
  passport?: {
    certificationDetails?: string | null;
    certifiedAt?: string;
  } | null;
}

export interface ApiMarketplaceListing {
  id: string;
  deviceId: string;
  title: string;
  description: string;
  price: number;
  status?: string;
  device?: ApiDevice;
}

const DEVICE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop';

function titleCase(value?: string) {
  if (!value) return 'Device';
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function categoryFromDevice(device?: ApiDevice) {
  const text = `${device?.brand ?? ''} ${device?.model ?? ''}`.toLowerCase();
  if (text.includes('macbook') || text.includes('laptop')) return 'Laptop';
  if (text.includes('ipad') || text.includes('tablet')) return 'Tablet';
  if (text.includes('watch')) return 'Smartwatch';
  if (text.includes('camera') || text.includes('alpha')) return 'Camera';
  if (text.includes('switch') || text.includes('playstation') || text.includes('xbox')) return 'Gaming';
  return 'Smartphone';
}

export function mapListing(listing: ApiMarketplaceListing): Listing {
  const device = listing.device;
  const condition = titleCase(device?.condition) as Listing['condition'];
  const currentPrice = Math.round(Number(listing.price ?? 0));
  const basePrice = Math.round(currentPrice * 1.12);

  return {
    id: listing.id,
    deviceId: listing.deviceId,
    title: listing.title || `${device?.brand ?? ''} ${device?.model ?? ''}`.trim() || 'Refurbished Device',
    current_price: currentPrice,
    original_price: Math.max(basePrice, currentPrice),
    img: DEVICE_PLACEHOLDER,
    category: categoryFromDevice(device) as Listing['category'],
    condition,
    rating: device?.trustScore ? Math.max(1, Math.min(5, Math.round(device.trustScore / 20))) : 4,
    reviewCount: 0,
    description: listing.description || 'Certified refurbished device from the ReviveTech inventory.',
    specs: [
      { label: 'Brand', value: device?.brand ?? 'Unknown' },
      { label: 'Model', value: device?.model ?? 'Unknown' },
      { label: 'Battery Health', value: `${device?.batteryHealth ?? 100}%` },
      { label: 'Condition', value: condition },
      { label: 'Trust Score', value: `${device?.trustScore ?? 100}/100` },
    ],
  };
}

export async function getMarketplaceListings(params?: {
  search?: string;
  brand?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const { data } = await api.get<{ listings: ApiMarketplaceListing[] }>('/api/marketplace', {
    params,
  });
  return data.listings.map(mapListing);
}

export async function getMarketplaceListing(id: string) {
  const { data } = await api.get<{ listing: ApiMarketplaceListing }>(`/api/marketplace/${id}`);
  return mapListing(data.listing);
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message ?? error.response?.data?.error;
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
