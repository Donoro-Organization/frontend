import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage keys for user authentication data
 */
export const STORAGE_KEYS = {
  USER_ID: "userId",
  USER_ROLE: "userRole",
  AUTH_TOKEN: "authToken",
  VERIFICATION_EMAIL: "verificationEmail", // Temporary storage for email during verification
  RESET_TOKEN: "resetToken", // Temporary token for password reset
  RESET_EMAIL: "resetEmail", // Email for password reset flow
} as const;

/**
 * Save user authentication data to AsyncStorage
 */
export const saveUserData = async (
  userId: string,
  role: string,
  token: string
): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.USER_ID, userId],
      [STORAGE_KEYS.USER_ROLE, role],
      [STORAGE_KEYS.AUTH_TOKEN, token],
    ]);
    console.log("User data saved successfully");
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

/**
 * Get user ID from AsyncStorage
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

/**
 * Get user role from AsyncStorage
 */
export const getUserRole = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

/**
 * Get auth token from AsyncStorage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Get all user data from AsyncStorage
 */
export const getAllUserData = async (): Promise<{
  userId: string | null;
  userRole: string | null;
  authToken: string | null;
}> => {
  try {
    const values = await AsyncStorage.multiGet([
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_ROLE,
      STORAGE_KEYS.AUTH_TOKEN,
    ]);

    return {
      userId: values[0][1],
      userRole: values[1][1],
      authToken: values[2][1],
    };
  } catch (error) {
    console.error("Error getting user data:", error);
    return {
      userId: null,
      userRole: null,
      authToken: null,
    };
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    return token !== null && token.length > 0;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Save verification email temporarily
 */
export const saveVerificationEmail = async (email: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.VERIFICATION_EMAIL, email);
    console.log("Verification email saved successfully");
  } catch (error) {
    console.error("Error saving verification email:", error);
    throw error;
  }
};

/**
 * Get verification email
 */
export const getVerificationEmail = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.VERIFICATION_EMAIL);
  } catch (error) {
    console.error("Error getting verification email:", error);
    return null;
  }
};

/**
 * Clear verification email
 */
export const clearVerificationEmail = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.VERIFICATION_EMAIL);
    console.log("Verification email cleared successfully");
  } catch (error) {
    console.error("Error clearing verification email:", error);
    throw error;
  }
};

/**
 * Save reset token temporarily
 */
export const saveResetToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RESET_TOKEN, token);
    console.log("Reset token saved successfully");
  } catch (error) {
    console.error("Error saving reset token:", error);
    throw error;
  }
};

/**
 * Get reset token
 */
export const getResetToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.RESET_TOKEN);
  } catch (error) {
    console.error("Error getting reset token:", error);
    return null;
  }
};

/**
 * Clear reset token
 */
export const clearResetToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RESET_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.RESET_EMAIL);
    console.log("Reset token cleared successfully");
  } catch (error) {
    console.error("Error clearing reset token:", error);
    throw error;
  }
};

/**
 * Save reset email temporarily
 */
export const saveResetEmail = async (email: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RESET_EMAIL, email);
    console.log("Reset email saved successfully");
  } catch (error) {
    console.error("Error saving reset email:", error);
    throw error;
  }
};

/**
 * Get reset email
 */
export const getResetEmail = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.RESET_EMAIL);
  } catch (error) {
    console.error("Error getting reset email:", error);
    return null;
  }
};

/**
 * Clear all user data from AsyncStorage (logout)
 */
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_ROLE,
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.VERIFICATION_EMAIL,
      STORAGE_KEYS.RESET_TOKEN,
      STORAGE_KEYS.RESET_EMAIL,
    ]);
    console.log("User data cleared successfully");
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw error;
  }
};
