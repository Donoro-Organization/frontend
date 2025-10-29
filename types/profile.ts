import { Gender } from "./user";
import { BloodGroup } from "./bloodRequest";

export interface UserProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone?: string;
  latitude?: string;
  longitude?: string;
  address?: string;
  birth_date?: string;
  gender?: Gender;
}

export interface DonorProfileUpdateData extends UserProfileUpdateData {
  blood_group?: BloodGroup;
  last_donation_date?: string;
  nid_number?: string;
}
