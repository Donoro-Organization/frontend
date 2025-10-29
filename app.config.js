import "dotenv/config";

export default {
  expo: {
    name: "Donoro",
    slug: "donoro",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "com.donoro.app",
    icon: "./assets/images/logo_white.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.donoro.app",
      supportsTablet: true,
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["com.donoro.app", `fb${process.env.FACEBOOK_APP_ID}`]
          }
        ],
        LSApplicationQueriesSchemes: ["fbapi", "fb-messenger-share-api"]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo_white.png",
        backgroundColor: "#ffffff",
      },
      package: "com.donoro.app",
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "com.donoro.app"
            },
            {
              scheme: `fb${process.env.FACEBOOK_APP_ID}`
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      BACKEND_API_ENDPOINT: process.env.BACKEND_API_ENDPOINT,
      GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
      GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
      GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
      FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
      FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
      FACEBOOK_CLIENT_TOKEN: process.env.FACEBOOK_CLIENT_TOKEN,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      ENV: process.env.ENV,
      eas: {
        projectId: "5deaafb3-3895-44da-94e6-48b9cffbdd5a",
      },
      router: {
        origin: false,
      },
    },
  },
};