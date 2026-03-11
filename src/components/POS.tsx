import { useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Hash, X, CheckCircle } from 'lucide-react';
import { Category, Product, OrderItem, Order, Table } from '../types';

// Detecta si un string es un emoji real o texto plano
function isRealEmoji(str: string): boolean {
  if (!str || str.trim() === '') return false;
  const cleaned = str.trim();
  return [...cleaned].some(c => (c.codePointAt(0) ?? 0) > 127) && cleaned.length <= 10;
}

// Genera emoji por nombre del producto
function getEmojiByName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('café') || n.includes('cafe') || n.includes('espresso') || n.includes('latte') || n.includes('capuchino') || n.includes('cappuccino')) return '☕';
  if (n.includes('té') || n.includes('te ') || n.includes('infusion') || n.includes('manzanilla') || n.includes('verde')) return '🍵';
  if (n.includes('jugo') || n.includes('zumo') || n.includes('limonada') || n.includes('naranja')) return '🧃';
  if (n.includes('agua')) return '💧';
  if (n.includes('leche')) return '🥛';
  if (n.includes('chocolate') && !n.includes('café')) return '🍫';
  if (n.includes('torta') || n.includes('pastel') || n.includes('cake')) return '🎂';
  if (n.includes('tarta') || n.includes('cheesecake')) return '🍰';
  if (n.includes('cupcake') || n.includes('muffin')) return '🧁';
  if (n.includes('medialuna') || n.includes('croissant')) return '🥐';
  if (n.includes('pan') || n.includes('bread')) return '🍞';
  if (n.includes('sandwich') || n.includes('sándwich')) return '🥪';
  if (n.includes('ensalada') || n.includes('salad')) return '🥗';
  if (n.includes('helado') || n.includes('ice cream')) return '🍦';
  if (n.includes('galleta') || n.includes('cookie')) return '🍪';
  if (n.includes('dona') || n.includes('donut')) return '🍩';
  if (n.includes('desayuno') || n.includes('breakfast') || n.includes('huevo')) return '🍳';
  if (n.includes('batido') || n.includes('smoothie') || n.includes('frappé') || n.includes('frappe')) return '🥤';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('hamburguesa') || n.includes('burger')) return '🍔';
  if (n.includes('fruta') || n.includes('fruit')) return '🍎';
  if (n.includes('waf') || n.includes('pancake')) return '🧇';
  if (n.includes('yogur')) return '🥛';
  if (n.includes('granola') || n.includes('cereal')) return '🥣';
  return '🍽️';
}

// Resuelve el ícono final: si ya es emoji lo usa, si es texto lo convierte
function resolveProductIcon(image: string, name: string): string {
  if (!image || image.trim() === '') return getEmojiByName(name);
  if (isRealEmoji(image)) return image.trim();
  // Es texto plano como "coffee" → usar nombre del producto para el emoji
  return getEmojiByName(name);
}

interface POSProps {
  categories: Category[];
  products: Product[];
  tables: Table[];
  onCreateOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
}

export default function POS({ categories, products, tables, onCreateOrder }: POSProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch && p.available;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    if (orderType === 'dine-in' && !selectedTable) return;

    onCreateOrder({
      items: cart,
      tableNumber: orderType === 'dine-in' ? selectedTable : null,
      status: 'pending',
      type: orderType,
      total,
      customerName: customerName || undefined,
    });

    setCart([]);
    setCustomerName('');
    setSelectedTable(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const availableTables = tables.filter((t) => t.status === 'available');

  return (
    <div className="flex h-full">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle size={20} />
          <span className="font-medium">¡Pedido creado exitosamente!</span>
        </div>
      )}

      {/* Products Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Punto de Venta</h2>
          <p className="text-gray-500 text-sm mt-1">Selecciona productos para crear un pedido</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            const inCart = cart.find((item) => item.product.id === product.id);
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className={`relative bg-white border rounded-xl p-4 text-left transition-all hover:shadow-md hover:border-amber-300 active:scale-95 ${
                  inCart ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-200'
                }`}
              >
                {inCart && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md">
                    {inCart.quantity}
                  </span>
                )}
                <div className="text-3xl mb-2">{resolveProductIcon(product.image, product.name)}</div>
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">{product.name}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.description}</p>
                <p className="text-amber-600 font-bold mt-2">${product.price}</p>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No se encontraron productos</p>
            <p className="text-sm mt-1">Intenta con otra búsqueda o categoría</p>
          </div>
        )}
      </div>

      {/* Cart Panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-amber-600" />
            <h3 className="font-bold text-gray-800">Pedido Actual</h3>
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {itemCount} items
            </span>
          </div>
        </div>

        {/* Order Type Toggle */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                orderType === 'dine-in'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              En Mesa
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                orderType === 'takeaway'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Para Llevar
            </button>
          </div>
        </div>

        {/* Customer & Table */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Nombre del cliente (opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>
          {orderType === 'dine-in' && (
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedTable ?? ''}
                onChange={(e) => setSelectedTable(e.target.value ? Number(e.target.value) : null)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm appearance-none"
              >
                <option value="">Seleccionar mesa...</option>
                {availableTables.map((t) => (
                  <option key={t.id} value={t.number}>
                    Mesa {t.number} ({t.seats} asientos)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">El carrito está vacío</p>
              <p className="text-xs mt-1">Agrega productos del menú</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
              >
                <span className="text-xl">{resolveProductIcon(item.product.image, item.product.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">${item.product.price} c/u</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-200 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-800 w-16 text-right">
                  ${item.product.price * item.quantity}
                </p>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total & Submit */}
        <div className="p-4 border-t border-gray-200 space-y-3 bg-gray-50">
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${total.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-800">
              <span>Total</span>
              <span className="text-amber-600">${total.toLocaleString('es-MX')}</span>
            </div>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={cart.length === 0 || (orderType === 'dine-in' && !selectedTable)}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/30 disabled:shadow-none flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Crear Pedido
          </button>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 size={14} />
              Vaciar carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
