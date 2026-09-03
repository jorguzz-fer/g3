/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Imagem de produção enxuta (server standalone) para o Dockerfile.
  output: 'standalone',
  // Pacotes do monorepo em TS: Next transpila diretamente do source.
  transpilePackages: ['@g3/ui', '@g3/api-client', '@g3/design-tokens', '@g3/shared'],
};

export default nextConfig;
