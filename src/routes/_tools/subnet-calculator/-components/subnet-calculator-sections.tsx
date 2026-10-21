'use client';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { CopyRow } from '@/lib/components/copy-row';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import type {
  SubnetCalcResult,
  SubnetInfo,
} from '@/lib/tools/subnet-calculator/adapters/subnet-calculator';

export function SubnetCalculatorInputs({
  input,
  onInput,
}: {
  input: string;
  onInput: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="subnet-calculator-input">Network (CIDR)</Label>
      <Input
        aria-label="IPv4 network in CIDR notation"
        autoComplete="off"
        id="subnet-calculator-input"
        onChange={(e) => onInput(e.target.value)}
        placeholder="e.g. 192.168.1.0/24"
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
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
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

export function SubnetCalculatorResult({
  copiedKey,
  onCopyPart,
  result,
}: {
  copiedKey: string | number | null;
  onCopyPart: (value: string, key: string, label: string) => void;
  result: SubnetCalcResult | null;
}) {
  if (!result) {
    return (
      <p className="text-muted-fg text-xs">
        Enter a network in CIDR notation to see the subnet breakdown.
      </p>
    );
  }
  const { info } = result;
  if (!info) {
    return <ToolError message={result.error} />;
  }
  return (
    <div className="flex flex-col gap-2">
      {info.note && <p className="text-muted-fg text-xs">{info.note}</p>}
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
            'CIDR notation pairs an IPv4 address with a prefix length: 192.168.1.0/24 means the first 24 bits are the network and the remaining 8 bits address 256 hosts (.0–.255). A plain address without /prefix is rejected — add the prefix so the tool never guesses.',
          question: 'What is CIDR notation?',
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
