import {
  IconBolt,
  IconBrackets,
  IconBrandWhatsapp,
  IconCalendar,
  IconCamera,
  IconCodeLines,
  IconColorPalette,
  IconDeviceDesktop,
  IconQrCode,
} from '@intentui/icons';
import {
  Binary,
  Braces,
  CaseSensitive,
  Clock,
  Dices,
  FileText,
  Fingerprint,
  GitCompare,
  KeyRound,
  Link2,
  Regex,
  ScanLine,
  Table2,
} from 'lucide-react';
import type { JSX } from 'react';

import { meta as addToCalendarMeta } from '@/routes/_tools/add-to-calendar/-meta';
import { meta as base64Meta } from '@/routes/_tools/base64/-meta';
import { meta as caseConverterMeta } from '@/routes/_tools/case-converter/-meta';
import { meta as colorConverterMeta } from '@/routes/_tools/color-converter/-meta';
import { meta as cronParserMeta } from '@/routes/_tools/cron-parser/-meta';
import { meta as csvConverterMeta } from '@/routes/_tools/csv-converter/-meta';
import { meta as evChargingMeta } from '@/routes/_tools/ev-charging/-meta';
import { meta as hashGeneratorMeta } from '@/routes/_tools/hash-generator/-meta';
import { meta as htmlEntitiesMeta } from '@/routes/_tools/html-entities/-meta';
import { meta as jsPerfMeta } from '@/routes/_tools/js-perf/-meta';
import { meta as jsonFormatterMeta } from '@/routes/_tools/json-formatter/-meta';
import { meta as jsonToTsMeta } from '@/routes/_tools/json-to-ts/-meta';
import { meta as jwtDecoderMeta } from '@/routes/_tools/jwt-decoder/-meta';
import { meta as markdownPreviewMeta } from '@/routes/_tools/markdown-preview/-meta';
import { meta as numberBaseMeta } from '@/routes/_tools/number-base/-meta';
import { meta as passwordGeneratorMeta } from '@/routes/_tools/password-generator/-meta';
import { meta as qrcodeMeta } from '@/routes/_tools/qrcode/-meta';
import { meta as regexTesterMeta } from '@/routes/_tools/regex-tester/-meta';
import { meta as sqlFormatterMeta } from '@/routes/_tools/sql-formatter/-meta';
import { meta as textDiffMeta } from '@/routes/_tools/text-diff/-meta';
import { meta as timestampConverterMeta } from '@/routes/_tools/timestamp-converter/-meta';
import { meta as uaCheckMeta } from '@/routes/_tools/ua-check/-meta';
import { meta as urlCodecMeta } from '@/routes/_tools/url-codec/-meta';
import { meta as uuidGeneratorMeta } from '@/routes/_tools/uuid-generator/-meta';
import { meta as waLinkHelperMeta } from '@/routes/_tools/wa-link-helper/-meta';
import { meta as yamlConverterMeta } from '@/routes/_tools/yaml-converter/-meta';
import { meta as zippyImgMeta } from '@/routes/_tools/zippy-img/-meta';

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

export interface ToolDefinition {
  category: ToolCategory;
  description: string;
  icon: JSX.Element;
  mobileTitle?: string;
  pageTitle: string;
  showInMobile?: boolean;
  slug: string;
}

/**
 * Lightweight navigation configuration. Tool titles and descriptions come
 * from metadata owned by each tool route's -meta.ts sidecar. Keep route
 * components out of this module so navigation and marketing pages stay small.
 */
export const TOOL_DEFINITIONS: ReadonlyArray<ToolDefinition> = [
  {
    category: 'Links & Sharing',
    icon: <IconBrandWhatsapp />,
    mobileTitle: 'WA Link',
    showInMobile: true,
    ...waLinkHelperMeta,
  },
  {
    category: 'Design & Media',
    icon: <IconColorPalette />,
    mobileTitle: 'Color',
    showInMobile: true,
    ...colorConverterMeta,
  },
  {
    category: 'Text & Data',
    icon: <IconBrackets />,
    mobileTitle: 'JSON',
    showInMobile: true,
    ...jsonFormatterMeta,
  },
  {
    category: 'Text & Data',
    icon: <FileText />,
    ...yamlConverterMeta,
  },
  {
    category: 'Design & Media',
    icon: <IconCamera />,
    ...zippyImgMeta,
  },
  {
    category: 'Developer',
    icon: <IconDeviceDesktop />,
    ...uaCheckMeta,
  },
  {
    category: 'Developer',
    icon: <Link2 />,
    mobileTitle: 'URL Codec',
    showInMobile: true,
    ...urlCodecMeta,
  },
  {
    category: 'Links & Sharing',
    icon: <IconQrCode />,
    mobileTitle: 'QR Code',
    showInMobile: true,
    ...qrcodeMeta,
  },
  {
    category: 'Developer',
    icon: <IconCodeLines />,
    ...jsPerfMeta,
  },
  {
    category: 'Links & Sharing',
    icon: <IconCalendar />,
    ...addToCalendarMeta,
  },
  {
    category: 'Calculators',
    icon: <IconBolt />,
    ...evChargingMeta,
  },
  {
    category: 'Text & Data',
    icon: <Binary />,
    mobileTitle: 'Base64',
    ...base64Meta,
  },
  {
    category: 'Security',
    icon: <KeyRound />,
    mobileTitle: 'Password',
    ...passwordGeneratorMeta,
  },
  {
    category: 'Security',
    icon: <Fingerprint />,
    ...hashGeneratorMeta,
  },
  {
    category: 'Developer',
    icon: <ScanLine />,
    ...jwtDecoderMeta,
  },
  {
    category: 'Developer',
    icon: <Regex />,
    ...regexTesterMeta,
  },
  {
    category: 'Developer',
    icon: <Clock />,
    ...timestampConverterMeta,
  },
  {
    category: 'Developer',
    icon: <CaseSensitive />,
    ...caseConverterMeta,
  },
  {
    category: 'Developer',
    icon: <GitCompare />,
    mobileTitle: 'Diff',
    ...textDiffMeta,
  },
  {
    category: 'Developer',
    icon: <Dices />,
    ...uuidGeneratorMeta,
  },
  {
    category: 'Text & Data',
    icon: <Table2 />,
    mobileTitle: 'CSV',
    showInMobile: true,
    ...csvConverterMeta,
  },
  {
    category: 'Developer',
    icon: <Braces />,
    ...jsonToTsMeta,
  },
  {
    category: 'Developer',
    icon: <Clock />,
    ...cronParserMeta,
  },
  {
    category: 'Text & Data',
    icon: <FileText />,
    ...markdownPreviewMeta,
  },
  {
    category: 'Developer',
    icon: <Braces />,
    ...htmlEntitiesMeta,
  },
  {
    category: 'Developer',
    icon: <Braces />,
    ...sqlFormatterMeta,
  },
  {
    category: 'Developer',
    icon: <Binary />,
    ...numberBaseMeta,
  },
];
