import { Product, Order, Table, Category } from '../types';

const API_BASE = 'http://localhost:8000/api';

// ============================================================
// Estado de conexión
// ============================================================
let isConnected = false;

export function getConnectionStatus(): boolean {
  return isConnected;
}

export async function checkConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/categories/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      headers: { Accept: 'application/json' },
    });
    isConnected = response.status < 500;
    return isConnected;
  } catch {
    isConnected = false;
    return false;
  }
}

// ============================================================
// Helper para peticiones — muestra el error exacto del servidor
// ============================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Leer el cuerpo del error para mostrarlo exactamente
    let errorDetail = '';
    try {
      const errorBody = await response.json();
      // Django REST Framework devuelve errores como objetos
      errorDetail = JSON.stringify(errorBody, null, 2);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(`HTTP ${response.status}: ${errorDetail}`);
  }

  if (response.status === 204) return null as T;
  return response.json();
}

// ============================================================
// Transformadores: API Django → Frontend
// ============================================================
function transformCategory(api: AnyRecord): Category {
  return {
    id: api.id,
    name: api.name || '',
    icon: api.icon || '☕',
  };
}

// Convierte nombres de texto a emojis (por si Django guardó texto en vez de emoji)
const IMAGE_TEXT_TO_EMOJI: Record<string, string> = {
  coffee: '☕', cafe: '☕', espresso: '☕', latte: '☕', cappuccino: '☕', capuchino: '☕',
  tea: '🍵', te: '🍵', infusion: '🍵',
  juice: '🧃', jugo: '🧃', zumo: '🧃', limonada: '🧃',
  water: '💧', agua: '💧',
  milk: '🥛', leche: '🥛',
  chocolate: '🍫',
  cake: '🎂', torta: '🎂', pastel: '🎂',
  cupcake: '🧁', muffin: '🧁',
  bread: '🥐', pan: '🥐', croissant: '🥐', medialuna: '🥐',
  sandwich: '🥪', sándwich: '🥪',
  salad: '🥗', ensalada: '🥗',
  icecream: '🍦', helado: '🍦',
  cookie: '🍪', galleta: '🍪',
  donut: '🍩', dona: '🍩',
  breakfast: '🍳', desayuno: '🍳',
  smoothie: '🥤', batido: '🥤',
  pizza: '🍕',
  burger: '🍔', hamburguesa: '🍔',
  fries: '🍟', papas: '🍟',
  wine: '🍷', vino: '🍷',
  beer: '🍺', cerveza: '🍺',
  cocktail: '🍹', coctel: '🍹',
  fruit: '🍎', fruta: '🍎',
  default: '🍽️',
};

function resolveImage(rawImage: string, productName: string): string {
  if (!rawImage || rawImage.trim() === '') return getAutoEmoji(productName);

  const cleaned = rawImage.trim();

  // Detectar si es emoji: contiene caracteres unicode fuera del rango ASCII básico
  // y tiene longitud corta (emojis son 1-4 caracteres en display)
  const hasNonAscii = [...cleaned].some(c => c.codePointAt(0)! > 127);
  const isShort = cleaned.length <= 10;
  if (hasNonAscii && isShort) return cleaned;

  // Es texto plano (como "coffee", "tea", "sandwich") → convertir a emoji
  const key = cleaned.toLowerCase();

  // Búsqueda exacta
  if (IMAGE_TEXT_TO_EMOJI[key]) return IMAGE_TEXT_TO_EMOJI[key];

  // Búsqueda parcial (ej: "hot_coffee" contiene "coffee")
  for (const [word, emoji] of Object.entries(IMAGE_TEXT_TO_EMOJI)) {
    if (key.includes(word) && word !== 'default') return emoji;
  }

  // Usar el nombre del producto como último recurso
  return getAutoEmoji(productName);
}

function getAutoEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('café') || n.includes('cafe') || n.includes('espresso') || n.includes('latte') || n.includes('capuchino') || n.includes('cappuccino')) return '☕';
  if (n.includes('té') || n.includes('te ') || n.includes('infusion')) return '🍵';
  if (n.includes('jugo') || n.includes('zumo') || n.includes('limonada')) return '🧃';
  if (n.includes('agua')) return '💧';
  if (n.includes('leche')) return '🥛';
  if (n.includes('chocolate') && !n.includes('café')) return '🍫';
  if (n.includes('torta') || n.includes('pastel') || n.includes('cake')) return '🎂';
  if (n.includes('cupcake') || n.includes('muffin')) return '🧁';
  if (n.includes('medialuna') || n.includes('croissant')) return '🥐';
  if (n.includes('pan') || n.includes('bread')) return '🍞';
  if (n.includes('sandwich') || n.includes('sándwich')) return '🥪';
  if (n.includes('ensalada')) return '🥗';
  if (n.includes('helado') || n.includes('ice cream')) return '🍦';
  if (n.includes('galleta') || n.includes('cookie')) return '🍪';
  if (n.includes('dona') || n.includes('donut')) return '🍩';
  if (n.includes('desayuno') || n.includes('breakfast')) return '🍳';
  if (n.includes('batido') || n.includes('smoothie')) return '🥤';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('hamburguesa') || n.includes('burger')) return '🍔';
  if (n.includes('tarta') || n.includes('cheesecake')) return '🍰';
  if (n.includes('fruta')) return '🍎';
  return '🍽️';
}

function transformProduct(api: AnyRecord): Product {
  return {
    id: api.id,
    name: api.name || '',
    price: parseFloat(api.price || 0),
    categoryId:
      api.categoryId ??
      api.category_id ??
      (typeof api.category === 'number' ? api.category : api.category?.id) ??
      null,
    // Resuelve el emoji correctamente aunque Django haya guardado texto
    image: resolveImage(api.image || '', api.name || ''),
    description: api.description || '',
    available: api.available ?? true,
  };
}

function transformTable(api: AnyRecord): Table {
  return {
    id: api.id,
    number: api.number ?? api.id,
    seats: api.seats ?? api.capacity ?? 4,
    status: (api.status || 'available') as Table['status'],
    currentOrderId: api.current_order_id ?? undefined,
  };
}

function transformOrderItem(item: AnyRecord): Order['items'][0] {
  // El serializer Django devuelve campos planos:
  // { productId, productName, productImage, quantity, price, notes }
  // O anidado: { product: { id, name, image, price }, quantity, notes }

  let name  = '';
  let image = '';
  let price = 0;
  let id    = 0;

  // Formato plano (OrderItemReadSerializer de Django)
  if (item.productName) {
    name  = item.productName;
    image = resolveImage(item.productImage || '', item.productName || '');
    price = parseFloat(item.unitPrice ?? item.unit_price ?? item.price ?? 0);
    id    = item.productId ?? item.product_id ?? 0;
  }
  // Formato anidado { product: { id, name, image, price } }
  else if (item.product && typeof item.product === 'object') {
    name  = item.product.name  || '';
    image = resolveImage(item.product.image || '', item.product.name || '');
    price = parseFloat(item.product.price ?? 0);
    id    = item.product.id    ?? 0;
  }
  // Formato plano alternativo
  else {
    name  = item.product_name  || item.name  || '';
    image = resolveImage(item.product_image || item.image || '', name);
    price = parseFloat(item.price ?? item.unit_price ?? 0);
    id    = item.product_id    ?? item.product ?? 0;
  }

  const product: Product = {
    id,
    name,
    price,
    image,
    categoryId:  0,
    description: '',
    available:   true,
  };

  return {
    product,
    quantity: item.quantity ?? 1,
    notes:    item.notes   ?? '',
  };
}

function transformOrder(api: AnyRecord): Order {
  const items = Array.isArray(api.items) ? api.items.map(transformOrderItem) : [];

  // Tipo de pedido
  const rawType = api.type ?? api.order_type ?? 'dine-in';
  const typeMap: Record<string, Order['type']> = {
    'dine-in': 'dine-in',
    dine_in: 'dine-in',
    dinein: 'dine-in',
    takeaway: 'takeaway',
    take_away: 'takeaway',
    'take-away': 'takeaway',
  };
  const orderType: Order['type'] = typeMap[rawType] ?? 'dine-in';

  // Estado
  const rawStatus = api.status ?? 'pending';
  const statusMap: Record<string, Order['status']> = {
    pending: 'pending',
    pendiente: 'pending',
    preparing: 'preparing',
    preparando: 'preparing',
    ready: 'ready',
    listo: 'ready',
    delivered: 'delivered',
    entregado: 'delivered',
    paid: 'paid',
    cobrado: 'paid',
    pagado: 'paid',
    cancelled: 'cancelled',
    cancelado: 'cancelled',
  };
  const orderStatus: Order['status'] = statusMap[rawStatus] ?? 'pending';

  return {
    id: api.id,
    items,
    tableNumber: api.table_number ?? null,
    status: orderStatus,
    type: orderType,
    total: parseFloat(api.total ?? 0),
    createdAt: new Date(api.created_at ?? api.createdAt ?? Date.now()),
    customerName: api.customer_name ?? api.customerName ?? '',
    paymentMethod: api.payment_method ?? api.paymentMethod ?? undefined,
  };
}

// ============================================================
// API Categorías
// ============================================================
export async function fetchCategories(): Promise<Category[]> {
  const data = await request<AnyRecord[]>('/categories/');
  return Array.isArray(data) ? data.map(transformCategory) : [];
}

// ============================================================
// API Productos
// ============================================================
export async function fetchProducts(): Promise<Product[]> {
  const data = await request<AnyRecord[]>('/products/');
  return Array.isArray(data) ? data.map(transformProduct) : [];
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const body = {
    name: product.name,
    price: product.price,
    category: product.categoryId,
    category_id: product.categoryId,
    image: product.image || '🍽️',
    description: product.description,
    available: product.available,
  };
  const data = await request<AnyRecord>('/products/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return transformProduct(data);
}

export async function updateProduct(product: Product): Promise<Product> {
  const body = {
    name: product.name,
    price: product.price,
    category: product.categoryId,
    category_id: product.categoryId,
    image: product.image || '🍽️',
    description: product.description,
    available: product.available,
  };
  const data = await request<AnyRecord>(`/products/${product.id}/`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return transformProduct(data);
}

export async function toggleProductAvailability(productId: number): Promise<Product> {
  try {
    const data = await request<AnyRecord>(`/products/${productId}/toggle_availability/`, {
      method: 'POST',
    });
    return transformProduct(data);
  } catch {
    const current = await request<AnyRecord>(`/products/${productId}/`);
    const data = await request<AnyRecord>(`/products/${productId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ available: !current.available }),
    });
    return transformProduct(data);
  }
}

// ============================================================
// API Pedidos
// ============================================================
export async function fetchOrders(): Promise<Order[]> {
  const data = await request<AnyRecord[]>('/orders/');
  return Array.isArray(data) ? data.map(transformOrder) : [];
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const body = {
    items: orderData.items.map((item) => ({
      product: item.product.id,
      quantity: item.quantity,
      notes: item.notes || '',
    })),
    table_number: orderData.tableNumber ?? null,
    type: orderData.type,
    status: 'pending',
    total: orderData.total,
    customer_name: orderData.customerName || '',
  };

  console.log('[API] Creando pedido:', JSON.stringify(body, null, 2));

  const data = await request<AnyRecord>('/orders/', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  console.log('[API] Respuesta del servidor:', data);

  const transformed = transformOrder(data);

  // Si el servidor no devuelve los items completos, los ponemos manualmente
  if (!transformed.items.length && orderData.items.length) {
    transformed.items = orderData.items;
  }

  // El backend Django actualiza automáticamente el estado de la mesa
  // No es necesario hacer una segunda petición desde el frontend

  return transformed;
}

export async function updateOrderStatus(orderId: number, status: Order['status'], paymentMethod?: string): Promise<void> {
  const body: Record<string, string> = { status };
  if (paymentMethod) body.payment_method = paymentMethod;
  try {
    await request(`/orders/${orderId}/update_status/`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch {
    await request(`/orders/${orderId}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

// ============================================================
// API Mesas
// ============================================================
export async function fetchTables(): Promise<Table[]> {
  const data = await request<AnyRecord[]>('/tables/');
  return Array.isArray(data) ? data.map(transformTable) : [];
}

export async function updateTableStatus(tableId: number, status: Table['status']): Promise<Table> {
  try {
    const data = await request<AnyRecord>(`/tables/${tableId}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    return transformTable(data);
  } catch {
    const data = await request<AnyRecord>(`/tables/${tableId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return transformTable(data);
  }
}

// ============================================================
// API Autenticación
// ============================================================
export async function loginUser(username: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(err.error || `Error ${response.status}`);
  }

  return response.json();
}

// ============================================================
// API Usuarios
// ============================================================
export async function fetchUsers() {
  return request<AnyRecord[]>('/users/');
}

export async function createUser(data: AnyRecord) {
  return request<AnyRecord>('/users/', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateUser(id: number, data: AnyRecord) {
  return request<AnyRecord>(`/users/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteUser(id: number) {
  return request<null>(`/users/${id}/`, { method: 'DELETE' });
}
