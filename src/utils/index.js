// src/utils/constants.js
export const API_BASE_URL = 'http://localhost:5000/api';

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// src/utils/helpers.js
export const formatScore = (score) => {
  return Number(score).toFixed(2);
};

export const getUserId = () => {
  let userId = localStorage.getItem('cogguard_userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('cogguard_userId', userId);
  }
  return userId;
};
