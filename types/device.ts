export type DevicePlatform = "ios" | "android" | "web";

export interface DeviceRegistrationRequest {
  device_id: string;
  fcm_token: string;
  model: string;
  platform: DevicePlatform;
}

export interface DeviceCheckResponse {
  exists: boolean;
  last_active_at: string | null;
}
