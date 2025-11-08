// OAuth Configuration
export const oauthConfig = {
  facebook: {
    clientId: '1285230650283574',
    // Note: Client secret should be handled on the backend for security
    scope: 'public_profile' // Removido 'email' - usar apenas public_profile
  },
  google: {
    // Google credentials will be added later
    scope: 'email profile'
  }
};

// Get redirect URI safely for both client and server
function getRedirectUri(provider) {
  if (typeof window !== 'undefined') {
    // Para produção no GitHub Pages
    if (window.location.hostname === 'danielrodri87.github.io') {
      return `https://danielrodri87.github.io/auth/${provider}/callback`;
    }
    // Para desenvolvimento com ngrok
    if (window.location.hostname.includes('ngrok.io')) {
      return `${window.location.origin}/auth/${provider}/callback`;
    }
    // Para desenvolvimento local com jabutilar.local
    if (window.location.hostname === 'jabutilar.local') {
      return `http://jabutilar.local:3000/auth/${provider}/callback`;
    }
    // Fallback para localhost
    return `${window.location.origin}/auth/${provider}/callback`;
  }
  // Fallback for SSR
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://danielrodri87.github.io';
  return `${baseUrl}/auth/${provider}/callback`;
}

export const getAuthUrl = (provider) => {
  switch (provider) {
    case 'facebook':
      const redirectUri = getRedirectUri('facebook');
      return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${oauthConfig.facebook.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${oauthConfig.facebook.scope}&response_type=code&state=${generateState()}`;
    case 'google':
      // Google URL will be handled by backend
      return null;
    default:
      return null;
  }
};

// Generate a random state parameter for security
function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
