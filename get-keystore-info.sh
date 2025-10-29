#!/bin/bash

# Script to generate Facebook Key Hash and SHA-1 fingerprint for Android
# Useful for OAuth configuration in Google Cloud Console and Facebook Developer Console

echo "======================================"
echo "Android Keystore Info Generator"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Debug Keystore (Default)
DEBUG_KEYSTORE="$HOME/.android/debug.keystore"
DEBUG_ALIAS="androiddebugkey"
DEBUG_PASSWORD="android"

# Check if debug keystore exists
if [ -f "$DEBUG_KEYSTORE" ]; then
    echo -e "${GREEN}✓ Debug Keystore Found${NC}"
    echo "Location: $DEBUG_KEYSTORE"
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "DEBUG KEYSTORE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Generate SHA-1 for Google
    echo -e "${YELLOW}📱 SHA-1 Fingerprint (for Google Cloud Console):${NC}"
    keytool -list -v -keystore "$DEBUG_KEYSTORE" -alias "$DEBUG_ALIAS" -storepass "$DEBUG_PASSWORD" -keypass "$DEBUG_PASSWORD" 2>/dev/null | grep "SHA1:" | cut -d' ' -f3
    echo ""
    
    # Generate SHA-256 for Google
    echo -e "${YELLOW}📱 SHA-256 Fingerprint (for Google Cloud Console):${NC}"
    keytool -list -v -keystore "$DEBUG_KEYSTORE" -alias "$DEBUG_ALIAS" -storepass "$DEBUG_PASSWORD" -keypass "$DEBUG_PASSWORD" 2>/dev/null | grep "SHA256:" | cut -d' ' -f3
    echo ""
    
    # Generate Facebook Key Hash
    echo -e "${YELLOW}📘 Facebook Key Hash (for Facebook Developer Console):${NC}"
    keytool -exportcert -alias "$DEBUG_ALIAS" -keystore "$DEBUG_KEYSTORE" -storepass "$DEBUG_PASSWORD" -keypass "$DEBUG_PASSWORD" 2>/dev/null | openssl sha1 -binary | openssl base64
    echo ""
    
    # Package Name
    echo -e "${YELLOW}📦 Package Name (from build.gradle):${NC}"
    if [ -f "android/app/build.gradle" ]; then
        grep "applicationId" android/app/build.gradle | head -1 | sed "s/.*'\(.*\)'.*/\1/"
    else
        echo "com.android.donoro (default from manifest)"
    fi
    echo ""
else
    echo -e "${RED}✗ Debug Keystore Not Found${NC}"
    echo "Expected location: $DEBUG_KEYSTORE"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RELEASE KEYSTORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for release keystore in common locations
RELEASE_KEYSTORE=""
RELEASE_ALIAS=""

# Common locations to check
LOCATIONS=(
    "android/app/my-upload-key.keystore"
    "android/app/release.keystore"
    "android/app/app-release.keystore"
    "android/release.keystore"
    "$HOME/.android/release.keystore"
)

for loc in "${LOCATIONS[@]}"; do
    if [ -f "$loc" ]; then
        RELEASE_KEYSTORE="$loc"
        break
    fi
done

if [ -n "$RELEASE_KEYSTORE" ]; then
    echo -e "${GREEN}✓ Release Keystore Found${NC}"
    echo "Location: $RELEASE_KEYSTORE"
    echo ""
    echo -e "${YELLOW}Please enter release keystore details:${NC}"
    
    # Prompt for release keystore details
    read -p "Keystore Alias (e.g., my-key-alias): " RELEASE_ALIAS
    read -sp "Keystore Password: " RELEASE_PASSWORD
    echo ""
    read -sp "Key Password (press Enter if same as keystore password): " KEY_PASSWORD
    echo ""
    
    # Use keystore password if key password is empty
    if [ -z "$KEY_PASSWORD" ]; then
        KEY_PASSWORD="$RELEASE_PASSWORD"
    fi
    
    echo ""
    
    # Generate SHA-1 for Google
    echo -e "${YELLOW}📱 SHA-1 Fingerprint (for Google Cloud Console):${NC}"
    keytool -list -v -keystore "$RELEASE_KEYSTORE" -alias "$RELEASE_ALIAS" -storepass "$RELEASE_PASSWORD" -keypass "$KEY_PASSWORD" 2>/dev/null | grep "SHA1:" | cut -d' ' -f3
    echo ""
    
    # Generate SHA-256 for Google
    echo -e "${YELLOW}📱 SHA-256 Fingerprint (for Google Cloud Console):${NC}"
    keytool -list -v -keystore "$RELEASE_KEYSTORE" -alias "$RELEASE_ALIAS" -storepass "$RELEASE_PASSWORD" -keypass "$KEY_PASSWORD" 2>/dev/null | grep "SHA256:" | cut -d' ' -f3
    echo ""
    
    # Generate Facebook Key Hash
    echo -e "${YELLOW}📘 Facebook Key Hash (for Facebook Developer Console):${NC}"
    keytool -exportcert -alias "$RELEASE_ALIAS" -keystore "$RELEASE_KEYSTORE" -storepass "$RELEASE_PASSWORD" -keypass "$KEY_PASSWORD" 2>/dev/null | openssl sha1 -binary | openssl base64
    echo ""
else
    echo -e "${YELLOW}ℹ Note: Currently using DEBUG keystore for release builds${NC}"
    echo "As per your build.gradle configuration:"
    echo "  release {"
    echo "    signingConfig signingConfigs.debug"
    echo "  }"
    echo ""
    echo -e "${YELLOW}⚠ For production, create a release keystore:${NC}"
    echo "  keytool -genkey -v -keystore my-upload-key.keystore \\"
    echo "    -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000"
    echo ""
    echo "Then update your build.gradle to use it for release builds."
    echo ""
fi

echo "======================================"
echo "OAuth Configuration Checklist"
echo "======================================"
echo ""
echo "✓ Google Cloud Console:"
echo "  1. Go to: https://console.cloud.google.com/"
echo "  2. Navigate to: APIs & Services → Credentials"
echo "  3. Add SHA-1 and SHA-256 to your Android OAuth client"
echo "  4. Add redirect URI: https://auth.expo.io/@donoro/donoro"
echo ""
echo "✓ Facebook Developer Console:"
echo "  1. Go to: https://developers.facebook.com/"
echo "  2. Select your app → Settings → Basic → Android"
echo "  3. Add Package Name: com.android.donoro"
echo "  4. Add Key Hash (from above)"
echo "  5. Go to: Facebook Login → Settings"
echo "  6. Add redirect URI: https://auth.expo.io/@donoro/donoro"
echo ""
