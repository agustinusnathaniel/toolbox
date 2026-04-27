import { defineConfig } from '@julr/vite-plugin-validate-env';
import z from 'zod';

export default defineConfig({
  validator: 'standard',
  schema: {
    // Example Only: Rename or Set to required when ready
    VITE_API_BASE_URL: z.string().optional(),
    ENABLE_PLUGIN_REACT_COMPILER: z.stringbool().optional(),
    VITE_ANALYTICS_DEBUG: z.stringbool().optional(),
    VITE_UMAMI_SCRIPT_URL: z.string().optional(),
    VITE_UMAMI_WEBSITE_ID: z.string().optional(),
  },
});
