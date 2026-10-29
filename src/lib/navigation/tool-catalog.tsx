import {
  RiBracketsLine,
  RiCalendarLine,
  RiCameraLine,
  RiCodeLine,
  RiComputerLine,
  RiFlashlightLine,
  RiPaletteLine,
  RiQrCodeLine,
  RiWhatsappLine,
} from '@remixicon/react';
import {
  Binary,
  Braces,
  CaseSensitive,
  Clock,
  Coins,
  Dices,
  FileText,
  Fingerprint,
  GitCompare,
  KeyRound,
  Languages,
  Link2,
  ListChecks,
  Network,
  Regex,
  Scale,
  ScanLine,
  Search,
  Table2,
} from 'lucide-react';
import type { JSX } from 'react';

import { meta as addToCalendarMeta } from '@/routes/_tools/add-to-calendar/-meta';
import { meta as base64Meta } from '@/routes/_tools/base64/-meta';
import { meta as caseConverterMeta } from '@/routes/_tools/case-converter/-meta';
import { meta as colorConverterMeta } from '@/routes/_tools/color-converter/-meta';
import { meta as cronParserMeta } from '@/routes/_tools/cron-parser/-meta';
import { meta as csvConverterMeta } from '@/routes/_tools/csv-converter/-meta';
import { meta as currencyConverterMeta } from '@/routes/_tools/currency-converter/-meta';
import { meta as evChargingMeta } from '@/routes/_tools/ev-charging/-meta';
import { meta as hashGeneratorMeta } from '@/routes/_tools/hash-generator/-meta';
import { meta as htmlEntitiesMeta } from '@/routes/_tools/html-entities/-meta';
import { meta as jsPerfMeta } from '@/routes/_tools/js-perf/-meta';
import { meta as jsonFormatterMeta } from '@/routes/_tools/json-formatter/-meta';
import { meta as jsonSchemaValidatorMeta } from '@/routes/_tools/json-schema-validator/-meta';
import { meta as jsonToTsMeta } from '@/routes/_tools/json-to-ts/-meta';
import { meta as jwtDecoderMeta } from '@/routes/_tools/jwt-decoder/-meta';
import { meta as loremIpsumMeta } from '@/routes/_tools/lorem-ipsum/-meta';
import { meta as markdownPreviewMeta } from '@/routes/_tools/markdown-preview/-meta';
import { meta as meetingTimeFinderMeta } from '@/routes/_tools/meeting-time-finder/-meta';
import { meta as numberBaseMeta } from '@/routes/_tools/number-base/-meta';
import { meta as passwordGeneratorMeta } from '@/routes/_tools/password-generator/-meta';
import { meta as qrcodeMeta } from '@/routes/_tools/qrcode/-meta';
import { meta as regexTesterMeta } from '@/routes/_tools/regex-tester/-meta';
import { meta as sqlFormatterMeta } from '@/routes/_tools/sql-formatter/-meta';
import { meta as subnetCalculatorMeta } from '@/routes/_tools/subnet-calculator/-meta';
import { meta as textDiffMeta } from '@/routes/_tools/text-diff/-meta';
import { meta as textStatsMeta } from '@/routes/_tools/text-stats/-meta';
import { meta as timestampConverterMeta } from '@/routes/_tools/timestamp-converter/-meta';
import { meta as uaCheckMeta } from '@/routes/_tools/ua-check/-meta';
import { meta as unicodeInspectorMeta } from '@/routes/_tools/unicode-inspector/-meta';
import { meta as unitConverterMeta } from '@/routes/_tools/unit-converter/-meta';
import { meta as urlCodecMeta } from '@/routes/_tools/url-codec/-meta';
import { meta as urlInspectorMeta } from '@/routes/_tools/url-inspector/-meta';
import { meta as uuidGeneratorMeta } from '@/routes/_tools/uuid-generator/-meta';
import { meta as waLinkHelperMeta } from '@/routes/_tools/wa-link-helper/-meta';
import { meta as xmlFormatterMeta } from '@/routes/_tools/xml-formatter/-meta';
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
  /**
   * Rank within the mobile bottom bar, 1 = leftmost. Only meaningful when
   * showInMobile is set. Lower sorts first; ties fall back to catalog order.
   * Selection is by rank, never by array position, so reordering the catalog
   * for the homepage grid cannot silently change the phone's menu.
   */
  mobilePriority?: number;
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
    icon: <RiWhatsappLine />,
    mobilePriority: 1,
    mobileTitle: 'WA Link',
    showInMobile: true,
    ...waLinkHelperMeta,
  },
  {
    category: 'Design & Media',
    icon: <RiPaletteLine />,
    mobilePriority: 5,
    mobileTitle: 'Color',
    showInMobile: true,
    ...colorConverterMeta,
  },
  {
    category: 'Text & Data',
    icon: <RiBracketsLine />,
    mobilePriority: 3,
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
    icon: <RiCameraLine />,
    ...zippyImgMeta,
  },
  {
    category: 'Developer',
    icon: <RiComputerLine />,
    ...uaCheckMeta,
  },
  {
    category: 'Developer',
    icon: <Link2 />,
    mobilePriority: 4,
    mobileTitle: 'URL',
    showInMobile: true,
    ...urlCodecMeta,
  },
  {
    category: 'Developer',
    icon: <Search />,
    ...urlInspectorMeta,
  },
  {
    category: 'Links & Sharing',
    icon: <RiQrCodeLine />,
    mobilePriority: 2,
    mobileTitle: 'QR Code',
    showInMobile: true,
    ...qrcodeMeta,
  },
  {
    category: 'Developer',
    icon: <RiCodeLine />,
    ...jsPerfMeta,
  },
  {
    category: 'Links & Sharing',
    icon: <RiCalendarLine />,
    ...addToCalendarMeta,
  },
  {
    category: 'Calculators',
    icon: <Clock />,
    ...meetingTimeFinderMeta,
  },
  {
    category: 'Calculators',
    icon: <RiFlashlightLine />,
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
    category: 'Text & Data',
    icon: <Languages />,
    ...unicodeInspectorMeta,
  },
  {
    category: 'Developer',
    icon: <Dices />,
    ...uuidGeneratorMeta,
  },
  {
    category: 'Text & Data',
    icon: <Table2 />,
    mobilePriority: 6,
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
    icon: <Network />,
    ...subnetCalculatorMeta,
  },
  {
    category: 'Developer',
    icon: <Braces />,
    ...xmlFormatterMeta,
  },
  {
    category: 'Developer',
    icon: <ListChecks />,
    ...jsonSchemaValidatorMeta,
  },
  {
    category: 'Developer',
    icon: <Binary />,
    ...numberBaseMeta,
  },
  {
    category: 'Text & Data',
    icon: <FileText />,
    ...textStatsMeta,
  },
  {
    category: 'Calculators',
    icon: <Scale />,
    ...unitConverterMeta,
  },
  {
    category: 'Calculators',
    icon: <Coins />,
    ...currencyConverterMeta,
  },
  {
    category: 'Text & Data',
    icon: <FileText />,
    ...loremIpsumMeta,
  },
];
