import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('posts');
  return { title: t('meta.edit.title'), description: t('meta.edit.description') };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
