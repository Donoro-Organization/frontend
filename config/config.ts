import Constants from "expo-constants";

const config = {
  BACKEND_API_ENDPOINT: Constants.expoConfig?.extra?.BACKEND_API_ENDPOINT || "",
  GOOGLE_WEB_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID || "",
  GOOGLE_ANDROID_CLIENT_ID:
    Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID || "",
  GOOGLE_EXPO_CLIENT_ID:
    Constants.expoConfig?.extra?.GOOGLE_EXPO_CLIENT_ID || "",
  GOOGLE_IOS_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID || "",
  FACEBOOK_APP_ID: Constants.expoConfig?.extra?.FACEBOOK_APP_ID || "",
  FACEBOOK_APP_SECRET: Constants.expoConfig?.extra?.FACEBOOK_APP_SECRET || "",
  GOOGLE_MAPS_API_KEY: Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || "",
  ENV: Constants.expoConfig?.extra?.ENV || "prod",
};


export default config;
