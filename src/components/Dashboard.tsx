import { DollarSign, ShoppingBag, Users, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Order } from '../types';

interface DashboardProps {
  orders: Order[];
}

export default function Dashboard({ orders }: DashboardProps) {
  const today = new Date();
  const todayOrders = orders.filter(
    (o) => o.createdAt.toDateString() === today.toDateString()
  );

  const totalRevenue = todayOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const deliveredCount = todayOrders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = todayOrders.filter((o) => o.status === 'cancelled').length;

  const avgTicket = todayOrders.length > 0 ? totalRevenue / todayOrders.filter(o => o.status !== 'cancelled').length : 0;

  const stats = [
    {
      label: 'Ventas del Día',
      value: `$${totalRevenue.toLocaleString('es-MX')}`,
      icon: <DollarSign size={24} />,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Pedidos Hoy',
      value: todayOrders.length,
      icon: <ShoppingBag size={24} />,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Ticket Promedio',
      value: `$${avgTicket.toFixed(0)}`,
      icon: <TrendingUp size={24} />,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      label: 'Clientes Atendidos',
      value: deliveredCount,
      icon: <Users size={24} />,
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
  ];

  const orderStatuses = [
    { label: 'Pendientes', count: pendingCount, icon: <Clock size={18} />, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'En Preparación', count: preparingCount, icon: <AlertCircle size={18} />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Listos', count: readyCount, icon: <CheckCircle size={18} />, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Entregados', count: deliveredCount, icon: <CheckCircle size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Cancelados', count: cancelledCount, icon: <XCircle size={18} />, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const getStatusBadge = (status: Order['status']) => {
    const map: Record<Order['status'], { label: string; class: string }> = {
      pending:   { label: 'Pendiente',  class: 'bg-yellow-100 text-yellow-800'  },
      preparing: { label: 'Preparando', class: 'bg-blue-100 text-blue-800'      },
      ready:     { label: 'Listo',      class: 'bg-green-100 text-green-800'    },
      delivered: { label: 'Entregado',  class: 'bg-purple-100 text-purple-800'  },
      paid:      { label: 'Cobrado',    class: 'bg-emerald-100 text-emerald-800' },
      cancelled: { label: 'Cancelado',  class: 'bg-red-100 text-red-800'        },
    };
    return map[status] ?? { label: status, class: 'bg-gray-100 text-gray-800' };
  };

  const timeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    return `Hace ${hrs}h ${mins % 60}min`;
  };

  // Simple bar chart data
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7am to 6pm
  const hourlyData = hours.map((h) => {
    const count = todayOrders.filter((o) => o.createdAt.getHours() === h).length;
    return { hour: h, count };
  });
  const maxCount = Math.max(...hourlyData.map((d) => d.count), 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Resumen del día — {today.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.bgLight} rounded-2xl p-5 border border-gray-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-xl shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Pedidos</h3>
          <div className="space-y-3">
            {orderStatuses.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${s.bg} p-2 rounded-lg ${s.color}`}>{s.icon}</div>
                  <span className="text-sm text-gray-600">{s.label}</span>
                </div>
                <span className={`text-lg font-bold ${s.color}`}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pedidos por Hora</h3>
          <div className="flex items-end gap-2 h-40">
            {hourlyData.map((d) => (
              <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{d.count || ''}</span>
                <div
                  className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-500 min-h-[4px]"
                  style={{ height: `${(d.count / maxCount) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{d.hour}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pedidos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Pedido</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">#{order.id.toString().padStart(4, '0')}</td>
                    <td className="py-3 text-gray-600">{order.customerName || 'Anónimo'}</td>
                    <td className="py-3 text-gray-600">{order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${order.type === 'dine-in' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                        {order.type === 'dine-in' ? `Mesa ${order.tableNumber}` : 'Para llevar'}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-gray-800">${order.total}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{timeAgo(order.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
