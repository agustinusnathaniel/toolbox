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
import type { JSX } from 'react';

import { Route as AddToCalendarRoute } from '@/routes/_tools/add-to-calendar/index';
import { Route as EvChargingRoute } from '@/routes/_tools/ev-charging/index';
import { Route as JsPerfRoute } from '@/routes/_tools/js-perf/index';
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
    slug: 'wa-link-helper',
    icon: <IconBrandWhatsapp />,
    mobileTitle: 'WA Link',
    route: WaLinkHelperRoute,
    showInMobile: true,
  },
  {
    slug: 'zippy-img',
    icon: <IconCamera />,
    route: ZippyImgRoute,
    showInMobile: true,
  },
  { slug: 'ua-check', icon: <IconDeviceDesktop />, route: UaCheckRoute },
  {
    slug: 'qrcode',
    icon: <IconQrCode />,
    mobileTitle: 'QR Code',
    route: QrcodeRoute,
    showInMobile: true,
  },
  { slug: 'js-perf', icon: <IconCodeLines />, route: JsPerfRoute },
  {
    slug: 'add-to-calendar',
    icon: <IconCalendar />,
    route: AddToCalendarRoute,
  },
  { slug: 'ev-charging', icon: <IconBolt />, route: EvChargingRoute },
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
        slug: t.slug,
        title: filter?.mobile
          ? (t.mobileTitle ?? meta.pageTitle)
          : meta.pageTitle,
        description: meta.description,
        path: `/${t.slug}` as ToOptions['to'],
        icon: t.icon,
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
