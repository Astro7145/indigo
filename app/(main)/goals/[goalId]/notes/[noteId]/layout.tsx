import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('goals');
  return { title: t('meta.noteDetail.title'), description: t('meta.noteDetail.description') };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
