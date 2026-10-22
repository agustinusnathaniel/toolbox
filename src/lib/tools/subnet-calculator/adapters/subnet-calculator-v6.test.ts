import { describe, expect, test } from 'vite-plus/test';

import {
  calculateSubnetV6,
  compressIpv6,
  ipv6ScopeLabel,
} from './subnet-calculator-v6';

const PREFIX_HINT_PATTERN = /prefix/i;
const IPV6_HINT_PATTERN = /ipv6/i;

describe('calculateSubnetV6 valid inputs', () => {
  test('computes canonical documentation /32 values', () => {
    const result = calculateSubnetV6('2001:db8::/32');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('2001:db8::');
    expect(result.info?.firstAddress).toBe('2001:db8::');
    expect(result.info?.lastAddress).toBe(
      '2001:db8:ffff:ffff:ffff:ffff:ffff:ffff'
    );
    expect(result.info?.totalAddresses).toBe('79228162514264337593543950336');
    expect(result.info?.prefix).toBe(32);
    expect(result.info?.addressType).toBe('Documentation (2001:db8::/32)');
    expect(result.info?.isPrivate).toBe(false);
  });

  test('derives the network from a host address inside the range', () => {
    const result = calculateSubnetV6('2001:db8:abcd:12::ff/64');

    expect(result.isValid).toBe(true);
    expect(result.info?.ipAddress).toBe('2001:db8:abcd:12::ff');
    expect(result.info?.network).toBe('2001:db8:abcd:12::');
    expect(result.info?.lastAddress).toBe(
      '2001:db8:abcd:12:ffff:ffff:ffff:ffff'
    );
    expect(result.info?.totalAddresses).toBe('18446744073709551616');
  });

  test('handles the full /0 space as a BigInt decimal string', () => {
    const result = calculateSubnetV6('::/0');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('::');
    expect(result.info?.totalAddresses).toBe(
      '340282366920938463463374607431768211456'
    );
    expect(result.info?.addressType).toBe('Unspecified');
  });

  test('marks global unicast as public', () => {
    const result = calculateSubnetV6('2606:4700:4700::1111/128');

    expect(result.isValid).toBe(true);
    expect(result.info?.addressType).toBe('Global Unicast');
    expect(result.info?.isPrivate).toBe(false);
  });
});

describe('calculateSubnetV6 address types', () => {
  test('classifies loopback', () => {
    expect(calculateSubnetV6('::1/128').info?.addressType).toBe('Loopback');
  });

  test('classifies link-local and derives its network', () => {
    const result = calculateSubnetV6('fe80::1/10');

    expect(result.info?.addressType).toBe('Link-Local (fe80::/10)');
    expect(result.info?.network).toBe('fe80::');
  });

  test('marks unique-local as private', () => {
    const result = calculateSubnetV6('fc00::/7');

    expect(result.info?.addressType).toBe('Unique Local (fc00::/7)');
    expect(result.info?.isPrivate).toBe(true);
  });

  test('classifies multicast and derives its network', () => {
    const result = calculateSubnetV6('ff02::1/8');

    expect(result.info?.addressType).toBe('Multicast (ff00::/8)');
    expect(result.info?.network).toBe('ff00::');
  });

  test('expands leading zeros and compresses the longest zero run', () => {
    const result = calculateSubnetV6(
      '2001:0db8:0000:0000:0000:ff00:0042:8329/64'
    );

    expect(result.isValid).toBe(true);
    expect(result.info?.ipAddress).toBe('2001:db8::ff00:42:8329');
    expect(result.info?.expanded).toBe(
      '2001:0db8:0000:0000:0000:ff00:0042:8329'
    );
  });

  test('accepts uppercase hextets and lowercases them', () => {
    const result = calculateSubnetV6('2001:DB8::/32');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('2001:db8::');
  });

  test('accepts an embedded IPv4 tail', () => {
    const result = calculateSubnetV6('::ffff:192.168.1.1/128');

    expect(result.isValid).toBe(true);
    expect(result.info?.ipAddress).toBe('::ffff:c0a8:101');
  });

  test('tolerates whitespace around the slash', () => {
    const result = calculateSubnetV6('  2001:db8:: / 32  ');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('2001:db8::');
  });
});

describe('calculateSubnetV6 edge prefixes', () => {
  test('handles /128 as a single host', () => {
    const result = calculateSubnetV6('::1/128');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('::1');
    expect(result.info?.firstAddress).toBe('::1');
    expect(result.info?.lastAddress).toBe('::1');
    expect(result.info?.totalAddresses).toBe('1');
    expect(typeof result.info?.note).toBe('string');
  });

  test('handles /127 as a point-to-point link', () => {
    const result = calculateSubnetV6('2001:db8::/127');

    expect(result.isValid).toBe(true);
    expect(result.info?.totalAddresses).toBe('2');
    expect(typeof result.info?.note).toBe('string');
  });
});

describe('compressIpv6', () => {
  test('compresses only the longest zero run', () => {
    expect(compressIpv6(0x20010db8000100000000000000000001n)).toBe(
      '2001:db8:1::1'
    );
  });

  test('leaves a lone zero group uncompressed', () => {
    expect(compressIpv6(0x20010db8000100020003000400050000n)).toBe(
      '2001:db8:1:2:3:4:5:0'
    );
  });

  test('compresses the full zero address to ::', () => {
    expect(compressIpv6(0n)).toBe('::');
  });
});

describe('calculateSubnetV6 invalid inputs', () => {
  test('rejects a bare address with a prefix hint', () => {
    const result = calculateSubnetV6('2001:db8::1');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
    expect(result.error).toMatch(PREFIX_HINT_PATTERN);
  });

  test('rejects a prefix above 128', () => {
    const result = calculateSubnetV6('2001:db8::/129');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
  });

  test('rejects a second :: separator', () => {
    const result = calculateSubnetV6('2001::db8::1/64');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
  });

  test('rejects a triple colon', () => {
    const result = calculateSubnetV6('2001:::1/64');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
  });

  test('rejects more than eight groups', () => {
    const result = calculateSubnetV6('1:2:3:4:5:6:7:8:9/64');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
  });

  test('rejects non-hex groups', () => {
    const result = calculateSubnetV6('2001:db8::gggg/64');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
    expect(result.error).toMatch(IPV6_HINT_PATTERN);
  });

  test('rejects garbage input', () => {
    const result = calculateSubnetV6('not-an-ip');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
    expect(typeof result.error).toBe('string');
  });

  test('rejects embedded IPv4 outside the final 32 bits', () => {
    const result = calculateSubnetV6('1:2:3:4:5:192.168.1.1:7/64');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
  });

  test('rejects embedded IPv4 in the head when compressing', () => {
    const result = calculateSubnetV6('192.168.1.1::5/64');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
  });
});

describe('ipv6ScopeLabel', () => {
  test('marks unique-local space as private', () => {
    const result = calculateSubnetV6('fc00::/7');

    expect(result.isValid).toBe(true);
    expect(result.info && ipv6ScopeLabel(result.info)).toBe('Private');
  });

  test('marks global unicast as public', () => {
    const result = calculateSubnetV6('2606:4700:4700::1111/128');

    expect(result.isValid).toBe(true);
    expect(result.info && ipv6ScopeLabel(result.info)).toBe('Public');
  });

  test('marks reserved ranges as special-use, not public', () => {
    for (const input of ['::1/128', 'fe80::1/10', 'ff02::1/8']) {
      const result = calculateSubnetV6(input);

      expect(result.isValid).toBe(true);
      expect(result.info && ipv6ScopeLabel(result.info)).toBe('Special-use');
    }
  });
});
