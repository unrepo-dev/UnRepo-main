// Theme-aware utility functions for consistent styling across pages

export const getCardClasses = (theme: 'light' | 'dark') => {
  return theme === 'dark'
    ? 'bg-gray-900 border border-red-900'
    : 'bg-white border border-gray-200 shadow-sm';
};

export const getCodeBlockClasses = (theme: 'light' | 'dark') => {
  return theme === 'dark'
    ? 'bg-black border border-gray-800'
    : 'bg-gray-50 border border-gray-200';
};

export const getTextClasses = (theme: 'light' | 'dark', variant: 'primary' | 'secondary' = 'primary') => {
  if (variant === 'secondary') {
    return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  }
  return theme === 'dark' ? 'text-white' : 'text-gray-900';
};

export const getAlertClasses = (theme: 'light' | 'dark') => {
  return theme === 'dark'
    ? 'bg-red-900/20 border border-red-900'
    : 'bg-red-50 border border-red-200';
};

export const getHoverClasses = (theme: 'light' | 'dark') => {
  return theme === 'dark'
    ? 'hover:bg-gray-800'
    : 'hover:bg-gray-100';
};
