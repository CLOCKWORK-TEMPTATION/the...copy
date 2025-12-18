/** @type {import('next').NextConfig} */
const nextConfig = {
  // إصلاح مشكلة Turbopack - تحديد جذر المشروع بوضوح
  turbopack: {
    root: (() => {
      try {
        return process.cwd();
      } catch (error) {
        console.warn('Failed to get current working directory:', error);
        return __dirname || '.';
      }
    })(),
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  images: {
    unoptimized: true,
  },
  // معالجة أخطاء البناء
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

export default nextConfig
