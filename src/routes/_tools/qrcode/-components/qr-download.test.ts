import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import { svgToPngDownload } from './qr-download';

afterEach(() => {
  vi.restoreAllMocks();
});

function setupMocks(opts: { getContextResult: object | null }) {
  const mockSerialize = vi.fn().mockReturnValue('<svg></svg>');
  vi.stubGlobal(
    'XMLSerializer',
    class {
      serializeToString = mockSerialize;
    }
  );

  const mockCreateObjectURL = vi
    .spyOn(URL, 'createObjectURL')
    .mockReturnValue('blob:mock-url');
  const mockRevokeObjectURL = vi
    .spyOn(URL, 'revokeObjectURL')
    .mockImplementation(() => {
      // no-op for test
    });

  const mockClick = vi.fn();
  const mockToDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock');
  const mockDrawImage = vi.fn();
  const mockGetContext = vi.fn().mockReturnValue(opts.getContextResult);

  vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: mockGetContext,
        toDataURL: mockToDataURL,
      };
    }
    if (tag === 'a') {
      return { click: mockClick, download: '', href: '' };
    }
    return {};
  }) as never);

  let capturedOnload: (() => void) | null = null;

  class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    readonly #src = '';
    get src() {
      return this.#src;
    }
    set src(_value: string) {
      capturedOnload = this.onload;
    }
  }
  vi.stubGlobal('Image', MockImage);

  return {
    mockSerialize,
    mockCreateObjectURL,
    mockRevokeObjectURL,
    mockClick,
    mockGetContext,
    mockToDataURL,
    mockDrawImage,
    getCapturedOnload: () => capturedOnload,
  };
}

describe('svgToPngDownload', () => {
  test('serializes SVG, creates blob, and triggers download', () => {
    const m = setupMocks({ getContextResult: { drawImage: vi.fn() } });

    const svg = { nodeType: 1 } as unknown as SVGSVGElement;
    svgToPngDownload(svg, 200);

    const onload = m.getCapturedOnload();
    expect(onload).not.toBeNull();
    onload?.();

    expect(m.mockSerialize).toHaveBeenCalledWith(svg);
    expect(m.mockCreateObjectURL).toHaveBeenCalled();
    expect(m.mockClick).toHaveBeenCalled();
    expect(m.mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  test('calls toast.error when canvas context is null', async () => {
    const { toast } = await import('sonner');
    const toastErrorSpy = vi.spyOn(toast, 'error').mockImplementation(() => '');

    const m = setupMocks({ getContextResult: null });

    const svg = { nodeType: 1 } as unknown as SVGSVGElement;
    svgToPngDownload(svg, 200);

    const onload = m.getCapturedOnload();
    expect(onload).not.toBeNull();
    onload?.();

    expect(toastErrorSpy).toHaveBeenCalledWith('Failed to create canvas');
    expect(m.mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
