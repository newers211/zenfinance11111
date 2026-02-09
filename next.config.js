/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Указываем явный корень для Turbopack, чтобы он не поднимался выше проекта
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig