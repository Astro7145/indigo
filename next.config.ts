import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.168.*.*'],
  images: {
    // 업로드 이미지/아바타 호스트가 가변적이라 전체 https 허용. 호스트 확정 시 좁힐 것.
    // 카카오 OAuth 프로필 이미지(k.kakaocdn.net 등)는 http로 내려와 별도 허용.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**.kakaocdn.net' },
    ],
  },
};

const withNextIntl = createNextIntlPlugin(
  // request.ts 경로 지정
  '@/src/i18n/request.ts',
);

export default withNextIntl(nextConfig);
