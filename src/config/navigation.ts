import { APP_ROUTES } from "./routes";

export interface NavigationItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  children?: {
    title: string;
    href: string;
  }[];
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  { title: "Empresas", href: `${APP_ROUTES.ADMIN.COMPANIES}/`, icon: "Building2" },
  { title: "Usuarios", href: `${APP_ROUTES.ADMIN.USERS}/`, icon: "Users" },
  { title: "Equipo", href: `${APP_ROUTES.TEAM}/`, icon: "Users" },
  {
    title: "Inicio",
    href: `${APP_ROUTES.DASHBOARD}/`,
    icon: "Home",
  },
  {
    title: "Operación de campo",
    href: `${APP_ROUTES.CUSTOMERS}/`,
    icon: "Briefcase",
    children: [
      {
        title: "Clientes",
        href: `${APP_ROUTES.CUSTOMERS}/`,
      },
      {
        title: "Rutas y visitas",
        href: `${APP_ROUTES.ROUTES}/`,
      },
      {
        title: "Visitas y jornadas",
        href: `${APP_ROUTES.VISITS}/`,
      },
      {
        title: "Ventas",
        href: `${APP_ROUTES.SALES}/`,
      },
      {
        title: "Solicitudes",
        href: `${APP_ROUTES.REQUESTS}/`,
      },
      {
        title: "Gastos",
        href: `${APP_ROUTES.EXPENSES}/`,
      },
    ],
  },
  {
    title: "Catálogo",
    href: `${APP_ROUTES.CATALOG}/`,
    icon: "BookOpen",
  },
  {
    title: "Inventario",
    href: `${APP_ROUTES.INVENTORY}/`,
    icon: "Package",
  },
  {
    title: "Finanzas",
    href: `${APP_ROUTES.FINANCE}/`,
    icon: "CircleDollarSign",
  },
  {
    title: "Reportes",
    href: `${APP_ROUTES.REPORTS}/`,
    icon: "BarChart3",
  },
  {
    title: "Configuración",
    href: `${APP_ROUTES.SETTINGS}/`,
    icon: "Settings",
  },
];
