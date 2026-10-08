export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

export const getDaysDifference = (targetDateStr) => {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getGenreColor = (genre) => {
  const map = {
    'Fiction': '#4f46e5',
    'Non-Fiction': '#059669',
    'Technology': '#0284c7',
    'Science': '#0891b2',
    'Mystery': '#7c3aed',
    'Fantasy': '#d97706',
    'Biography': '#db2777',
    'Economics': '#e11d48',
    'Self-Help': '#16a34a',
  };
  return map[genre] || '#475569';
};
