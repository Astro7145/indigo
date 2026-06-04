import { create } from 'zustand';

interface ProfileImageState {
  // 선택된 이미지 파일. ProfileImageInput(선택)과 ProfileForm(제출 시 업로드) 사이에서 공유한다.
  // 업로드 URL 발급·S3 업로드는 모두 제출 시점에 수행한다.
  file: File | null;
  setFile: (file: File) => void;
  reset: () => void;
}

export const useProfileImageStore = create<ProfileImageState>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
  reset: () => set({ file: null }),
}));
