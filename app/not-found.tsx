import type { Metadata } from 'next';

import NotFoundBlackHole from '@/src/components/common/NotFoundBlackHole';

export const metadata: Metadata = {
  title: '404',
};

export default function NotFound() {
  return <NotFoundBlackHole />;
}
