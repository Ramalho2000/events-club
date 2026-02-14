import { STAFF_ROLES } from '@/constants/user';

export type StaffRole = (typeof STAFF_ROLES)[number];

export type UserRole = StaffRole | 'user';
