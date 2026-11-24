// Shared relative-time formatter for the in-app notification inbox.
export const timeAgo = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  const diffMs = new Date() - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};
