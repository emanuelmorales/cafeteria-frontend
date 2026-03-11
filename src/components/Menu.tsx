import { useState } from 'react';
import { Search, Plus, Edit2, ToggleLeft, ToggleRight, X, Save, DollarSign } from 'lucide-react';
import { Category, Product } from '../types';

interface MenuProps {
  categories: Category[];
  products: Product[];
  onToggleAvailability: (productId: number) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
}

const EMOJI_GROUPS = [
  {
    group: '☕ Bebidas Calientes',
    emojis: ['☕', '🍵', '🧉', '🫖', '🍶', '🥛', '🫗', '🧋'],
  },
  {
    group: '🥤 Bebidas Frías',
    emojis: ['🥤', '🧃', '🍹', '🍸', '🍺', '🧊', '🍷', '🫧'],
  },
  {
    group: '🍰 Postres y Dulces',
    emojis: ['🍰', '🎂', '🧁', '🍩', '🍪', '🍫', '🍬', '🍭', '🍮', '🍯', '🧇', '🥧'],
  },
  {
    group: '🥐 Panadería',
    emojis: ['🥐', '🥖', '🍞', '🥨', '🧀', '🥯', '🫓', '🥞'],
  },
  {
    group: '🥪 Comida',
    emojis: ['🥪', '🌯', '🫔', '🥙', '🌮', '🌭', '🍔', '🍟', '🍕', '🫕', '🥗', '🫙'],
  },
  {
    group: '🍳 Desayunos',
    emojis: ['🍳', '🥚', '🧆', '🥓', '🥩', '🍗', '🍖', '🫘'],
  },
  {
    group: '🍎 Frutas',
    emojis: ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥝', '🍌', '🍉', '🍈', '🍏', '🍐'],
  },
  {
    group: '🥦 Vegetales',
    emojis: ['🥦', '🥕', '🌽', '🥑', '🍅', '🧅', '🧄', '🥔', '🫛', '🥬', '🫑', '🌶️'],
  },
  {
    group: '🍜 Platos',
    emojis: ['🍜', '🍝', '🍲', '🍛', '🍣', '🍱', '🍤', '🦐', '🍙', '🍚', '🥘', '🫕'],
  },
  {
    group: '🌟 Especiales',
    emojis: ['⭐', '🌟', '💫', '✨', '🎉', '🎊', '🏆', '🥇', '💎', '👑', '🎁', '🔥'],
  },
];

const ALL_EMOJIS = EMOJI_GROUPS.flatMap((g) => g.emojis);

// Detecta si un string es emoji real o texto plano
function isRealEmoji(str: string): boolean {
  if (!str || str.trim() === '') return false;
  return [...str.trim()].some(c => (c.codePointAt(0) ?? 0) > 127) && str.trim().length <= 10;
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
  if (n.includes('granola') || n.includes('cereal')) return '🥣';
  return '🍽️';
}

// Resuelve el ícono: si ya es emoji lo usa, si es texto lo convierte por nombre
function resolveProductIcon(image: string, name: string): string {
  if (!image || image.trim() === '') return getEmojiByName(name);
  if (isRealEmoji(image)) return image.trim();
  return getEmojiByName(name);
}

export default function Menu({ categories, products, onToggleAvailability, onAddProduct, onEditProduct }: MenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [activeEmojiGroup, setActiveEmojiGroup] = useState<string>('Todos');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: 1,
    image: '☕',
    description: '',
  });

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setEmojiSearch('');
    setActiveEmojiGroup('Todos');
    setFormData({ name: '', price: '', categoryId: categories[0]?.id || 1, image: '☕', description: '' });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEmojiSearch('');
    setActiveEmojiGroup('Todos');
    setFormData({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId,
      image: resolveProductIcon(product.image, product.name),
      description: product.description,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price) return;
    if (editingProduct) {
      onEditProduct({
        ...editingProduct,
        name: formData.name,
        price: Number(formData.price),
        categoryId: formData.categoryId,
        image: formData.image,
        description: formData.description,
      });
    } else {
      onAddProduct({
        name: formData.name,
        price: Number(formData.price),
        categoryId: formData.categoryId,
        image: formData.image,
        description: formData.description,
        available: true,
      });
    }
    setShowModal(false);
  };

  const getFilteredEmojis = () => {
    if (emojiSearch.trim()) {
      return ALL_EMOJIS.filter((e) => e.includes(emojiSearch));
    }
    if (activeEmojiGroup === 'Todos') return ALL_EMOJIS;
    return EMOJI_GROUPS.find((g) => g.group === activeEmojiGroup)?.emojis || [];
  };

  const getCategoryName = (id: number) => categories.find((c) => c.id === id)?.name || '';
  const getProductImage = (product: Product) => resolveProductIcon(product.image, product.name);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Menú</h2>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos registrados</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-md"
        >
          <Plus size={18} />
          Agregar Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              !selectedCategory ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Producto</th>
              <th className="text-left p-4 font-medium text-gray-500">Categoría</th>
              <th className="text-left p-4 font-medium text-gray-500">Precio</th>
              <th className="text-left p-4 font-medium text-gray-500">Estado</th>
              <th className="text-right p-4 font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredProducts.map((product) => (
              <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${!product.available ? 'opacity-60' : ''}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-amber-50 rounded-xl">
                      {getProductImage(product)}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                    {getCategoryName(product.categoryId)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-bold text-gray-800">${product.price.toFixed(2)}</span>
                </td>
                <td className="p-4">
                  <button onClick={() => onToggleAvailability(product.id)} className="flex items-center gap-2">
                    {product.available ? (
                      <>
                        <ToggleRight size={24} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-medium">Disponible</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={24} className="text-gray-400" />
                        <span className="text-xs text-gray-400 font-medium">No disponible</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => openEditModal(product)}
                    className="text-gray-400 hover:text-amber-600 transition-colors p-1"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🍽️</p>
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Preview del ícono seleccionado */}
              <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-5xl">{formData.image}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{formData.name || 'Nombre del producto'}</p>
                  <p className="text-xs text-gray-400">{formData.description || 'Descripción'}</p>
                  <p className="text-amber-600 font-bold text-sm">${formData.price || '0.00'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  placeholder="Descripción breve"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selector de íconos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícono del producto <span className="text-amber-500 font-bold">{formData.image}</span>
                </label>

                {/* Buscador de íconos */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={emojiSearch}
                    onChange={(e) => { setEmojiSearch(e.target.value); setActiveEmojiGroup('Todos'); }}
                    className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="Buscar ícono..."
                  />
                </div>

                {/* Filtros por grupo */}
                {!emojiSearch && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    <button
                      onClick={() => setActiveEmojiGroup('Todos')}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        activeEmojiGroup === 'Todos'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                    </button>
                    {EMOJI_GROUPS.map((g) => (
                      <button
                        key={g.group}
                        onClick={() => setActiveEmojiGroup(g.group)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                          activeEmojiGroup === g.group
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {g.group.split(' ')[0]} {g.group.split(' ').slice(1).join(' ')}
                      </button>
                    ))}
                  </div>
                )}

                {/* Grid de íconos */}
                <div className="border border-gray-200 rounded-xl p-2 bg-gray-50 max-h-44 overflow-y-auto">
                  <div className="flex flex-wrap gap-1">
                    {getFilteredEmojis().map((emoji, idx) => (
                      <button
                        key={`${emoji}-${idx}`}
                        onClick={() => setFormData({ ...formData, image: emoji })}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110 ${
                          formData.image === emoji
                            ? 'bg-amber-200 ring-2 ring-amber-500 scale-110'
                            : 'bg-white hover:bg-amber-50'
                        }`}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                    {getFilteredEmojis().length === 0 && (
                      <p className="text-gray-400 text-sm p-2">No se encontraron íconos</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {ALL_EMOJIS.length} íconos disponibles • Seleccionado: {formData.image}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.price}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
