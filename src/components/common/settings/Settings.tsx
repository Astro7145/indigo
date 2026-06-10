'use client';

import { useIsMobile } from '@/src/hooks/useIsMobile';

import SettingsBottomSheet from './SettingsBottomSheet';
import SettingsModal from './SettingsModal';

export default function Settings() {
  const isMobile = useIsMobile();
  return isMobile ? <SettingsBottomSheet /> : <SettingsModal />;
}
