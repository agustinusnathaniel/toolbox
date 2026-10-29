'use client';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { CopyRow } from '@/lib/components/copy-row';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { FieldLabel } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import type {
  SubnetCalcResult,
  SubnetInfo,
} from '@/lib/tools/subnet-calculator/adapters/subnet-calculator';
import type {
  SubnetCalcResultV6,
  SubnetInfoV6,
} from '@/lib/tools/subnet-calculator/adapters/subnet-calculator-v6';
import { ipv6ScopeLabel } from '@/lib/tools/subnet-calculator/adapters/subnet-calculator-v6';

export function SubnetCalculatorInputs({
  input,
  onInput,
}: {
  input: string;
  onInput: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor="subnet-calculator-input">Network (CIDR)</FieldLabel>
      <Input
        aria-label="Network in CIDR notation (IPv4 or IPv6)"
        autoComplete="off"
        id="subnet-calculator-input"
        onChange={(e) => onInput(e.target.value)}
        placeholder="e.g. 192.168.1.0/24 or 2001:db8::/32"
        spellCheck={false}
        value={input}
      />
    </div>
  );
}

export function SubnetCalculatorActions({
  onCopyLink,
}: {
  onCopyLink: () => void;
}) {
  return (
    <div>
      <CopyLinkButton label="Copy shareable link" onClick={onCopyLink} />
    </div>
  );
}

function AddressRows({
  copiedKey,
  info,
  onCopyPart,
}: {
  copiedKey: string | number | null;
  info: SubnetInfo;
  onCopyPart: (value: string, key: string, label: string) => void;
}) {
  return (
    <>
      <CopyRow
        copied={copiedKey === 'network'}
        copyLabel="Copy network address"
        label="Network"
        mono
        onCopy={() =>
          onCopyPart(info.network, 'network', 'Copied network address')
        }
        value={`${info.network}/${info.prefix}`}
      />
      <CopyRow
        copied={copiedKey === 'broadcast'}
        copyLabel="Copy broadcast address"
        label="Broadcast"
        mono
        onCopy={() =>
          onCopyPart(info.broadcast, 'broadcast', 'Copied broadcast address')
        }
        value={info.broadcast}
      />
      <CopyRow
        copied={copiedKey === 'range'}
        copyLabel="Copy usable range"
        label="Usable range"
        mono
        onCopy={() =>
          onCopyPart(
            info.firstUsable && info.lastUsable
              ? `${info.firstUsable} – ${info.lastUsable}`
              : 'n/a',
            'range',
            'Copied usable range'
          )
        }
        value={
          info.firstUsable && info.lastUsable
            ? `${info.firstUsable} – ${info.lastUsable}`
            : 'n/a'
        }
      />
      <CopyRow
        copied={copiedKey === 'hosts'}
        copyLabel="Copy usable host count"
        label="Usable hosts"
        mono
        onCopy={() =>
          onCopyPart(
            String(info.usableHosts),
            'hosts',
            'Copied usable host count'
          )
        }
        value={`${info.usableHosts.toLocaleString()} of ${info.totalAddresses.toLocaleString()}`}
      />
    </>
  );
}

function MaskRows({
  copiedKey,
  info,
  onCopyPart,
}: {
  copiedKey: string | number | null;
  info: SubnetInfo;
  onCopyPart: (value: string, key: string, label: string) => void;
}) {
  return (
    <>
      <CopyRow
        copied={copiedKey === 'mask'}
        copyLabel="Copy subnet mask"
        label="Subnet mask"
        mono
        onCopy={() => onCopyPart(info.subnetMask, 'mask', 'Copied subnet mask')}
        value={info.subnetMask}
      />
      <CopyRow
        copied={copiedKey === 'wildcard'}
        copyLabel="Copy wildcard mask"
        label="Wildcard mask"
        mono
        onCopy={() =>
          onCopyPart(info.wildcardMask, 'wildcard', 'Copied wildcard mask')
        }
        value={info.wildcardMask}
      />
      <CopyRow
        copied={copiedKey === 'binary'}
        copyLabel="Copy binary notation"
        label="IP / mask (binary)"
        mono
        onCopy={() =>
          onCopyPart(
            `${info.ipBinary} / ${info.maskBinary}`,
            'binary',
            'Copied binary notation'
          )
        }
        value={`${info.ipBinary} / ${info.maskBinary}`}
      />
      <CopyRow
        copied={copiedKey === 'class'}
        copyLabel="Copy class and scope"
        label="Class / scope"
        mono
        onCopy={() =>
          onCopyPart(
            `Class ${info.ipClass}, ${info.isPrivate ? 'private' : 'public'}`,
            'class',
            'Copied class and scope'
          )
        }
        value={`Class ${info.ipClass} · ${info.isPrivate ? 'Private (RFC 1918)' : 'Public'}`}
      />
    </>
  );
}

function formatBigInt(value: string): string {
  return BigInt(value).toLocaleString('en-US');
}

function SubnetV6Rows({
  copiedKey,
  info,
  onCopyPart,
}: {
  copiedKey: string | number | null;
  info: SubnetInfoV6;
  onCopyPart: (value: string, key: string, label: string) => void;
}) {
  const range =
    info.firstAddress === info.lastAddress
      ? info.firstAddress
      : `${info.firstAddress} – ${info.lastAddress}`;
  const typeAndScope = `${info.addressType} · ${ipv6ScopeLabel(info)}`;
  return (
    <>
      <CopyRow
        copied={copiedKey === 'network'}
        copyLabel="Copy network address"
        label="Network"
        mono
        onCopy={() =>
          onCopyPart(
            `${info.network}/${info.prefix}`,
            'network',
            'Copied network address'
          )
        }
        value={`${info.network}/${info.prefix}`}
      />
      <CopyRow
        copied={copiedKey === 'range'}
        copyLabel="Copy address range"
        label="Address range"
        mono
        onCopy={() => onCopyPart(range, 'range', 'Copied address range')}
        value={range}
      />
      <CopyRow
        copied={copiedKey === 'total'}
        copyLabel="Copy total address count"
        label="Total addresses"
        mono
        onCopy={() =>
          onCopyPart(info.totalAddresses, 'total', 'Copied total address count')
        }
        value={formatBigInt(info.totalAddresses)}
      />
      <CopyRow
        copied={copiedKey === 'expanded'}
        copyLabel="Copy expanded form"
        label="Expanded"
        mono
        onCopy={() =>
          onCopyPart(info.expanded, 'expanded', 'Copied expanded form')
        }
        value={info.expanded}
      />
      <CopyRow
        copied={copiedKey === 'type'}
        copyLabel="Copy address type and scope"
        label="Type / scope"
        mono
        onCopy={() =>
          onCopyPart(typeAndScope, 'type', 'Copied address type and scope')
        }
        value={typeAndScope}
      />
    </>
  );
}

export function SubnetCalculatorResult({
  copiedKey,
  onCopyPart,
  result,
}: {
  copiedKey: string | number | null;
  onCopyPart: (value: string, key: string, label: string) => void;
  result: SubnetCalcResult | SubnetCalcResultV6 | null;
}) {
  if (!result) {
    return (
      <p className="text-muted-foreground text-xs">
        Enter an IPv4 or IPv6 network in CIDR notation to see the subnet
        breakdown.
      </p>
    );
  }
  const { info } = result;
  if (!info) {
    return <ToolError message={result.error} />;
  }
  if ('addressType' in info) {
    return (
      <div className="flex flex-col gap-2">
        {info.note && (
          <p className="text-muted-foreground text-xs">{info.note}</p>
        )}
        <SubnetV6Rows
          copiedKey={copiedKey}
          info={info}
          onCopyPart={onCopyPart}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {info.note && (
        <p className="text-muted-foreground text-xs">{info.note}</p>
      )}
      <AddressRows copiedKey={copiedKey} info={info} onCopyPart={onCopyPart} />
      <MaskRows copiedKey={copiedKey} info={info} onCopyPart={onCopyPart} />
    </div>
  );
}

export function SubnetCalculatorHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'CIDR notation pairs an IP address with a prefix length: 192.168.1.0/24 means the first 24 bits are the network and the remaining 8 bits address 256 hosts (.0–.255). IPv6 works the same way with 128-bit addresses — 2001:db8::/32 fixes the first 32 bits. A plain address without /prefix is rejected — add the prefix so the tool never guesses.',
          question: 'What is CIDR notation?',
        },
        {
          answer:
            'IPv6 has no broadcast addresses and no classes, so the breakdown shows the network, the full address range, and the address type (global unicast, unique local, link-local, multicast, …) instead. Scope follows the standard prefixes: fc00::/7 is private unique-local space, fe80::/10 is link-local, ff00::/8 is multicast.',
          question: 'What changes for IPv6?',
        },
        {
          answer:
            'The network address identifies the subnet and the broadcast address reaches every host in it — neither is assignable to a device. The usable range runs from network + 1 to broadcast − 1. Two edge cases break this math: a /32 is a single host, and a /31 is a point-to-point link (RFC 3021) where both addresses belong to the two endpoints.',
          question: 'Why are network and broadcast excluded?',
        },
        {
          answer:
            'Yes. Subnet math is plain integer arithmetic that runs locally in your browser. No data ever leaves your device.',
          question: 'Is my data safe?',
        },
      ]}
    />
  );
}
