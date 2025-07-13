// Get the user's timezone from browser
const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error detecting timezone, falling back to UTC:', error);
    return 'UTC';
  }
};

// Format date in user's local timezone
const formatLocalDate = (date: Date, timezone?: string): string => {
  return new Date(date).toLocaleString('en-US', {
    timeZone: timezone || getUserTimezone(),
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export { getUserTimezone, formatLocalDate };
