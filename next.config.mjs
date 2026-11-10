/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repoName = 'Crecer-b2b';

const nextConfig = {
  basePath: isGithubActions ? `/${repoName}` : '',
  assetPrefix: isGithubActions ? `/${repoName}/` : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/comercial/clientes/:path*', destination: '/commercial/customers/:path*', permanent: false },
      { source: '/comercial/rutas/:path*', destination: '/commercial/routes/:path*', permanent: false },
      { source: '/comercial/visitas-jornadas/:path*', destination: '/commercial/field-operations/:path*', permanent: false },
      { source: '/comercial/gastos/:path*', destination: '/commercial/expenses/:path*', permanent: false },
      { source: '/comercial/solicitudes/:path*', destination: '/commercial/requests/:path*', permanent: false },
      { source: '/comercial/ventas/:path*', destination: '/commercial/sales/:path*', permanent: false },
      { source: '/equipo/:path*', destination: '/team/:path*', permanent: false },
      { source: '/plataforma/empresas/:path*', destination: '/platform/companies/:path*', permanent: false },
      { source: '/plataforma/usuarios/:path*', destination: '/platform/users/:path*', permanent: false },
      { source: '/invitacion/:path*', destination: '/invitation/:path*', permanent: false },
      { source: '/inicio/:path*', destination: '/dashboard/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
