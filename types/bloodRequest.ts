// Type definitions for Blood Request and Donor Invitations
import { User } from "./user";

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}

export enum BloodRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

export interface BloodRequest {
  id: string;
  user_id: string;
  blood_group: BloodGroup;
  patient_condition?: string;
  location: string;
  address: string;
  latitude: string;
  longitude: string;
  required_datetime: string;
  quantity: number;
  status: BloodRequestStatus;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface DonorInvitation {
  id: string;
  donor_id: string;
  blood_request_id: string;
  status: InvitationStatus;
  notes?: string;
  sent_at: string;
  responded_at?: string;
  blood_request?: BloodRequest;
}

export interface ApiResponse<T> {
  status_code: number;
  message: string;
  data?: T;
}

export interface PaginatedInvitationsResponse {
  invitations: DonorInvitation[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface BulkDonorInvitationItemRequest {
  donor_id: string;
  notes?: string;
}

export interface BulkDonorInvitationCreateRequest {
  blood_request: BloodRequestCreateRequest;
  donor_invitations: BulkDonorInvitationItemRequest[];
}

// Request types for creating blood requests
export interface BloodRequestCreateRequest {
  blood_group: BloodGroup;
  patient_condition?: string;
  location: string;
  address: string;
  latitude: string;
  longitude: string;
  required_datetime: string; // ISO format
  quantity?: number;
}

export interface BulkDonorInvitationItemRequest {
  donor_id: string;
  notes?: string;
}

export interface BulkDonorInvitationCreateRequest {
  blood_request: BloodRequestCreateRequest;
  donor_invitations: BulkDonorInvitationItemRequest[];
}
