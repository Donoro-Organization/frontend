import { BloodGroup } from "./bloodRequest";
import { User } from "./user";

export interface DonorSearchParams {
  blood_group: BloodGroup;
  latitude: string;
  longitude: string;
  required_datetime: string;
  page?: number;
  limit?: number;
  range?: number;
}

export interface DonorWithUser {
  id: string;
  user_id: string;
  blood_group: BloodGroup;
  last_donation_date?: string;
  nid_number?: string;
  rejected_count: number;
  user: User;
  created_at: string;
  updated_at: string;
}

export interface DonorSearchResult {
  donor: DonorWithUser;
  distance_km: number | null;
  avg_rating: number | null;
}

export interface SearchFormData {
  bloodGroup: BloodGroup | "";
  location: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  bloodBagRequired: number;
  requiredDate: Date;
}
