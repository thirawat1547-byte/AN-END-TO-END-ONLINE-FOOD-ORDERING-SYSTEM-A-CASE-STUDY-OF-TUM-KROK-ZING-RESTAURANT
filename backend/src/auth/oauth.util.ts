export function isOAuthConfigured(provider: 'google' | 'facebook' | 'line'): boolean {
  const isValid = (val: string | undefined): boolean => {
    if (!val) return false;
    const trimmed = val.trim();
    if (trimmed === '') return false;
    if (trimmed.includes('PLACEHOLDER')) return false;
    if (trimmed.includes('your_')) return false;
    if (trimmed.startsWith('xxxx')) return false;
    return true;
  };

  switch (provider) {
    case 'google':
      return isValid(process.env.GOOGLE_CLIENT_ID) && isValid(process.env.GOOGLE_CLIENT_SECRET);
    case 'facebook':
      return isValid(process.env.FACEBOOK_APP_ID) && isValid(process.env.FACEBOOK_APP_SECRET);
    case 'line':
      return isValid(process.env.LINE_CHANNEL_ID) && isValid(process.env.LINE_CHANNEL_SECRET);
    default:
      return false;
  }
}
