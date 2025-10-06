import { LocalFileResponse } from "./file";

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum UserRole {
  GENERAL = "general",
  ADMIN = "admin",
  DONOR = "donor",
  RIDER = "rider",
}

export enum SocialPlatform {
  FACEBOOK = "facebook",
  GOOGLE = "google",
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  latitude?: string;
  longitude?: string;
  address?: string;
  birth_date?: string;
  gender?: Gender;
  role: UserRole;
  profile_image?: LocalFileResponse;
  social_platform?: SocialPlatform;
  verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
