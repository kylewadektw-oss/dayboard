// Boolean toggles to determine which auth types are allowed
const allowOauth = false; // Disabled for development
const allowEmail = false;
const allowPassword = false;

// Boolean toggle to determine whether auth interface should route through server or client
// (Currently set to false because screen sometimes flickers with server redirects)
const allowServerRedirect = false;

// OAuth is currently disabled for development
export const getAuthTypes = () => {
  return { allowOauth, allowEmail, allowPassword };
};

export const getViewTypes = () => {
  // OAuth login is disabled
  return ['oauth_signin']; // Kept for compatibility but OAuth is disabled
};

export const getDefaultSignInView = (preferredSignInView: string | null) => {
  // OAuth signin (disabled)
  return 'oauth_signin';
};

export const getRedirectMethod = () => {
  return allowServerRedirect ? 'server' : 'client';
};
