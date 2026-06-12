import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

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

export async function renderWithIntl(ui: ReactElement, locale: string = 'ko') {
  const [common, settings] = await Promise.all([
    import(`@/messages/${locale}/common.json`),
    import(`@/messages/${locale}/settings.json`),
  ]);
  const messages = { common: common.default, settings: settings.default };
  const client = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
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
