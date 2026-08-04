import {
  IconBolt,
  IconBrackets,
  IconBrandWhatsapp,
  IconCalendar,
  IconCamera,
  IconCodeLines,
  IconDeviceDesktop,
  IconQrCode,
} from '@intentui/icons';
import type { ToOptions } from '@tanstack/react-router';
import {
  Binary,
  Fingerprint,
  KeyRound,
  PaletteIcon,
  ScanLine,
} from 'lucide-react';
import type { JSX } from 'react';

import { Route as AddToCalendarRoute } from '@/routes/_tools/add-to-calendar/index';
import { Route as Base64Route } from '@/routes/_tools/base64/index';
import { Route as ColorConverterRoute } from '@/routes/_tools/color-converter/index';
import { Route as EvChargingRoute } from '@/routes/_tools/ev-charging/index';
import { Route as HashGeneratorRoute } from '@/routes/_tools/hash-generator/index';
import { Route as JsPerfRoute } from '@/routes/_tools/js-perf/index';
import { Route as JsonFormatterRoute } from '@/routes/_tools/json-formatter/index';
import { Route as JwtDecoderRoute } from '@/routes/_tools/jwt-decoder/index';
import { Route as PasswordGeneratorRoute } from '@/routes/_tools/password-generator/index';
import { Route as QrcodeRoute } from '@/routes/_tools/qrcode/index';
import { Route as UaCheckRoute } from '@/routes/_tools/ua-check/index';
import { Route as WaLinkHelperRoute } from '@/routes/_tools/wa-link-helper/index';
import { Route as ZippyImgRoute } from '@/routes/_tools/zippy-img/index';

export type ToolCategory =
  | 'Links & Sharing'
  | 'Text & Data'
  | 'Design & Media'
  | 'Developer'
  | 'Calculators'
  | 'Security';

/** Display order of sidebar categories (most-used first). */
export const TOOL_CATEGORIES: ReadonlyArray<ToolCategory> = [
  'Links & Sharing',
  'Text & Data',
  'Design & Media',
  'Developer',
  'Calculators',
  'Security',
];

export interface ToolNavItem {
  category: ToolCategory;
  description: string;
  icon: JSX.Element;
  path: ToOptions['to'];
  slug: string;
  title: string;
}

interface ToolDefinition {
  category: ToolCategory;
  icon: JSX.Element;
  mobileTitle?: string;
  route: { options: { staticData?: { meta?: unknown } } };
  showInMobile?: boolean;
  slug: string;
}

function staticMeta<T>(value: T | undefined): T {
  if (!value) {
    throw new Error('Missing meta in route staticData');
  }
  return value;
}

// Order defines homepage grid + keyboard shortcuts (1..N) — keep stable.
const tools: Array<ToolDefinition> = [
  {
    category: 'Links & Sharing',
    icon: <IconBrandWhatsapp />,
    mobileTitle: 'WA Link',
    route: WaLinkHelperRoute,
    showInMobile: true,
    slug: 'wa-link-helper',
  },
  {
    category: 'Design & Media',
    icon: <PaletteIcon />,
    mobileTitle: 'Color',
    route: ColorConverterRoute,
    showInMobile: true,
    slug: 'color-converter',
  },
  {
    category: 'Text & Data',
    icon: <IconBrackets />,
    mobileTitle: 'JSON',
    route: JsonFormatterRoute,
    showInMobile: true,
    slug: 'json-formatter',
  },
  {
    category: 'Design & Media',
    icon: <IconCamera />,
    route: ZippyImgRoute,
    slug: 'zippy-img',
  },
  {
    category: 'Developer',
    icon: <IconDeviceDesktop />,
    route: UaCheckRoute,
    slug: 'ua-check',
  },
  {
    category: 'Links & Sharing',
    icon: <IconQrCode />,
    mobileTitle: 'QR Code',
    route: QrcodeRoute,
    showInMobile: true,
    slug: 'qrcode',
  },
  {
    category: 'Developer',
    icon: <IconCodeLines />,
    route: JsPerfRoute,
    slug: 'js-perf',
  },
  {
    category: 'Links & Sharing',
    icon: <IconCalendar />,
    route: AddToCalendarRoute,
    slug: 'add-to-calendar',
  },
  {
    category: 'Calculators',
    icon: <IconBolt />,
    route: EvChargingRoute,
    slug: 'ev-charging',
  },
  {
    category: 'Text & Data',
    icon: <Binary />,
    mobileTitle: 'Base64',
    route: Base64Route,
    slug: 'base64',
  },
  {
    category: 'Security',
    icon: <KeyRound />,
    mobileTitle: 'Password',
    route: PasswordGeneratorRoute,
    slug: 'password-generator',
  },
  {
    category: 'Security',
    icon: <Fingerprint />,
    route: HashGeneratorRoute,
    slug: 'hash-generator',
  },
  {
    category: 'Developer',
    icon: <ScanLine />,
    route: JwtDecoderRoute,
    slug: 'jwt-decoder',
  },
];

function buildNavItems(filter?: { mobile?: boolean }): Array<ToolNavItem> {
  return tools
    .filter((t) => (filter?.mobile ? t.showInMobile : true))
    .map((t) => {
      const meta = staticMeta(
        t.route.options.staticData?.meta as
          | { pageTitle: string; description: string; slug: string }
          | undefined
      );
      return {
        category: t.category,
        description: meta.description,
        icon: t.icon,
        path: `/${t.slug}` as ToOptions['to'],
        slug: t.slug,
        title: filter?.mobile
          ? (t.mobileTitle ?? meta.pageTitle)
          : meta.pageTitle,
      };
    });
}

const allNavItems = buildNavItems();

export function getToolNavItems(): Array<ToolNavItem> {
  return allNavItems;
}

export function getMobileNavItems(): Array<ToolNavItem> {
  return buildNavItems({ mobile: true });
}

export function getToolNavItem(slug: string): ToolNavItem | undefined {
  return allNavItems.find((item) => item.slug === slug);
}

export function getToolNavCategories(): Array<{
  category: ToolCategory;
  items: Array<ToolNavItem>;
}> {
  return TOOL_CATEGORIES.map((category) => ({
    category,
    items: allNavItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}
