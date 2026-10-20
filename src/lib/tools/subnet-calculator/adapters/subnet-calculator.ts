export type IpClass = 'A' | 'B' | 'C' | 'D' | 'E';

export interface SubnetInfo {
  broadcast: string;
  firstUsable: string | null;
  ipAddress: string;
  ipBinary: string;
  ipClass: IpClass;
  isPrivate: boolean;
  lastUsable: string | null;
  maskBinary: string;
  network: string;
  /** Present for /31 and /32, where the classic usable-range math breaks down. */
  note?: string;
  prefix: number;
  subnetMask: string;
  totalAddresses: number;
  usableHosts: number;
  wildcardMask: string;
}

export interface SubnetCalcResult {
  error?: string;
  info: SubnetInfo | null;
  isValid: boolean;
}

const OCTET_PATTERN = /^\d{1,3}$/;
const PREFIX_PATTERN = /^\d{1,2}$/;
const BARE_IPV4_PATTERN = /^\d+\.\d+\.\d+\.\d+$/;

const OCTET_VALUES = 256;
const IPV4_BITS = 32;

function octetAt(addr: number, shift: number): number {
  return Math.floor(addr / OCTET_VALUES ** shift) % OCTET_VALUES;
}

function toDotted(addr: number): string {
  return [3, 2, 1, 0].map((shift) => String(octetAt(addr, shift))).join('.');
}

function toBinary(addr: number): string {
  return [3, 2, 1, 0]
    .map((shift) => octetAt(addr, shift).toString(2).padStart(8, '0'))
    .join('.');
}

function parseOctets(part: string): number | null {
  const pieces = part.split('.');
  if (pieces.length !== 4) {
    return null;
  }
  let addr = 0;
  for (const piece of pieces) {
    if (!OCTET_PATTERN.test(piece)) {
      return null;
    }
    const octet = Number(piece);
    if (octet > 255) {
      return null;
    }
    addr = addr * OCTET_VALUES + octet;
  }
  return addr;
}

function classOf(firstOctet: number): IpClass {
  if (firstOctet < 128) {
    return 'A';
  }
  if (firstOctet < 192) {
    return 'B';
  }
  if (firstOctet < 224) {
    return 'C';
  }
  if (firstOctet < 240) {
    return 'D';
  }
  return 'E';
}

function isRfc1918Private(addr: number): boolean {
  const first = octetAt(addr, 3);
  const second = octetAt(addr, 2);
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

interface ParsedCidr {
  error?: string;
  ip: number | null;
  prefix: number | null;
}

function parseCidr(raw: string): ParsedCidr {
  const slash = raw.indexOf('/');
  if (slash === -1) {
    if (BARE_IPV4_PATTERN.test(raw)) {
      return {
        error:
          'Add a prefix length to the address, e.g. 192.168.1.0/24 (0-32).',
        ip: null,
        prefix: null,
      };
    }
    return {
      error: 'Enter an IPv4 network in CIDR notation, e.g. 192.168.1.0/24.',
      ip: null,
      prefix: null,
    };
  }
  const ip = parseOctets(raw.slice(0, slash).trim());
  const prefixPart = raw.slice(slash + 1).trim();
  if (ip === null) {
    const ipPart = raw.slice(0, slash).trim();
    return {
      error: `"${ipPart}" is not a valid IPv4 address (four octets, 0-255 each).`,
      ip: null,
      prefix: null,
    };
  }
  if (!PREFIX_PATTERN.test(prefixPart) || Number(prefixPart) > IPV4_BITS) {
    return {
      error: `"${prefixPart}" is not a valid prefix length (0-32).`,
      ip: null,
      prefix: null,
    };
  }
  return { ip, prefix: Number(prefixPart) };
}

/**
 * Calculates subnet details for an IPv4 CIDR input (`192.168.1.0/24`).
 * A bare address without a prefix is rejected with a hint instead of
 * guessing a default. Plain integer arithmetic (all values stay below
 * 2^32, exactly representable) — safe to run synchronously on the UI
 * thread.
 */
export function calculateSubnet(input: string): SubnetCalcResult {
  const raw = input.trim();
  if (!raw) {
    return {
      error: 'Enter an IPv4 network in CIDR notation, e.g. 192.168.1.0/24.',
      info: null,
      isValid: false,
    };
  }
  const parsed = parseCidr(raw);
  if (parsed.ip === null || parsed.prefix === null) {
    return {
      error: parsed.error ?? 'Enter an IPv4 network in CIDR notation.',
      info: null,
      isValid: false,
    };
  }
  const { ip, prefix } = parsed;

  const totalAddresses = 2 ** (IPV4_BITS - prefix);
  const mask = 2 ** IPV4_BITS - totalAddresses;
  const network = ip - (ip % totalAddresses);
  const broadcast = network + totalAddresses - 1;

  let firstUsable: string | null = toDotted(network + 1);
  let lastUsable: string | null = toDotted(broadcast - 1);
  let usableHosts = totalAddresses - 2;
  let note: string | undefined;
  if (prefix === 32) {
    firstUsable = null;
    lastUsable = null;
    usableHosts = 1;
    note =
      'A /32 is a single host address — network and broadcast are the address itself.';
  } else if (prefix === 31) {
    firstUsable = null;
    lastUsable = null;
    usableHosts = 0;
    note =
      'A /31 has no classic host range (RFC 3021 point-to-point link — both addresses are usable by the two endpoints).';
  }

  return {
    info: {
      broadcast: toDotted(broadcast),
      firstUsable,
      ipAddress: toDotted(ip),
      ipBinary: toBinary(ip),
      ipClass: classOf(octetAt(ip, 3)),
      isPrivate: isRfc1918Private(ip),
      lastUsable,
      maskBinary: toBinary(mask),
      network: toDotted(network),
      note,
      prefix,
      subnetMask: toDotted(mask),
      totalAddresses,
      usableHosts,
      wildcardMask: toDotted(totalAddresses - 1),
    },
    isValid: true,
  };
}
