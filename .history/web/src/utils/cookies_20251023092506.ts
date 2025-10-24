// Cookie utility functions for client-side operations

export const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  // Set cookie with proper attributes for localhost and production
  const domain = window.location.hostname === 'localhost' ? '' : `; Domain=${window.location.hostname}`;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${domain}${secure}`;
};

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
};

export const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  
  // Delete cookie with proper attributes
  const domain = window.location.hostname === 'localhost' ? '' : `; Domain=${window.location.hostname}`;
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax${domain}`;
};
