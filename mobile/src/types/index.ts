/**
 * Type definitions matching the Spring Boot backend
 */

// =========== AUTH ===========
export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
  preferredLanguage?: string;
  deviceId?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  healthcareProvider: boolean;
  roles: string[];
  active: boolean;
  profilePictureUrl?: string;
  createdAt?: string;
  lastLoginAt?: string;
  /** Populated by the admin user-list endpoint for healthcare-provider users. */
  doctorId?: number;
  credentialsVerified?: boolean;
  licenseNumber?: string;
  specialization?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// =========== CHILD ===========
export interface Child {
  id: number;
  firstName: string;
  lastName?: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  ageInMonths: number;
  bloodGroup?: string;
  birthWeightKg?: number;
  birthHeightCm?: number;
  profilePictureUrl?: string;
}

export interface ChildRequest {
  firstName: string;
  lastName?: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  birthWeightKg?: number;
  birthHeightCm?: number;
}

// =========== VACCINATION ===========
export interface VaccinationSchedule {
  id: number;
  vaccineCode: string;
  vaccineName: string;
  description?: string;
  recommendedAgeWeeks: number;
  dosesRequired: number;
  doseNumber: number;
  active: boolean;
}

export interface Vaccination {
  id: number;
  childId: number;
  scheduleId: number;
  vaccineCode: string;
  vaccineName: string;
  doseNumber: number;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SCHEDULED';
  scheduledDate?: string;
  administeredAt?: string;
  nextDoseDue?: string;
  clinicName?: string;
  batchNumber?: string;
  notes?: string;
  administeredBy?: string;
}

// =========== GROWTH ===========
export interface GrowthRecord {
  id: number;
  childId: number;
  measurementDate: string;
  ageInMonths: number;
  weightKg: number;
  heightCm: number;
  headCircumferenceCm?: number;
  muacCm?: number;
  bmi?: number;
  weightForAgeZ?: number;
  heightForAgeZ?: number;
  weightForHeightZ?: number;
  bmiForAgeZ?: number;
  nutritionStatus?: string;
  riskLevel?: string;
  healthScore?: number;
  growthTrend?: string;
  referralRecommended?: boolean;
  emergencyFlag?: boolean;
  oedema?: boolean;
  severeDehydration?: boolean;
  aiSummary?: string;
  notes?: string;
  recordedBy?: string;
}

export interface GrowthRequest {
  measurementDate: string;
  weightKg: number;
  heightCm: number;
  headCircumferenceCm?: number;
  muacCm?: number;
  notes?: string;
  oedema?: boolean;
  severeDehydration?: boolean;
}

// =========== NUTRITION ===========
export interface NutritionPlan {
  id: number;
  childId: number;
  childName?: string;
  planDate: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  title: string;
  description: string;
  ingredients?: string[];
  caloriesKcal?: number;
  ageAppropriate: boolean;
  feedingFrequency?: string;
  foodsToAvoid?: string;
}

// =========== APPOINTMENT ===========
export interface Appointment {
  id: number;
  childId: number;
  childName?: string;
  doctorId: number;
  doctorName?: string;
  appointmentDatetime: string;
  durationMinutes: number;
  appointmentType: string;
  clinicName?: string;
  clinicAddress?: string;
  reason?: string;
  notes?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  cancellationReason?: string;
  createdAt: string;
}

export interface AppointmentRequest {
  childId: number;
  doctorId: number;
  appointmentDatetime: string;
  durationMinutes?: number;
  appointmentType: string;
  clinicName?: string;
  reason?: string;
  notes?: string;
}

// =========== AI ===========
export interface AIChatMessage {
  id: number;
  userId: number;
  childId?: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AIChatRequest {
  message: string;
  childId?: number;
  language?: string;
}

// =========== NOTIFICATION ===========
export interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  type: 'VACCINATION' | 'GROWTH' | 'APPOINTMENT' | 'MEDICATION' | 'GENERAL';
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// =========== MEDICAL ===========
export interface Allergy {
  id: number;
  childId: number;
  allergen: string;
  reaction: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  diagnosedAt?: string;
  notes?: string;
}

export interface Medication {
  id: number;
  childId: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  active: boolean;
  notes?: string;
}

export interface Diagnosis {
  id: number;
  childId: number;
  doctorId: number;
  doctorName?: string;
  condition: string;
  diagnosisCode?: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  diagnosedAt: string;
  treatmentPlan?: string;
  notes?: string;
}

export interface Attachment {
  id: number;
  childId: number;
  entityType?: string;
  entityId?: number;
  fileName: string;
  originalFileName?: string;
  contentType?: string;
  fileSizeBytes?: number;
  storagePath?: string;
  publicUrl?: string;
  attachmentType?: string;
  category?: string;
  description?: string;
}

// =========== PROVIDER (HEALTHCARE WORKER) ===========
export interface HealthcareWorker {
  id: number;
  userId: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  workerRole: 'DOCTOR' | 'NURSE' | 'MIDWIFE' | 'CHW';
  licenseNumber?: string;
  specialization?: string;
  subSpecialty?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  languages?: string;
  languagesSpoken?: string;
  serviceArea?: string;
  /** Backend returns acceptingNewPatients - mapped to isOnDuty for backwards compat */
  isOnDuty: boolean;
  acceptingNewPatients?: boolean;
  acceptingReferrals: boolean;
  facilityId?: number;
  facilityName?: string;
  bio?: string;
  consultationFee?: number;
  profilePictureUrl?: string;
}

// =========== FACILITY ===========
export interface Facility {
  id: number;
  name: string;
  facilityType: 'HOSPITAL' | 'HEALTH_CENTER' | 'DISPENSARY' | 'CLINIC';
  address: string;
  city: string;
  region: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  servicesOffered?: string[];
  isActive: boolean;
}

// =========== ADMIN ===========
export interface AuditLog {
  id: number;
  userId?: number;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface SystemSettings {
  appName: string;
  appVersion: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxChildrenPerParent: number;
  jwtAccessTokenExpiration: number;
  jwtRefreshTokenExpiration: number;
  smsGatewayEnabled: boolean;
  emailGatewayEnabled: boolean;
  pushNotificationsEnabled: boolean;
}

// =========== COMMON ===========
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type UserRole = 'PARENT' | 'DOCTOR' | 'NURSE' | 'MIDWIFE' | 'CHW' | 'ADMIN' | 'HEALTHCARE_PROVIDER';
