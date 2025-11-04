# Donoro - Blood Donation Mobile App 🩸

A React Native mobile application built with Expo for connecting blood donors with those in need. The app features real-time notifications, location-based donor search, and social features to facilitate blood donation coordination.

## 🚀 Features

- **User Authentication** - Email/Password, Google OAuth, Facebook OAuth
- **Blood Request Management** - Create, search, and respond to blood donation requests
- **Real-time Notifications** - Push notifications via Firebase Cloud Messaging + WebSocket
- **Location Services** - Find nearby donors and requests
- **Social Features** - Posts, appointments, and donor profiles
- **Profile Management** - Donor information, blood group, location
- **Deep Linking** - Direct navigation from notifications to specific screens

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase account with Cloud Messaging enabled
- Google Cloud Console project (for Google Sign-In)
- Facebook Developer account (for Facebook Login)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   BACKEND_API_ENDPOINT=https://your-backend-url.com/api/v1
   BACKEND_SOCKET_ENDPOINT=wss://your-backend-url.com/api/v1

   # Google OAuth Credentials
   GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
   GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id
   GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id

   # Facebook OAuth Credentials
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FACEBOOK_CLIENT_TOKEN=your_facebook_client_token

   # Google Maps API Key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Environment
   ENV=dev
   ```

4. **Configure Firebase**

   - Download `google-services.json` from Firebase Console
   - Place it in the project root directory

5. **Build native projects** (required for push notifications)
   ```bash
   npx expo prebuild --clean
   ```

## 🏃‍♂️ Running the App

### Development Build

```bash
# Start development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

### Production Build

```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

## 📱 Key Technologies

- **Framework**: Expo (SDK 53) with Expo Router
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Authentication**: OAuth 2.0 (Google, Facebook)
- **Push Notifications**: Expo Notifications + Firebase Cloud Messaging
- **Real-time**: WebSocket
- **Storage**: AsyncStorage
- **Maps**: React Native Maps with Google Maps
- **Image Handling**: Expo Image Picker
- **Location**: Expo Location

## 📂 Project Structure

```
frontend/
├── app/                   # Expo Router pages (file-based routing)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation screens
│   ├── (profile)/         # Profile related screens
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable UI components
├── contexts/              # React Context providers
│   ├── AuthContext.tsx
│   ├── PushNotificationContext.tsx
│   └── NotificationContext.tsx
├── hooks/                 # Custom React hooks
│   ├── useAPI.ts
│   ├── useNotification.ts
│   └── useWebSocket.ts
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── config/                # App configuration
├── constants/             # App constants (colors, etc.)
├── assets/                # Images, fonts, and other assets
└── app.config.js          # Expo configuration
```

## 🔔 Push Notification Setup

The app uses a hybrid notification system:

1. **WebSocket** - Real-time notifications when app is active
2. **FCM Push** - Background notifications when app is inactive
3. **Deep Linking** - Direct navigation to relevant screens

### Configuration

- Deep link scheme: `com.donoro.app://` and `fb{FACEBOOK_APP_ID}://`

## 🔐 Authentication Flow

1. User signs up/logs in via email, Google, or Facebook
2. JWT token received from backend
3. Token stored in AsyncStorage
4. Token included in API requests via Authorization header
5. Auto-refresh on token expiration

## 🗺️ Location Features

- Request current location permission
- Display donor locations on map
- Calculate distance to donors
- Filter donors by proximity

## 📊 API Integration

Backend API base URL is configured via environment variable:

- Development: `http://localhost:8000`
- Production: Your deployed backend URL

All API calls use the `useAPI` hook which handles:

- Authentication headers
- Error handling
- Token refresh
- Request/response logging

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 📦 Building for Production

### Android

```bash
# Generate APK
eas build --platform android --profile preview

# Generate AAB for Play Store
eas build --platform android --profile production
```

### iOS

```bash
# Build for TestFlight/App Store
eas build --platform ios --profile production
```

## 🐛 Troubleshooting

### Push Notifications Not Working

- Verify `google-services.json` is in project root
- Run `npx expo prebuild --clean` after adding the file
- Check FCM token is registered in backend
- Ensure notification permissions are granted

### Deep Links Not Working

- Verify scheme in `app.config.js` matches backend
- Rebuild native projects after config changes
- Test with `npx uri-scheme open com.donoro.app://notifications --android`

### Build Errors

- Clear cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clean build: `cd android && ./gradlew clean`

## 📝 Environment Variables

| Variable                   | Description                    | Required     |
| -------------------------- | ------------------------------ | ------------ |
| `BACKEND_API_ENDPOINT`     | Backend API URL with /api/v1   | Yes          |
| `BACKEND_SOCKET_ENDPOINT`  | Backend WebSocket URL (wss://) | Yes          |
| `GOOGLE_MAPS_API_KEY`      | Google Maps API key            | Yes          |
| `GOOGLE_WEB_CLIENT_ID`     | Google OAuth Web Client ID     | Yes          |
| `GOOGLE_IOS_CLIENT_ID`     | Google OAuth iOS Client ID     | iOS only     |
| `GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android Client ID | Android only |
| `FACEBOOK_APP_ID`          | Facebook App ID                | Optional     |
| `FACEBOOK_APP_SECRET`      | Facebook App Secret            | Optional     |
| `FACEBOOK_CLIENT_TOKEN`    | Facebook Client Token          | Optional     |
| `ENV`                      | Environment (dev/prod)         | Yes          |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

[Add your license information here]

## 🔗 Related Projects

- Backend API: https://github.com/Donoro-Organization/backend

## 📧 Contact

For support or inquiries, contact: [Add contact information]

## 🙏 Acknowledgments

- Expo team for the amazing framework
- Firebase for cloud messaging
- React Native community for components and libraries
