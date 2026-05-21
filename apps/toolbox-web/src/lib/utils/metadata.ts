export const SITE_NAME = 'Toolbox';
export const SITE_DESCRIPTION = 'A unified platform for useful web tools.';
export const SITE_URL = 'https://toolbox.example.com';

export const TOOL_META = {
  'wa-link-helper': {
    title: 'WA Link Helper',
    description:
      'Generate WhatsApp links with pre-filled messages and country codes.',
    path: '/tools/wa-link-helper',
  },
  'zippy-img': {
    title: 'zippy — Image Compressor',
    description:
      'Compress images securely in your browser with no server upload.',
    path: '/tools/zippy-img',
  },
  'ua-check': {
    title: 'UA Check',
    description: 'Check your browser and device user agent information.',
    path: '/tools/ua-check',
  },
  'qrcode-generator': {
    title: 'QR Code Generator',
    description: 'Generate QR codes for URLs or vCard contact information.',
    path: '/tools/qrcode-generator',
  },
  'js-perf-comparator': {
    title: 'JS Performance Comparator',
    description:
      'Compare JavaScript snippet execution in parallel sandboxed runtimes.',
    path: '/tools/js-perf-comparator',
  },
  'add-to-calendar': {
    title: 'Add to Calendar',
    description: 'Generate Add to Calendar links for Google Calendar events.',
    path: '/tools/add-to-calendar',
  },
} as const;
