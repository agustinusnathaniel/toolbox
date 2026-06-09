import {
  IconBolt,
  IconBrandWhatsapp,
  IconCalendar,
  IconCamera,
  IconCodeLines,
  IconDeviceDesktop,
  IconQrCode,
} from '@intentui/icons';
import type { ToOptions } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { Route as AddToCalendarRoute } from '@/routes/_tools/add-to-calendar/index';
import { Route as EvChargingRoute } from '@/routes/_tools/ev-charging/index';
import { Route as JsPerfRoute } from '@/routes/_tools/js-perf/index';
import { Route as QrcodeRoute } from '@/routes/_tools/qrcode/index';
import { Route as UaCheckRoute } from '@/routes/_tools/ua-check/index';
import { Route as WaLinkHelperRoute } from '@/routes/_tools/wa-link-helper/index';
import { Route as ZippyImgRoute } from '@/routes/_tools/zippy-img/index';

export interface ToolNavItem {
  description: string;
  icon: ReactNode;
  path: ToOptions['to'];
  slug: string;
  title: string;
}

const iconMap: Record<string, ReactNode> = {
  'add-to-calendar': <IconCalendar />,
  'ev-charging': <IconBolt />,
  'js-perf': <IconCodeLines />,
  qrcode: <IconQrCode />,
  'ua-check': <IconDeviceDesktop />,
  'wa-link-helper': <IconBrandWhatsapp />,
  'zippy-img': <IconCamera />,
};

function staticMeta<T>(value: T | undefined): T {
  if (!value) {
    throw new Error('Missing meta in route staticData');
  }
  return value;
}

function getToolMeta(slug: string) {
  const map: Record<
    string,
    { pageTitle: string; description: string; slug: string }
  > = {
    'add-to-calendar': staticMeta(AddToCalendarRoute.options.staticData?.meta),
    'ev-charging': staticMeta(EvChargingRoute.options.staticData?.meta),
    'js-perf': staticMeta(JsPerfRoute.options.staticData?.meta),
    qrcode: staticMeta(QrcodeRoute.options.staticData?.meta),
    'ua-check': staticMeta(UaCheckRoute.options.staticData?.meta),
    'wa-link-helper': staticMeta(WaLinkHelperRoute.options.staticData?.meta),
    'zippy-img': staticMeta(ZippyImgRoute.options.staticData?.meta),
  };
  return map[slug];
}

const SLUGS = [
  'wa-link-helper',
  'zippy-img',
  'ua-check',
  'qrcode',
  'js-perf',
  'add-to-calendar',
  'ev-charging',
] as const;

const navItems: Array<ToolNavItem> = SLUGS.map((slug) => {
  const meta = getToolMeta(slug);
  return {
    slug,
    title: meta.pageTitle,
    description: meta.description,
    path: `/${slug}` as ToOptions['to'],
    icon: iconMap[slug],
  };
});

export function getToolNavItems(): Array<ToolNavItem> {
  return navItems;
}

export function getToolNavItem(slug: string): ToolNavItem | undefined {
  return navItems.find((item) => item.slug === slug);
}
