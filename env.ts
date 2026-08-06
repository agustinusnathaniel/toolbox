import { defineConfig } from '@julr/vite-plugin-validate-env';
import z from 'zod';

export default defineConfig({
  schema: {
    ENABLE_PLUGIN_REACT_COMPILER: z.stringbool().optional(),
    VITE_ANALYTICS_DEBUG: z.stringbool().optional(),
    VITE_API_BASE_URL: z.string().optional(),
    VITE_ENABLE_TANSTACK_DEVTOOLS: z.stringbool().optional(),
    VITE_PUBLIC_SITE_URL: z.string().url().optional(),
    VITE_UMAMI_SCRIPT_URL: z.string().optional(),
    VITE_UMAMI_WEBSITE_ID: z.string().optional(),
  },
  validator: 'standard',
});
