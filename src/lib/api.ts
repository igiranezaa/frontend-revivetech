import axios from 'axios';
import type { DashboardNotification, Device, User } from '../features/dashboard/shared/types/dashboard.types';
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
  originalSerialNumber?: string | null;
  basePrice?: number;
  price?: number;
  warehouse?: string;
  stock?: number;
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
    trustScore: device?.trustScore ?? 100,
    batteryHealth: device?.batteryHealth ?? 100,
    eWasteSavedKg: device?.eWasteSavedKg ?? 0,
    carbonSavedKg: device?.carbonSavedKg ?? 0,
    certificationDetails: device?.passport?.certificationDetails ?? 'Certified refurbished device',
    certifiedAt: device?.passport?.certifiedAt,
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

function inventoryCategory(device: ApiDevice) {
  return categoryFromDevice(device).replace('Smartwatch', 'Wearable');
}

function mapInventoryDevice(device: ApiDevice): Device {
  return {
    id: device.id,
    sku: device.originalSerialNumber || device.id,
    brand: device.brand,
    model: `${device.brand} ${device.model}`.trim(),
    category: inventoryCategory(device),
    condition: titleCase(device.condition),
    warehouse: device.warehouse ?? 'Kigali Central',
    listPrice: Number(device.price ?? 0),
    basePrice: Number(device.basePrice ?? 0),
    batteryHealth: device.batteryHealth ?? 100,
    originalSerialNumber: device.originalSerialNumber ?? '',
    stock: device.stock ?? 1,
  };
}

export async function getAdminDevices() {
  const { data } = await api.get<{ devices: ApiDevice[] }>('/api/devices');
  return data.devices.map(mapInventoryDevice);
}

export async function createAdminDevice(input: {
  brand: string;
  model: string;
  originalSerialNumber?: string;
  condition: string;
  batteryHealth: number;
  basePrice: number;
  price: number;
  warehouse: string;
  stock: number;
}) {
  const { data } = await api.post<{ device: ApiDevice }>('/api/devices/intake', input);
  return mapInventoryDevice(data.device);
}

interface ApiNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString();
}

function notificationType(type: string): DashboardNotification['type'] {
  const normalized = type.toLowerCase();
  if (normalized.includes('error') || normalized.includes('fail')) return 'error';
  if (normalized.includes('warn') || normalized.includes('alert')) return 'warn';
  return 'info';
}

function mapNotification(notification: ApiNotification): DashboardNotification {
  return {
    id: notification.id,
    type: notificationType(notification.type),
    title: notification.type
      .toLowerCase()
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Notification',
    desc: notification.message,
    time: formatRelativeTime(notification.createdAt),
    read: notification.read,
  };
}

export async function getNotifications() {
  const { data } = await api.get<{ notifications: ApiNotification[] }>('/api/notifications');
  return data.notifications.map(mapNotification);
}

export async function markNotificationRead(id: string) {
  await api.patch(`/api/notifications/${id}/read`);
}

function roleLabel(role: ApiRole) {
  const labels: Record<ApiRole, string> = {
    CUSTOMER: 'Customer',
    ADMIN: 'Admin',
    TECHNICIAN: 'Technician',
    FINANCE_OFFICER: 'Finance Officer',
    SUPPORT_AGENT: 'Support Agent',
  };
  return labels[role];
}

interface ApiAdminUser extends ApiUser {
  isVerified?: boolean;
  createdAt?: string;
}

export async function getAdminUsers(): Promise<User[]> {
  const { data } = await api.get<{ users: ApiAdminUser[] }>('/api/users/admin/users');
  return data.users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone ?? '',
    role: roleLabel(user.role),
    status: user.isVerified === false ? 'Deactivated' : 'Active',
    lastActive: 'From database',
    lastActiveDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
    joinDate: user.createdAt ?? '',
  }));
}

export async function deleteAdminUser(id: string) {
  await api.delete(`/api/users/admin/users/${id}`);
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message ?? error.response?.data?.error;
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
