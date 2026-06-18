import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('posts');
  return { title: t('meta.write.title'), description: t('meta.write.description') };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
