/**
 * Navigation helper utilities
 */

import { router } from "expo-router";

/**
 * Navigate to a user's profile page
 * @param userId - The ID of the user whose profile to view
 */
export const navigateToProfile = (userId: string) => {
  router.push(`/profile/${userId}` as any);
};

/**
 * Navigate to edit profile page (to be implemented)
 */
export const navigateToEditProfile = () => {
  // TODO: Implement edit profile navigation
  console.log("Navigate to edit profile");
};

/**
 * Navigate to review page (to be implemented)
 * @param userId - The ID of the user to review
 */
export const navigateToReview = (userId: string) => {
  // TODO: Implement review navigation
  console.log("Navigate to review for user:", userId);
};

/**
 * Navigate to message page (to be implemented)
 * @param userId - The ID of the user to message
 */
export const navigateToMessage = (userId: string) => {
  // TODO: Implement message navigation
  console.log("Navigate to message user:", userId);
};
