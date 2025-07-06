/**
 * Utility functions for handling wishlist invite links and redirects
 */

/**
 * Generate a shareable invite link for a wishlist
 * @param {string} inviteCode - The invite code for the wishlist
 * @returns {string} Full URL that can be shared
 */
export const generateInviteLink = (inviteCode) => {
  // Create a full URL with the invite code
  const baseUrl = window.location.origin;
  return `${baseUrl}/join/${inviteCode}`;
};

/**
 * Handle redirect for invite links
 * This function can be called from index.js to check for invite codes in the URL
 */
export const handleInviteRedirect = () => {
  // Check if there's a code parameter in the URL (for backward compatibility)
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('code');
  
  if (codeParam) {
    // Redirect to the join page with the code in the URL path
    window.location.href = `/join/${codeParam}`;
    return true;
  }
  
  return false;
};
