// Boolean toggles to determine which auth types are allowed
const allowOauth = true;
const allowEmail = false;
const allowPassword = false;

// Boolean toggle to determine whether auth interface should route through server or client
// (Currently set to false because screen sometimes flickers with server redirects)
const allowServerRedirect = false;

// Only OAuth is allowed for this app (Google Auth)
export const getAuthTypes = () => {
  return { allowOauth, allowEmail, allowPassword };
};

export const getViewTypes = () => {
  // Only OAuth login is supported
  return ['oauth_signin'];
};

export const getDefaultSignInView = (preferredSignInView: string | null) => {
  // Always default to OAuth signin
  return 'oauth_signin';
};

export const getRedirectMethod = () => {
  return allowServerRedirect ? 'server' : 'client';
};
