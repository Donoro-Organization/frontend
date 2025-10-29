import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import config from "../config/config";

WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthResult {
  email: string;
  accessToken: string;
  idToken?: string;
  name?: string;
  picture?: string;
}

export const useGoogleAuth = () => {

  const redirectUri = makeRedirectUri({ native:'com.donoro.app:/oauthredirect' });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: config.GOOGLE_WEB_CLIENT_ID,
    androidClientId: config.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: config.GOOGLE_IOS_CLIENT_ID,
    redirectUri: redirectUri,
  });

  if(request)
  {
    console.log("Google Request Redirect URI:", request.redirectUri);
  }

  // console.log("Google Redirect URI:", redirectUri);

  return {
    request,
    response,
    promptAsync,
  };
};

export const getGoogleUserInfo = async (
  accessToken: string
): Promise<GoogleAuthResult | null> => {
  try {
    const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userInfo = await response.json();

    return {
      email: userInfo.email,
      accessToken: accessToken,
      name: userInfo.name,
      picture: userInfo.picture,
    };
  } catch (error) {
    console.error("Error fetching Google user info:", error);
    return null;
  }
};
