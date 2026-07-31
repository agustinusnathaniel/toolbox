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
import { Binary, KeyRound, PaletteIcon } from 'lucide-react';
import type { JSX } from 'react';

import { Route as AddToCalendarRoute } from '@/routes/_tools/add-to-calendar/index';
import { Route as Base64Route } from '@/routes/_tools/base64/index';
import { Route as ColorConverterRoute } from '@/routes/_tools/color-converter/index';
import { Route as EvChargingRoute } from '@/routes/_tools/ev-charging/index';
import { Route as JsPerfRoute } from '@/routes/_tools/js-perf/index';
import { Route as JsonFormatterRoute } from '@/routes/_tools/json-formatter/index';
import { Route as PasswordGeneratorRoute } from '@/routes/_tools/password-generator/index';
import { Route as QrcodeRoute } from '@/routes/_tools/qrcode/index';
import { Route as UaCheckRoute } from '@/routes/_tools/ua-check/index';
import { Route as WaLinkHelperRoute } from '@/routes/_tools/wa-link-helper/index';
import { Route as ZippyImgRoute } from '@/routes/_tools/zippy-img/index';

export interface ToolNavItem {
  description: string;
  icon: JSX.Element;
  path: ToOptions['to'];
  slug: string;
  title: string;
}

interface ToolDefinition {
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

const tools: Array<ToolDefinition> = [
  {
    icon: <IconBrandWhatsapp />,
    mobileTitle: 'WA Link',
    route: WaLinkHelperRoute,
    showInMobile: true,
    slug: 'wa-link-helper',
  },
  {
    icon: <PaletteIcon />,
    mobileTitle: 'Color',
    route: ColorConverterRoute,
    showInMobile: true,
    slug: 'color-converter',
  },
  {
    icon: <IconBrackets />,
    mobileTitle: 'JSON',
    route: JsonFormatterRoute,
    showInMobile: true,
    slug: 'json-formatter',
  },
  {
    icon: <IconCamera />,
    route: ZippyImgRoute,
    showInMobile: true,
    slug: 'zippy-img',
  },
  { icon: <IconDeviceDesktop />, route: UaCheckRoute, slug: 'ua-check' },
  {
    icon: <IconQrCode />,
    mobileTitle: 'QR Code',
    route: QrcodeRoute,
    showInMobile: true,
    slug: 'qrcode',
  },
  { icon: <IconCodeLines />, route: JsPerfRoute, slug: 'js-perf' },
  {
    icon: <IconCalendar />,
    route: AddToCalendarRoute,
    slug: 'add-to-calendar',
  },
  { icon: <IconBolt />, route: EvChargingRoute, slug: 'ev-charging' },
  {
    icon: <Binary />,
    mobileTitle: 'Base64',
    route: Base64Route,
    showInMobile: true,
    slug: 'base64',
  },
  {
    icon: <KeyRound />,
    mobileTitle: 'Password',
    route: PasswordGeneratorRoute,
    showInMobile: true,
    slug: 'password-generator',
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
