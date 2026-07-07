export const getApiBaseUrl = () => import.meta.env.VITE_API_BASE?.trim() || '';

const normalizeConfigValue = (value) => {
  const trimmed = value?.trim();

  if (!trimmed) return '';

  if (trimmed === 'your_webhook_secret_here') return '';
  if (trimmed === 'rzp_test_your_public_key_here') return '';

  return trimmed;
};

export const buildApiUrl = (path) => {
  const base = getApiBaseUrl();
  return `${base}${path}`;
};

export const getRazorpayKeyId = () => normalizeConfigValue(import.meta.env.VITE_RAZORPAY_KEY_ID);

export const getEmailJsServiceId = () => normalizeConfigValue(import.meta.env.VITE_EMAILJS_SERVICE_ID);

export const getEmailJsTemplateId = () => normalizeConfigValue(import.meta.env.VITE_EMAILJS_TEMPLATE_ID);

export const getEmailJsPublicKey = () => normalizeConfigValue(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);