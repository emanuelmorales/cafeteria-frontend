import React, { useState, useMemo } from 'react';
import {
  Clock, ChefHat, CheckCircle, Truck, XCircle,
  Filter, Eye, X, ArrowRight, Search, User, Hash,
  ClipboardList, CreditCard, DollarSign, Smartphone,
  QrCode, Banknote, Send, CheckCheck, Copy,
} from 'lucide-react';
import { Order } from '../types';

interface OrdersProps {
  orders: Order[];
  onUpdateStatus: (orderId: number, status: Order['status'], paymentMethod?: string) => void;
}

const statusConfig: Record<Order['status'], { label: string; icon: React.ReactElement; color: string; dot: string }> = {
  pending:   { label: 'Pendiente',  icon: <Clock size={16} />,       color: 'bg-yellow-100 text-yellow-800 border-yellow-200',     dot: 'bg-yellow-500'  },
  preparing: { label: 'Preparando', icon: <ChefHat size={16} />,     color: 'bg-blue-100 text-blue-800 border-blue-200',           dot: 'bg-blue-500'    },
  ready:     { label: 'Listo',      icon: <CheckCircle size={16} />, color: 'bg-green-100 text-green-800 border-green-200',        dot: 'bg-green-500'   },
  delivered: { label: 'Entregado',  icon: <Truck size={16} />,       color: 'bg-purple-100 text-purple-800 border-purple-200',     dot: 'bg-purple-500'  },
  paid:      { label: 'Cobrado',    icon: <CheckCheck size={16} />,  color: 'bg-emerald-100 text-emerald-800 border-emerald-200',  dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelado',  icon: <XCircle size={16} />,     color: 'bg-red-100 text-red-800 border-red-200',             dot: 'bg-red-500'     },
};

const nextStatus: Record<Order['status'], Order['status'] | null> = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'delivered',
  delivered: null,
  paid:      null,
  cancelled: null,
};

// Detecta si el pedido es para llevar
const isTakeaway = (order: Order) =>
  !['dine-in', 'dine_in'].includes((order.type ?? '').toLowerCase());

// Siguiente estado según tipo de pedido
const getNextStatus = (order: Order): Order['status'] | null => {
  if (isTakeaway(order) && order.status === 'ready') return null; // en llevar, listo→cobrar directo
  return nextStatus[order.status];
};

// Mostrar botón Cobrar
const showCobrar = (order: Order): boolean => {
  if (isTakeaway(order)) return order.status === 'ready';
  return order.status === 'delivered';
};

const paymentMethods = [
  { id: 'efectivo',      label: 'Efectivo',     emoji: '💵', icon: <Banknote size={20} />,   color: 'bg-green-50 border-green-300 text-green-700'   },
  { id: 'transferencia', label: 'Transferencia', emoji: '📲', icon: <Smartphone size={20} />, color: 'bg-blue-50 border-blue-300 text-blue-700'      },
  { id: 'credito',       label: 'Crédito',       emoji: '💳', icon: <CreditCard size={20} />, color: 'bg-purple-50 border-purple-300 text-purple-700' },
  { id: 'debito',        label: 'Débito',        emoji: '💳', icon: <CreditCard size={20} />, color: 'bg-indigo-50 border-indigo-300 text-indigo-700' },
  { id: 'qr',            label: 'QR',            emoji: '📷', icon: <QrCode size={20} />,     color: 'bg-orange-50 border-orange-300 text-orange-700' },
  { id: 'otro',          label: 'Otro',          emoji: '💰', icon: <DollarSign size={20} />, color: 'bg-gray-50 border-gray-300 text-gray-700'      },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProductName(item: any): string {
  if (item?.product?.name && item.product.name !== '') return item.product.name;
  if (item?.productName)  return item.productName;
  if (item?.product_name) return item.product_name;
  if (item?.name)         return item.name;
  return 'Producto';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProductImage(item: any): string {
  const raw = item?.product?.image || item?.productImage || item?.product_image || item?.image || '';
  if (raw && [...raw].length <= 2) return raw;
  return '🍽️';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProductPrice(item: any): number {
  if (item?.unitPrice   != null) return parseFloat(item.unitPrice);
  if (item?.unit_price  != null) return parseFloat(item.unit_price);
  if (item?.product?.price)      return parseFloat(item.product.price);
  if (item?.price != null && item?.quantity) return parseFloat(item.price) / item.quantity;
  return 0;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getItemSubtotal(item: any): number {
  if (item?.subtotal != null) return parseFloat(item.subtotal);
  return getProductPrice(item) * (item?.quantity ?? 1);
}

function getPaymentLabel(method?: string) {
  return paymentMethods.find(p => p.id === method)?.label ?? method ?? '';
}
function getPaymentEmoji(method?: string) {
  return paymentMethods.find(p => p.id === method)?.emoji ?? '💰';
}

function buildWhatsAppMessage(order: Order, paymentMethod: string): string {
  const CAFE_NAME    = 'Cafe y Co.';
  const CAFE_ADDRESS = 'Sanchez de Bustamante 155, Y4600 San Salvador de Jujuy, Jujuy';
  const CAFE_TEL     = 'Tel: (+549) 381-6252083';
  const now   = new Date();
  const fecha = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hora  = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (order.items ?? []) as any[];
  const tipo  = order.type === 'dine-in' ? 'Mesa ' + order.tableNumber : 'Para llevar';
  const sep   = '----------------------------';

  const lineas = items.map(item => {
    const nombre   = getProductName(item);
    const qty      = item?.quantity ?? 1;
    const subtotal = getItemSubtotal(item);
    return qty + 'x ' + nombre + ' .. $' + Number(subtotal).toFixed(2);
  }).join('\n');

  const partes: string[] = [
    '*' + CAFE_NAME + '*',
    CAFE_ADDRESS,
    CAFE_TEL,
    sep,
    '*Recibo N ' + String(order.id).padStart(4, '0') + '*',
    'Fecha: ' + fecha + '  Hora: ' + hora,
    sep,
  ];

  if (order.customerName) partes.push('Cliente: ' + order.customerName);
  partes.push('Tipo: ' + tipo);
  partes.push(sep);
  partes.push('*DETALLE DEL PEDIDO*');
  partes.push('');
  partes.push(lineas);
  partes.push('');
  partes.push(sep);
  partes.push('*TOTAL: $' + Number(order.total).toFixed(2) + '*');
  partes.push('Pago: ' + getPaymentLabel(paymentMethod));
  partes.push(sep);
  partes.push('Gracias por su visita!');

  return partes.join('\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawTicketCanvas(order: Order, paymentMethod: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const W      = 420;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items  = (order.items ?? []) as any[];
  const H      = 200 + items.length * 40 + 120;
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#78350F';
  ctx.fillRect(0, 0, W, 80);

  ctx.fillStyle = '#FFFFFF';
  ctx.font      = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Cafe y Co.', W / 2, 30);
  ctx.font      = '11px Arial';
  ctx.fillStyle = '#FDE68A';
  ctx.fillText('Sanchez de Bustamante 155, Y4600 San Salvador de Jujuy', W / 2, 50);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Tel: (+549) 381-6252083', W / 2, 68);

  ctx.fillStyle  = '#1F2937';
  ctx.font       = 'bold 17px Arial';
  ctx.textAlign  = 'center';
  ctx.fillText('RECIBO N' + String(order.id).padStart(4, '0'), W / 2, 105);

  const now   = new Date();
  const fecha = now.toLocaleDateString('es-AR');
  const hora  = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  ctx.font      = '12px Arial';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(fecha + '  ' + hora, W / 2, 122);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#374151';
  ctx.font      = '13px Arial';
  let y = 142;
  if (order.customerName) { ctx.fillText('Cliente: ' + order.customerName, 24, y); y += 18; }
  const tipo = order.type === 'dine-in' ? 'Mesa: ' + order.tableNumber : 'Para llevar';
  ctx.fillText(tipo, 24, y); y += 18;

  ctx.strokeStyle = '#D1D5DB';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(24, y + 4); ctx.lineTo(W - 24, y + 4); ctx.stroke();
  ctx.setLineDash([]);
  y += 20;

  ctx.fillStyle = '#92400E';
  ctx.font      = 'bold 12px Arial';
  ctx.fillText('PRODUCTO', 24, y);
  ctx.textAlign = 'right';
  ctx.fillText('SUBTOTAL', W - 24, y);
  ctx.textAlign = 'left';
  y += 14;

  ctx.strokeStyle = '#E5E7EB';
  ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(W - 24, y); ctx.stroke();
  y += 14;

  ctx.font      = '13px Arial';
  ctx.fillStyle = '#1F2937';
  items.forEach(item => {
    const nombre   = getProductName(item);
    const qty      = item?.quantity ?? 1;
    const subtotal = getItemSubtotal(item);
    ctx.textAlign = 'left';
    ctx.fillText(qty + 'x ' + nombre, 24, y);
    ctx.textAlign = 'right';
    ctx.fillText('$' + subtotal.toFixed(2), W - 24, y);
    y += 34;
  });

  ctx.strokeStyle = '#9CA3AF';
  ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(W - 24, y); ctx.stroke();
  ctx.setLineDash([]);
  y += 16;

  ctx.fillStyle = '#92400E';
  ctx.font      = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('TOTAL', 24, y);
  ctx.textAlign = 'right';
  ctx.fillText('$' + Number(order.total).toFixed(2), W - 24, y);
  y += 20;

  ctx.fillStyle = '#6B7280';
  ctx.font      = '13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Pago: ' + getPaymentLabel(paymentMethod), 24, y);
  y += 30;

  ctx.fillStyle = '#78350F';
  ctx.fillRect(0, y, W, 50);
  ctx.fillStyle = '#FFFFFF';
  ctx.font      = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Gracias por su visita', W / 2, y + 18);
  ctx.font      = '12px Arial';
  ctx.fillStyle = '#FDE68A';
  ctx.fillText('Esperamos verle pronto', W / 2, y + 36);

  return canvas;
}

async function copyTicketToClipboard(order: Order, paymentMethod: string, setCopied: (v: boolean) => void) {
  const canvas = drawTicketCanvas(order, paymentMethod);
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const link = document.createElement('a');
      link.download = 'ticket-' + String(order.id).padStart(4, '0') + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      alert('Tu navegador no permite copiar imágenes. El ticket se descargó automáticamente.');
    }
  }, 'image/png');
}

export default function Orders({ orders, onUpdateStatus }: OrdersProps) {
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [payingOrder,  setPayingOrder]  = useState<Order | null>(null);
  const [selectedPM,   setSelectedPM]   = useState('efectivo');
  const [whatsappNum,  setWhatsappNum]  = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [searchType,   setSearchType]  = useState<'all' | 'customer' | 'table'>('all');
  const [showWAInput,  setShowWAInput]  = useState(false);
  const [copied,       setCopied]       = useState(false);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => filterStatus === 'all' || o.status === filterStatus)
      .filter(o => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        if (searchType === 'customer') return (o.customerName ?? '').toLowerCase().includes(q);
        if (searchType === 'table')    return String(o.tableNumber ?? '').includes(q);
        return (
          (o.customerName ?? '').toLowerCase().includes(q) ||
          String(o.tableNumber ?? '').includes(q) ||
          String(o.id).includes(q)
        );
      })
      .sort((a, b) => {
        const tA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const tB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return tB - tA;
      });
  }, [orders, filterStatus, searchQuery, searchType]);

  const timeAgo = (date: Date | string) => {
    const d    = date instanceof Date ? date : new Date(date);
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1)  return 'Justo ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    return `Hace ${hrs}h ${mins % 60}m`;
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusFilters = [
    { value: 'all'       as const, label: 'Todos',      count: orders.length },
    { value: 'pending'   as const, label: 'Pendientes', count: orders.filter(o => o.status === 'pending').length },
    { value: 'preparing' as const, label: 'Preparando', count: orders.filter(o => o.status === 'preparing').length },
    { value: 'ready'     as const, label: 'Listos',     count: orders.filter(o => o.status === 'ready').length },
    { value: 'delivered' as const, label: 'Entregados', count: orders.filter(o => o.status === 'delivered').length },
    { value: 'paid'      as const, label: 'Cobrados',   count: orders.filter(o => o.status === 'paid').length },
    { value: 'cancelled' as const, label: 'Cancelados', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  const handleConfirmPayment = () => {
    if (!payingOrder) return;
    onUpdateStatus(payingOrder.id, 'paid', selectedPM);
    setPayingOrder(null);
    setShowWAInput(false);
  };

  const handleSendWhatsApp = () => {
    if (!payingOrder) return;
    const msg = buildWhatsAppMessage(payingOrder, selectedPM);
    const num = whatsappNum.replace(/\D/g, '');
    if (!num) { alert('Ingresa un número de WhatsApp válido'); return; }
    const url = `https://web.whatsapp.com/send?phone=${num}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const openPayModal = (order: Order) => {
    setPayingOrder(order);
    setSelectedPM('efectivo');
    setShowWAInput(false);
    setCopied(false);
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pedidos</h2>
        <p className="text-gray-500 text-sm mt-1">Gestiona y da seguimiento a todos los pedidos</p>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                searchType === 'customer' ? 'Buscar por nombre del cliente...' :
                searchType === 'table'    ? 'Buscar por número de mesa...' :
                'Buscar por cliente, mesa o N° de pedido...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all'      as const, label: 'Todos',   icon: <Filter size={13} /> },
              { value: 'customer' as const, label: 'Cliente', icon: <User size={13} /> },
              { value: 'table'    as const, label: 'Mesa',    icon: <Hash size={13} /> },
            ].map(btn => (
              <button
                key={btn.value}
                onClick={() => setSearchType(btn.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  searchType === btn.value
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                }`}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>
        </div>
        {searchQuery && (
          <p className="text-xs text-gray-500 mt-2 pl-1">
            {filteredOrders.length === 0
              ? 'No se encontraron pedidos'
              : `${filteredOrders.length} pedido${filteredOrders.length !== 1 ? 's' : ''} encontrado${filteredOrders.length !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {/* Filtros estado */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-gray-400" />
        {statusFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filterStatus === f.value
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
            }`}
          >
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${filterStatus === f.value ? 'bg-amber-600' : 'bg-gray-100'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map(order => {
          const config = statusConfig[order.status] ?? statusConfig.pending;
          const next   = getNextStatus(order);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items  = (order.items ?? []) as any[];

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">#{String(order.id).padStart(4, '0')}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{timeAgo(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {order.customerName && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <User size={13} className="text-gray-400" /> {order.customerName}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.type === 'dine-in' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {order.type === 'dine-in' ? `Mesa ${order.tableNumber}` : 'Para llevar'}
                  </span>
                  {order.paymentMethod && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                      {getPaymentEmoji(order.paymentMethod)} {getPaymentLabel(order.paymentMethod)}
                    </span>
                  )}
                </div>

                <div className="space-y-1 mb-3">
                  {items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-[65%]">
                        {getProductImage(item)} {item.quantity}x {getProductName(item)}
                      </span>
                      <span className="text-gray-800 font-medium">${getItemSubtotal(item).toFixed(2)}</span>
                    </div>
                  ))}
                  {items.length > 3 && <p className="text-xs text-gray-400">+{items.length - 3} producto(s) más...</p>}
                  {items.length === 0 && <p className="text-xs text-gray-400 italic">Sin detalle disponible</p>}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-amber-600">${Number(order.total).toFixed(2)}</span>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button
                      onClick={() => setViewingOrder(order)}
                      title="Ver detalle"
                      className="text-gray-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    {next && (
                      <button
                        onClick={() => onUpdateStatus(order.id, next)}
                        className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        <ArrowRight size={14} /> {statusConfig[next].label}
                      </button>
                    )}
                    {showCobrar(order) && (
                      <button
                        onClick={() => openPayModal(order)}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        <CreditCard size={14} /> Cobrar
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'paid' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'cancelled')}
                        title="Cancelar pedido"
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {searchQuery ? `No se encontraron pedidos para "${searchQuery}"` : 'No hay pedidos con este filtro'}
          </p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="mt-3 text-sm text-amber-500 hover:text-amber-600 underline">
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}

      {/* MODAL DE PAGO */}
      {payingOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <CreditCard size={20} className="text-emerald-500" />
                  Cobrar Pedido #{String(payingOrder.id).padStart(4, '0')}
                </h3>
                <p className="text-sm text-gray-400">
                  {payingOrder.customerName && `Cliente: ${payingOrder.customerName} — `}
                  {payingOrder.type === 'dine-in' ? `Mesa ${payingOrder.tableNumber}` : 'Para llevar'}
                </p>
              </div>
              <button onClick={() => setPayingOrder(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Resumen */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Resumen del pedido</p>
                <div className="space-y-1.5">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {((payingOrder.items ?? []) as any[]).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{getProductImage(item)} {item.quantity}x {getProductName(item)}</span>
                      <span className="font-medium text-gray-800">${getItemSubtotal(item).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-amber-200">
                  <span className="font-bold text-gray-800">TOTAL A COBRAR</span>
                  <span className="font-bold text-2xl text-amber-600">${Number(payingOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Metodo de pago</p>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedPM(pm.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                        selectedPM === pm.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md scale-105'
                          : `${pm.color} border opacity-70 hover:opacity-100`
                      }`}
                    >
                      <span className="text-xl">{pm.emoji}</span>
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comprobante */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Send size={15} className="text-green-500" /> Enviar comprobante
                </p>

                <button
                  onClick={() => copyTicketToClipboard(payingOrder, selectedPM, setCopied)}
                  className={`w-full flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl font-medium transition-all ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white border-2 border-dashed border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  <Copy size={16} />
                  {copied ? 'Imagen copiada al portapapeles' : 'Copiar ticket como imagen'}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Luego pega la imagen directamente en WhatsApp con Ctrl+V
                </p>

                <div className="border-t border-gray-200 pt-3">
                  <button
                    onClick={() => setShowWAInput(!showWAInput)}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    <Send size={15} />
                    {showWAInput ? 'Ocultar' : 'Enviar por WhatsApp'}
                  </button>

                  {showWAInput && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+</span>
                          <input
                            type="tel"
                            placeholder="5493881234567"
                            value={whatsappNum}
                            onChange={e => setWhatsappNum(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                          />
                        </div>
                        <button
                          onClick={handleSendWhatsApp}
                          disabled={!whatsappNum.trim()}
                          className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          Enviar
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">Solo numeros, con codigo de pais y area. Ej: 5493881234567</p>
                      <p className="text-xs text-green-600 font-medium">Abre directamente en WhatsApp Web</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setPayingOrder(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
              >
                <CheckCheck size={18} /> Confirmar Cobro — ${Number(payingOrder.total).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Pedido #{String(viewingOrder.id).padStart(4, '0')}</h3>
                <p className="text-sm text-gray-400">{formatDate(viewingOrder.createdAt)}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="flex gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[viewingOrder.status]?.color ?? statusConfig.pending.color}`}>
                  {statusConfig[viewingOrder.status]?.icon}
                  {statusConfig[viewingOrder.status]?.label}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  viewingOrder.type === 'dine-in' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {viewingOrder.type === 'dine-in' ? `Mesa ${viewingOrder.tableNumber}` : 'Para llevar'}
                </span>
                {viewingOrder.paymentMethod && (
                  <span className="text-sm px-3 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600">
                    {getPaymentEmoji(viewingOrder.paymentMethod)} {getPaymentLabel(viewingOrder.paymentMethod)}
                  </span>
                )}
              </div>

              {viewingOrder.customerName && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                  <User size={16} className="text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-400">Cliente</p>
                    <p className="text-sm font-medium text-gray-700">{viewingOrder.customerName}</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Detalle del pedido</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {((viewingOrder.items ?? []) as any[]).length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-2">Sin detalle de productos</p>
                ) : (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {((viewingOrder.items ?? []) as any[]).map((item, i) => {
                      const nombre   = getProductName(item);
                      const imagen   = getProductImage(item);
                      const precio   = getProductPrice(item);
                      const subtotal = getItemSubtotal(item);
                      const qty      = item?.quantity ?? 1;
                      return (
                        <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-200 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl w-8 text-center">{imagen}</span>
                            <div>
                              <p className="font-medium text-gray-800">{nombre}</p>
                              <p className="text-xs text-gray-400">{qty} x ${Number(precio).toFixed(2)}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-800">${Number(subtotal).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between items-center mt-4 pt-3 border-t-2 border-gray-200">
                  <span className="font-bold text-gray-800 text-base">Total</span>
                  <span className="font-bold text-amber-600 text-xl">${Number(viewingOrder.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {getNextStatus(viewingOrder) && (
                  <button
                    onClick={() => { onUpdateStatus(viewingOrder.id, getNextStatus(viewingOrder)!); setViewingOrder(null); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                  >
                    <ArrowRight size={16} /> Pasar a {statusConfig[getNextStatus(viewingOrder)!]?.label}
                  </button>
                )}
                {showCobrar(viewingOrder) && (
                  <button
                    onClick={() => { openPayModal(viewingOrder); setViewingOrder(null); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                  >
                    <CreditCard size={16} /> Cobrar
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100">
              <button onClick={() => setViewingOrder(null)} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
