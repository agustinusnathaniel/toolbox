const HEXTET_PATTERN = /^[0-9a-fA-F]{1,4}$/;
const OCTET_PART_PATTERN = /^\d{1,3}$/;
const PREFIX_V6_PATTERN = /^\d{1,3}$/;

const GROUP_BITS = 16;
const GROUP_COUNT = 8;
const GROUP_BASE = 65_536;
const IPV6_BITS = 128;

export interface SubnetInfoV6 {
  addressType: string;
  expanded: string;
  firstAddress: string;
  ipAddress: string;
  isPrivate: boolean;
  lastAddress: string;
  network: string;
  /** Present for /128 and /127, where the classic usable-range math breaks down. */
  note?: string;
  prefix: number;
  /** Decimal string — 2^(128-prefix) overflows every JS number type. */
  totalAddresses: string;
}

export interface SubnetCalcResultV6 {
  error?: string;
  info: SubnetInfoV6 | null;
  isValid: boolean;
}

function parseEmbeddedIpv4(piece: string): Array<bigint> | null {
  // Embedded IPv4 tail (`::ffff:192.168.1.1`) — four octets, two hextets.
  const octets = piece.split('.');
  if (octets.length !== 4) {
    return null;
  }
  const bytes: Array<number> = [];
  for (const octet of octets) {
    if (!OCTET_PART_PATTERN.test(octet)) {
      return null;
    }
    const value = Number(octet);
    if (value > 255) {
      return null;
    }
    bytes.push(value);
  }
  return [BigInt(bytes[0] * 256 + bytes[1]), BigInt(bytes[2] * 256 + bytes[3])];
}

function parseGroup(part: string): Array<bigint> | null {
  if (part === '') {
    return [];
  }
  const out: Array<bigint> = [];
  for (const piece of part.split(':')) {
    if (piece.includes('.')) {
      const embedded = parseEmbeddedIpv4(piece);
      if (embedded === null) {
        return null;
      }
      out.push(...embedded);
    } else {
      if (!HEXTET_PATTERN.test(piece)) {
        return null;
      }
      out.push(BigInt(`0x${piece}`));
    }
  }
  return out;
}

function parseIpv6Address(input: string): bigint | null {
  const halves = input.split('::');
  if (halves.length > 2) {
    return null;
  }
  const head = parseGroup(halves[0]);
  const tail = halves.length === 2 ? parseGroup(halves[1]) : [];
  if (head === null || tail === null) {
    return null;
  }
  if (halves.length === 1) {
    if (head.length !== GROUP_COUNT) {
      return null;
    }
    return combine(head);
  }
  // `::` must actually compress at least one group.
  if (head.length + tail.length >= GROUP_COUNT) {
    return null;
  }
  const zeros = new Array<bigint>(GROUP_COUNT - head.length - tail.length).fill(
    0n
  );
  return combine([...head, ...zeros, ...tail]);
}

function combine(groups: Array<bigint>): bigint {
  let addr = 0n;
  for (const group of groups) {
    addr = addr * BigInt(GROUP_BASE) + group;
  }
  return addr;
}

function toGroups(addr: bigint): Array<number> {
  const groups: Array<number> = [];
  for (let shift = GROUP_COUNT - 1; shift >= 0; shift--) {
    const divisor = 2n ** BigInt(shift * GROUP_BITS);
    groups.push(Number((addr / divisor) % BigInt(GROUP_BASE)));
  }
  return groups;
}

/** Compress per RFC 5952: longest zero run becomes `::` (minimum two groups). */
export function compressIpv6(addr: bigint): string {
  const groups = toGroups(addr);
  let bestStart = -1;
  let bestLen = 0;
  let runStart = -1;
  let runLen = 0;
  for (let i = 0; i <= groups.length; i++) {
    if (i < groups.length && groups[i] === 0) {
      if (runStart === -1) {
        runStart = i;
        runLen = 1;
      } else {
        runLen++;
      }
    } else {
      if (runLen > bestLen) {
        bestStart = runStart;
        bestLen = runLen;
      }
      runStart = -1;
      runLen = 0;
    }
  }
  const hex = groups.map((g) => g.toString(16));
  if (bestLen < 2) {
    return hex.join(':');
  }
  const left = hex.slice(0, bestStart).join(':');
  const right = hex.slice(bestStart + bestLen).join(':');
  if (left === '') {
    return `::${right}`;
  }
  if (right === '') {
    return `${left}::`;
  }
  return `${left}::${right}`;
}

function expandIpv6(addr: bigint): string {
  return toGroups(addr)
    .map((g) => g.toString(16).padStart(4, '0'))
    .join(':');
}

/** First `prefix` bits of the address as an integer — scope checks. */
function prefixValue(addr: bigint, prefix: number): bigint {
  return addr / 2n ** BigInt(IPV6_BITS - prefix);
}

function addressTypeOf(addr: bigint): string {
  if (addr === 0n) {
    return 'Unspecified';
  }
  if (addr === 1n) {
    return 'Loopback';
  }
  if (prefixValue(addr, 8) === 0xffn) {
    return 'Multicast (ff00::/8)';
  }
  if (prefixValue(addr, 10) === 0x3fan) {
    return 'Link-Local (fe80::/10)';
  }
  if (prefixValue(addr, 7) === 0x7en) {
    return 'Unique Local (fc00::/7)';
  }
  if (prefixValue(addr, 32) === 0x20010db8n) {
    return 'Documentation (2001:db8::/32)';
  }
  return 'Global Unicast';
}

/**
 * Calculates subnet details for an IPv6 CIDR input (`2001:db8::/32`).
 * 128-bit math needs BigInt — plain numbers overflow past 2^53.
 * IPv6 has no broadcast address and no classes: the range runs from the
 * network address through the last address, and scope is reported as the
 * address type instead.
 */
export function calculateSubnetV6(input: string): SubnetCalcResultV6 {
  const raw = input.trim();
  if (!raw) {
    return {
      error: 'Enter an IPv6 network in CIDR notation, e.g. 2001:db8::/32.',
      info: null,
      isValid: false,
    };
  }
  const slash = raw.indexOf('/');
  if (slash === -1) {
    return {
      error: raw.includes(':')
        ? 'Add a prefix length to the address, e.g. 2001:db8::/32 (0-128).'
        : 'Enter an IPv6 network in CIDR notation, e.g. 2001:db8::/32.',
      info: null,
      isValid: false,
    };
  }
  const addrPart = raw.slice(0, slash).trim();
  const prefixPart = raw.slice(slash + 1).trim();
  const addr = parseIpv6Address(addrPart);
  if (addr === null) {
    return {
      error: `"${addrPart}" is not a valid IPv6 address (eight hextets, "::" may appear once).`,
      info: null,
      isValid: false,
    };
  }
  if (!PREFIX_V6_PATTERN.test(prefixPart) || Number(prefixPart) > IPV6_BITS) {
    return {
      error: `"${prefixPart}" is not a valid prefix length (0-128).`,
      info: null,
      isValid: false,
    };
  }
  const prefix = Number(prefixPart);

  const total = 2n ** BigInt(IPV6_BITS - prefix);
  const network = addr - (addr % total);
  const last = network + total - 1n;

  let note: string | undefined;
  if (prefix === 128) {
    note =
      'A /128 is a single host address — network and last address are the address itself.';
  } else if (prefix === 127) {
    note =
      'A /127 has no classic host range (RFC 6164 point-to-point link — both addresses belong to the two endpoints).';
  }

  return {
    info: {
      addressType: addressTypeOf(addr),
      expanded: expandIpv6(addr),
      firstAddress: compressIpv6(network),
      ipAddress: compressIpv6(addr),
      isPrivate: prefixValue(addr, 7) === 0x7en,
      lastAddress: compressIpv6(last),
      network: compressIpv6(network),
      note,
      prefix,
      totalAddresses: total.toString(),
    },
    isValid: true,
  };
}
