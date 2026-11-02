import { installCommercialAnalytics } from './runtime.js';

installCommercialAnalytics(window, () => import('@vercel/analytics'), () => import('@vercel/speed-insights'));
