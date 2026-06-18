import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('todos');
  return { title: t('meta.noteEdit.title'), description: t('meta.noteEdit.description') };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
