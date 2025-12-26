export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  ADMIN = 'admin'
}

export enum BookingStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  ON_TRIP = 'On Trip',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum Language {
  ENGLISH = 'en',
  TAMIL = 'ta'
}

export enum LeadSource {
  WEBSITE = 'Website',
  PHONE = 'Phone',
  WHATSAPP = 'WhatsApp'
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: LeadSource;
  timestamp: Date;
}

export interface AuthCredentials {
  username?: string;
  password?: string;
}

export interface DriverAuth {
  driverId: string;
  username: string;
  password?: string;
  pin?: string;
}

export interface CustomerProfile {
  phone: string;
  isVerified: boolean;
}

export interface Vehicle {
  id: string;
  type: string;
  models: string[];
  capacity: number;
  maxSeats: number;
  image: string;
  imageUrl?: string;
  baseFare: number;
  tariff: {
    nonAc: number[];
    ac: number[];
    extraKm: {
      nonAc: number;
      ac: number;
    };
  };
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  passengerCount?: number;
  pickup: string;
  pickupCoords?: { lat: number; lng: number };
  drop: string;
  dropCoords?: { lat: number; lng: number };
  status: BookingStatus;
  fare: number;
  paymentStatus?: string;
  paymentMethod?: string;
  otp: string;
  driverId?: string;
  timestamp: Date;
  isAc: boolean;
  vehicleType: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  licenseNo?: string;
  vehicleNo: string;
  vehicleType: string;
  isOnline: boolean;
  rating: number;
  totalTrips?: number;
  earnings?: number;
  status?: string;
}

export interface AppSettings {
  appName: string;
  supportPhone: string;
  logoUrl?: string;
  logoText?: string;
  serviceEnabled?: boolean;
}