'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
      onValueChange={(value) => onChange(value as HashAlgorithm)}
      value={algorithm}
    >
      <SelectTrigger aria-label="Hash algorithm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ALGORITHM_OPTIONS.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
