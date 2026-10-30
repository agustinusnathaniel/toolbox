import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import { octalToBits } from '@/lib/tools/chmod-calculator/adapters/chmod-calculator';

import {
  ChmodExamples,
  ChmodHelp,
  ChmodOctalInput,
  ChmodOutput,
  ChmodPermissionGrid,
  ChmodSpecialBits,
  ChmodSymbolicInput,
} from './chmod-calculator-sections';

afterEach(() => {
  cleanup();
});

const EXECUTABLE_SCRIPT_BUTTON = /Executable script/;
const FAQ_SECTION = /FAQ/;
const FOURTH_DIGIT_QUESTION = /fourth digit/;
const SHARED_DIRECTORY_BUTTON = /Shared directory/;

describe('ChmodPermissionGrid', () => {
  test('renders owner/group/other rows with read/write/execute checkboxes', () => {
    const bits = octalToBits('755') ?? {
      group: { execute: false, read: false, write: false },
      other: { execute: false, read: false, write: false },
      owner: { execute: false, read: false, write: false },
      setgid: false,
      setuid: false,
      sticky: false,
    };
    render(<ChmodPermissionGrid bits={bits} onTogglePermission={vi.fn()} />);
    expect(screen.getByText('Owner')).toBeDefined();
    expect(screen.getByText('Group')).toBeDefined();
    expect(screen.getByText('Other')).toBeDefined();
    expect(screen.getByRole('checkbox', { name: 'Owner Read' })).toBeDefined();
    expect(
      screen.getByRole('checkbox', { name: 'Other Execute' })
    ).toBeDefined();
  });
});

describe('ChmodSpecialBits', () => {
  test('renders setuid, setgid, and sticky toggles', () => {
    const bits = octalToBits('644') ?? {
      group: { execute: false, read: false, write: false },
      other: { execute: false, read: false, write: false },
      owner: { execute: false, read: false, write: false },
      setgid: false,
      setuid: false,
      sticky: false,
    };
    render(<ChmodSpecialBits bits={bits} onToggleSpecial={vi.fn()} />);
    expect(screen.getByText('Setuid')).toBeDefined();
    expect(screen.getByText('Setgid')).toBeDefined();
    expect(screen.getByText('Sticky')).toBeDefined();
  });
});

describe('ChmodOctalInput and ChmodSymbolicInput', () => {
  test('surface validation errors as alerts', () => {
    render(
      <ChmodOctalInput
        error="Use 3 or 4 octal digits"
        onChange={vi.fn()}
        value="88"
      />
    );
    expect(screen.getByRole('alert')).toBeDefined();
    cleanup();
    render(
      <ChmodSymbolicInput error="Bad symbolic" onChange={vi.fn()} value="zzz" />
    );
    expect(screen.getByRole('alert')).toBeDefined();
  });
});

describe('ChmodExamples', () => {
  test('offers the common recipes as buttons', () => {
    render(<ChmodExamples onSelect={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: EXECUTABLE_SCRIPT_BUTTON })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: SHARED_DIRECTORY_BUTTON })
    ).toBeDefined();
  });
});

describe('ChmodOutput', () => {
  test('shows octal, symbolic, and shell command panels', () => {
    render(
      <ChmodOutput
        command="chmod 755 filename"
        copiedKey={null}
        octal="755"
        onCopy={vi.fn()}
        symbolic="rwxr-xr-x"
      />
    );
    expect(screen.getByText('chmod 755 filename')).toBeDefined();
    expect(screen.getByText('rwxr-xr-x')).toBeDefined();
  });
});

describe('ChmodHelp', () => {
  test('explains the fourth digit', () => {
    render(<ChmodHelp />);
    fireEvent.click(screen.getByRole('button', { name: FAQ_SECTION }));
    expect(screen.getByText(FOURTH_DIGIT_QUESTION)).toBeDefined();
  });
});
