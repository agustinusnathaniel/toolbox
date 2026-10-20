import { describe, expect, test } from 'vite-plus/test';

import { calculateSubnet } from './subnet-calculator';

const PREFIX_HINT_PATTERN = /prefix/i;

describe('calculateSubnet valid inputs', () => {
  test('computes canonical /24 values', () => {
    const result = calculateSubnet('192.168.1.0/24');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('192.168.1.0');
    expect(result.info?.broadcast).toBe('192.168.1.255');
    expect(result.info?.subnetMask).toBe('255.255.255.0');
    expect(result.info?.wildcardMask).toBe('0.0.0.255');
    expect(result.info?.firstUsable).toBe('192.168.1.1');
    expect(result.info?.lastUsable).toBe('192.168.1.254');
    expect(result.info?.totalAddresses).toBe(256);
    expect(result.info?.usableHosts).toBe(254);
    expect(result.info?.ipClass).toBe('C');
    expect(result.info?.isPrivate).toBe(true);
  });

  test('derives the network from a host address inside the range', () => {
    const result = calculateSubnet('192.168.1.130/24');

    expect(result.isValid).toBe(true);
    expect(result.info?.ipAddress).toBe('192.168.1.130');
    expect(result.info?.network).toBe('192.168.1.0');
    expect(result.info?.broadcast).toBe('192.168.1.255');
  });

  test('computes /8 values for class A', () => {
    const result = calculateSubnet('10.0.0.0/8');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('10.0.0.0');
    expect(result.info?.broadcast).toBe('10.255.255.255');
    expect(result.info?.subnetMask).toBe('255.0.0.0');
    expect(result.info?.totalAddresses).toBe(16_777_216);
    expect(result.info?.usableHosts).toBe(16_777_214);
    expect(result.info?.ipClass).toBe('A');
    expect(result.info?.isPrivate).toBe(true);
  });

  test('marks public class B addresses correctly', () => {
    const result = calculateSubnet('172.32.0.1/16');

    expect(result.isValid).toBe(true);
    expect(result.info?.ipClass).toBe('B');
    expect(result.info?.isPrivate).toBe(false);
  });

  test('marks 172.16/12 as private and 172.32/16 as public', () => {
    expect(calculateSubnet('172.16.5.4/12').info?.isPrivate).toBe(true);
    expect(calculateSubnet('172.31.255.255/12').info?.isPrivate).toBe(true);
    expect(calculateSubnet('8.8.8.8/24').info?.isPrivate).toBe(false);
  });
});

describe('calculateSubnet edge prefixes and notation', () => {
  test('handles /32 as a single host', () => {
    const result = calculateSubnet('203.0.113.7/32');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('203.0.113.7');
    expect(result.info?.broadcast).toBe('203.0.113.7');
    expect(result.info?.firstUsable).toBeNull();
    expect(result.info?.lastUsable).toBeNull();
    expect(result.info?.totalAddresses).toBe(1);
    expect(result.info?.usableHosts).toBe(1);
    expect(typeof result.info?.note).toBe('string');
  });

  test('handles /31 as a point-to-point link with no classic range', () => {
    const result = calculateSubnet('192.168.0.0/31');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('192.168.0.0');
    expect(result.info?.broadcast).toBe('192.168.0.1');
    expect(result.info?.firstUsable).toBeNull();
    expect(result.info?.lastUsable).toBeNull();
    expect(result.info?.totalAddresses).toBe(2);
    expect(result.info?.usableHosts).toBe(0);
    expect(typeof result.info?.note).toBe('string');
  });

  test('renders binary notation for IP and mask', () => {
    const result = calculateSubnet('192.168.1.0/24');

    expect(result.info?.ipBinary).toBe('11000000.10101000.00000001.00000000');
    expect(result.info?.maskBinary).toBe('11111111.11111111.11111111.00000000');
  });

  test('classifies class D and E ranges', () => {
    expect(calculateSubnet('224.0.0.1/24').info?.ipClass).toBe('D');
    expect(calculateSubnet('240.0.0.1/24').info?.ipClass).toBe('E');
  });

  test('tolerates whitespace around the slash', () => {
    const result = calculateSubnet('  10.1.2.3 / 8  ');

    expect(result.isValid).toBe(true);
    expect(result.info?.network).toBe('10.0.0.0');
  });
});

describe('calculateSubnet invalid inputs', () => {
  test('rejects a bare address with a prefix hint', () => {
    const result = calculateSubnet('192.168.1.10');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
    expect(result.error).toMatch(PREFIX_HINT_PATTERN);
  });

  test('rejects octets out of range', () => {
    const result = calculateSubnet('192.168.1.999/24');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
    expect(typeof result.error).toBe('string');
  });

  test('rejects a prefix above 32', () => {
    const result = calculateSubnet('192.168.1.0/33');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
  });

  test('rejects garbage input', () => {
    const result = calculateSubnet('not-an-ip');

    expect(result.isValid).toBe(false);
    expect(result.info).toBeNull();
    expect(typeof result.error).toBe('string');
  });
});
