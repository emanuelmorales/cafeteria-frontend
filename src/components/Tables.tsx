import { Users, Check, Clock, Sparkles } from 'lucide-react';
import { Table, Order } from '../types';

interface TablesProps {
  tables: Table[];
  orders: Order[];
  onUpdateTableStatus: (tableId: number, status: Table['status']) => void;
}

const statusConfig = {
  available: { label: 'Disponible', color: 'bg-emerald-500', bgCard: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: <Check size={20} /> },
  occupied: { label: 'Ocupada', color: 'bg-red-500', bgCard: 'bg-red-50 border-red-200', text: 'text-red-700', icon: <Users size={20} /> },
  reserved: { label: 'Reservada', color: 'bg-amber-500', bgCard: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: <Clock size={20} /> },
  cleaning: { label: 'Limpieza', color: 'bg-blue-500', bgCard: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: <Sparkles size={20} /> },
};

export default function Tables({ tables, orders, onUpdateTableStatus }: TablesProps) {
  const summary = {
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    cleaning: tables.filter((t) => t.status === 'cleaning').length,
  };

  const getTableOrder = (table: Table) => {
    if (!table.currentOrderId) return null;
    return orders.find((o) => o.id === table.currentOrderId);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Mesas</h2>
        <p className="text-gray-500 text-sm mt-1">Vista del salón y estado de las mesas</p>
      </div>

      {/* Summary */}
      <div className="flex gap-4 flex-wrap">
        {(Object.entries(summary) as [Table['status'], number][]).map(([status, count]) => {
          const config = statusConfig[status];
          return (
            <div key={status} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="text-sm text-gray-600">{config.label}</span>
              <span className="text-lg font-bold text-gray-800">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => {
          const config = statusConfig[table.status];
          const order = getTableOrder(table);
          return (
            <div
              key={table.id}
              className={`rounded-2xl border-2 p-5 transition-all hover:shadow-lg ${config.bgCard}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-2xl font-bold ${config.text}`}>{table.number}</span>
                <div className={`${config.color} text-white p-1.5 rounded-lg`}>
                  {config.icon}
                </div>
              </div>
              <p className={`text-sm font-medium ${config.text} mb-1`}>{config.label}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Users size={12} />
                {table.seats} asientos
              </p>

              {order && (
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <p className="text-xs text-gray-500">Pedido #{order.id.toString().padStart(4, '0')}</p>
                  <p className="text-sm font-bold text-gray-700">${order.total}</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="mt-3 flex flex-wrap gap-1">
                {table.status === 'available' && (
                  <>
                    <button
                      onClick={() => onUpdateTableStatus(table.id, 'occupied')}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Ocupar
                    </button>
                    <button
                      onClick={() => onUpdateTableStatus(table.id, 'reserved')}
                      className="text-xs bg-amber-500 text-white px-2 py-1 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      Reservar
                    </button>
                  </>
                )}
                {table.status === 'occupied' && (
                  <button
                    onClick={() => onUpdateTableStatus(table.id, 'cleaning')}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Liberar
                  </button>
                )}
                {table.status === 'reserved' && (
                  <>
                    <button
                      onClick={() => onUpdateTableStatus(table.id, 'occupied')}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Ocupar
                    </button>
                    <button
                      onClick={() => onUpdateTableStatus(table.id, 'available')}
                      className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {table.status === 'cleaning' && (
                  <button
                    onClick={() => onUpdateTableStatus(table.id, 'available')}
                    className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Lista
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
