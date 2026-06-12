import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { NextIntlClientProvider } from 'next-intl';
import { Suspense } from 'react';
import type { ReactElement, ReactNode } from 'react';

import type { Locale } from '@/src/i18n/routing';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderHookWithClient<TResult>(callback: () => TResult) {
  const client = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const utils = renderHook(callback, { wrapper });
  return { client, ...utils };
}

const MESSAGE_NAMESPACES = [
  'calendar',
  'common',
  'dashboard',
  'favorites',
  'goals',
  'login',
  'me',
  'posts',
  'settings',
  'sidebar',
  'signup',
  'todos',
  'validation',
] as const;

export async function renderWithIntl(ui: ReactElement, locale: Locale = 'ko') {
  const loaded = await Promise.all(
    MESSAGE_NAMESPACES.map((ns) => import(`@/messages/${locale}/${ns}.json`).then((m) => [ns, m.default] as const)),
  );
  const messages = Object.fromEntries(loaded);
  const client = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={client}>
        <ErrorBoundary fallbackRender={({ error }) => <div data-testid="error">{(error as Error).message}</div>}>
          <Suspense fallback={<div data-testid="loading" />}>{children}</Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
  return { client, ...render(ui, { wrapper }) };
}

export function renderWithClient(ui: ReactElement) {
  const client = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const utils = render(ui, { wrapper });
  return { client, ...utils };
}
