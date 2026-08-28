'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import type { HashAlgorithm } from '@/lib/tools/hash-generator/adapters/hash-generator';
import { HASH_ALGORITHMS } from '@/lib/tools/hash-generator/adapters/hash-generator';

const ALGORITHM_OPTIONS = HASH_ALGORITHMS.map((a) => ({ id: a, label: a }));

export function HashAlgorithmSelect({
  algorithm,
  onChange,
}: {
  algorithm: HashAlgorithm;
  onChange: (a: HashAlgorithm) => void;
}) {
  return (
    <Select
      aria-label="Hash algorithm"
      onSelectionChange={(k) => onChange(k as HashAlgorithm)}
      selectedKey={algorithm}
    >
      <SelectTrigger />
      <SelectContent items={ALGORITHM_OPTIONS}>
        {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
      </SelectContent>
    </Select>
  );
}
