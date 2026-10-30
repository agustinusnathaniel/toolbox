import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import type { JwtEncodeResult } from '@/lib/tools/jwt-encoder/adapters/jwt-encoder';

import { JwtEncoderOutput } from './jwt-encoder-sections';

const SIGNED_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.c2lnbmF0dXJl';

async function renderOutput(result: JwtEncodeResult | null) {
  const rootRoute = createRootRoute();
  const homeRoute = createRoute({
    component: () => (
      <JwtEncoderOutput
        copied={false}
        hasInput
        onCopy={vi.fn()}
        result={result}
      />
    ),
    getParentRoute: () => rootRoute,
    path: '/',
  });
  const decoderRoute = createRoute({
    component: () => null,
    getParentRoute: () => rootRoute,
    path: 'jwt-decoder',
    validateSearch: (search: Record<string, unknown>) => ({
      token: typeof search.token === 'string' ? search.token : undefined,
    }),
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ['/'] }),
    routeTree: rootRoute.addChildren([homeRoute, decoderRoute]),
  });
  await router.load();
  render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
});

describe('JwtEncoderOutput inspect link', () => {
  test('links the signed token into the JWT Decoder', async () => {
    await renderOutput({ isValid: true, token: SIGNED_TOKEN });

    const link = screen.getByRole('link', {
      name: 'Inspect in JWT Decoder',
    });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain('/jwt-decoder');
    expect(href).toContain(`token=${SIGNED_TOKEN}`);
  });

  test('renders no inspect link when there is no signed token', async () => {
    await renderOutput({
      error: 'Enter a secret to sign the token.',
      isValid: false,
    });

    expect(
      screen.queryByRole('link', { name: 'Inspect in JWT Decoder' })
    ).not.toBeInTheDocument();
  });
});
