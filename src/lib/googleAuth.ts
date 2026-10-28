import { UserProfile } from '../types';

declare global {
  interface Window {
    google?: any;
  }
}

export const getGoogleClientId = (): string => {
  const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (envId && envId.trim().length > 5) {
    return envId.trim();
  }
  const stored = localStorage.getItem('rabota_tj_google_client_id');
  if (stored && stored.trim().length > 5) {
    return stored.trim();
  }
  return '';
};

export const setStoredGoogleClientId = (clientId: string): void => {
  if (clientId) {
    localStorage.setItem('rabota_tj_google_client_id', clientId.trim());
  } else {
    localStorage.removeItem('rabota_tj_google_client_id');
  }
};

export const isGoogleClientConfigured = (): boolean => {
  return Boolean(getGoogleClientId());
};

/**
 * Initiates authentic Google OAuth 2.0 popup using Google Identity Services (GIS).
 * Uses prompt: 'select_account' so each user on every device selects their OWN Google account,
 * preventing any account mixing or automatic default selection.
 */
export const signInWithGooglePopup = (): Promise<UserProfile> => {
  return new Promise((resolve, reject) => {
    const clientId = getGoogleClientId();
    if (!clientId) {
      reject(new Error('GOOGLE_CLIENT_ID_NOT_CONFIGURED'));
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Библиотека Google Identity Services ещё загружается. Пожалуйста, повторите через 2 секунды.'));
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            if (tokenResponse.error === 'access_denied') {
              reject(new Error('Авторизация отменена пользователем.'));
            } else {
              reject(new Error(`Ошибка Google: ${tokenResponse.error}`));
            }
            return;
          }

          if (!tokenResponse.access_token) {
            reject(new Error('Токен доступа Google не получен.'));
            return;
          }

          try {
            // Fetch genuine Google profile information of the signed-in user
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });

            if (!response.ok) {
              throw new Error('Не удалось получить профиль пользователя от Google.');
            }

            const data = await response.json();

            if (!data.email) {
              throw new Error('Google не предоставил email адрес.');
            }

            // Create individual user profile with unique Google sub ID and genuine user email
            const individualUser: UserProfile = {
              id: 'google_' + (data.sub || Math.random().toString(36).substring(2, 10)),
              email: data.email.toLowerCase().trim(),
              fullName: data.name || data.given_name || data.email.split('@')[0],
              avatarUrl: data.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              role: 'worker',
              countryCode: 'TJ',
              city: 'Душанбе',
              createdAt: new Date().toISOString(),
            };

            resolve(individualUser);
          } catch (fetchErr: any) {
            reject(new Error(fetchErr?.message || 'Ошибка загрузки данных профиля Google'));
          }
        },
      });

      // Always force account selection dialog so accounts are never mixed across devices
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      reject(err);
    }
  });
};
