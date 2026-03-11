import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  ClipboardList,
  Table2,
  Users,
  BookOpen,
  Stethoscope,
  Coffee,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Page, User } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  connected: boolean;
  currentUser: User | null;
  onLogout: () => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles: string[];
}

export default function Sidebar({ currentPage, onNavigate, connected, currentUser, onLogout }: SidebarProps) {
  const role = currentUser?.role || 'waiter';

  const sections: NavSection[] = [
    {
      title: 'Principal',
      roles: ['admin', 'administrator', 'administrador', 'manager', 'cashier', 'cajero', 'waiter', 'mesero'],
      items: [
        { id: 'dashboard',  label: 'Dashboard',       icon: <LayoutDashboard size={18} /> },
        { id: 'pos',        label: 'Punto de Venta',  icon: <ShoppingCart size={18} /> },
        { id: 'menu',       label: 'Menú',            icon: <UtensilsCrossed size={18} /> },
        { id: 'orders',     label: 'Pedidos',         icon: <ClipboardList size={18} /> },
        { id: 'tables',     label: 'Mesas',           icon: <Table2 size={18} /> },
      ],
    },
    {
      title: 'Administración',
      roles: ['admin', 'administrator', 'administrador', 'manager'],
      items: [
        { id: 'users', label: 'Usuarios', icon: <Users size={18} /> },
      ],
    },
    {
      title: 'Herramientas',
      roles: ['admin', 'administrator', 'administrador', 'manager'],
      items: [
        { id: 'diagnostics',  label: 'Diagnóstico', icon: <Stethoscope size={18} /> },
        { id: 'django-guide', label: 'Guía Django',  icon: <BookOpen size={18} /> },
      ],
    },
  ];

  const filterPrincipalItems = (items: NavItem[]): NavItem[] => {
    const isWaiter = ['waiter', 'mesero'].includes(role);
    if (isWaiter) {
      return items.filter(item => ['pos', 'orders', 'tables'].includes(item.id));
    }
    return items;
  };

  const isRootAdmin = currentUser?.username === 'admin';
  const isAdminRole = ['admin', 'administrator', 'administrador', 'manager'].includes(role);

  const canSeeSection = (section: NavSection): boolean => {
    switch (section.title) {
      case 'Herramientas':   return isRootAdmin;
      case 'Administración': return isRootAdmin || isAdminRole;
      case 'Principal':      return true;
      default:               return false;
    }
  };

  const getInitials = (user: User | null): string => {
    if (!user) return '?';
    const first = user.firstName?.[0] || user.username?.[0] || '?';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  const getRoleBadge = (userRole: string) => {
    const isAdmin   = ['admin', 'administrator', 'administrador', 'manager'].includes(userRole);
    const isCashier = ['cashier', 'cajero'].includes(userRole);
    const isWaiter  = ['waiter', 'mesero'].includes(userRole);
    if (isAdmin)   return { label: 'Administrador', color: 'bg-purple-500/20 text-purple-300' };
    if (isCashier) return { label: 'Cajero',        color: 'bg-blue-500/20 text-blue-300'   };
    if (isWaiter)  return { label: 'Mesero',        color: 'bg-green-500/20 text-green-300' };
    return { label: userRole, color: 'bg-gray-500/20 text-gray-300' };
  };

  const badge = getRoleBadge(role);

  return (
    <aside className="w-64 flex-shrink-0 self-stretch">
      <div className="w-64 bg-gray-900 text-white flex flex-col fixed top-0 left-0 h-screen">

        {/* Logo */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Coffee size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Café & Co.</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-gray-400">
                  {connected ? 'Conectado' : 'Sin conexión'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sections.map((section) => {
            if (!canSeeSection(section)) return null;

            const items = section.title === 'Principal'
              ? filterPrincipalItems(section.items)
              : section.items;

            if (items.length === 0) return null;

            return (
              <div key={section.title} className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                          isActive
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-amber-400 transition-colors'}>
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isActive && <ChevronRight size={14} className="text-white/70" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Usuario y Logout */}
        <div className="border-t border-gray-700 p-4 flex-shrink-0">
          {currentUser && (
            <div className="mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getInitials(currentUser)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {currentUser.firstName && currentUser.lastName
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : currentUser.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">@{currentUser.username}</p>
                </div>
              </div>
              <div className="mt-2 ml-12">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group"
          >
            <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
