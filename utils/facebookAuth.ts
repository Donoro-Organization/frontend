import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import config from "../config/config";

WebBrowser.maybeCompleteAuthSession();

export interface FacebookAuthResult {
  email: string;
  accessToken: string;
  id: string;
  name?: string;
  picture?: string;
}

export const useFacebookAuth = () => {
  const redirectUri = makeRedirectUri({ native:`fb${config.FACEBOOK_APP_ID}://authorize` });

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: config.FACEBOOK_APP_ID,
    redirectUri: redirectUri,
  });

  if(request)
  {
    console.log("Facebook Request Redirect URI:", request.redirectUri);
  }

  // console.log("Facebook Redirect URI:", redirectUri);

  return {
    request,
    response,
    promptAsync,
  };
};

export const getFacebookUserInfo = async (
  accessToken: string
): Promise<FacebookAuthResult | null> => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userInfo = await response.json();

    return {
      id: userInfo.id,
      email: userInfo.email,
      accessToken: accessToken,
      name: userInfo.name,
      picture: userInfo.picture?.data?.url,
    };
  } catch (error) {
    console.error("Error fetching Facebook user info:", error);
    return null;
  }
};
