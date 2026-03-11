import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Edit2, Trash2, Shield, Coffee, Eye, EyeOff, X, Check, AlertCircle, Loader2, RefreshCw, Lock } from 'lucide-react';
import { User } from '../types';

interface UserData {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'cashier' | 'waiter';
  is_active: boolean;
  date_joined?: string;
  last_login?: string;
}

interface UsersProps {
  currentUser: User;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  cashier: 'Cajero',
  waiter: 'Mesero',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  cashier: 'bg-blue-100 text-blue-700 border-blue-200',
  waiter: 'bg-green-100 text-green-700 border-green-200',
};

const ROLE_ICONS: Record<string, string> = {
  admin: '🛡️',
  cashier: '💰',
  waiter: '☕',
};

const API = 'http://localhost:8000/api';

function getToken() {
  return localStorage.getItem('cafeteria_token') || '';
}

function getHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

const emptyForm = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  role: 'cashier' as 'admin' | 'cashier' | 'waiter',
  password: '',
  confirmPassword: '',
  is_active: true,
};

export default function Users({ currentUser }: UsersProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const isAdmin = currentUser.role === 'admin';

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/users/`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 403) {
        setError('No tienes permisos para ver los usuarios.');
      } else {
        setError('Error al cargar usuarios.');
      }
    } catch {
      setError('No se puede conectar al servidor. Verifica que Django esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (user: UserData) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role,
      password: '',
      confirmPassword: '',
      is_active: user.is_active,
    });
    setFormError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError('');

    // Validaciones
    if (!form.username.trim()) return setFormError('El nombre de usuario es obligatorio.');
    if (!form.first_name.trim()) return setFormError('El nombre es obligatorio.');
    if (!editingUser && !form.password) return setFormError('La contraseña es obligatoria para nuevos usuarios.');
    if (form.password && form.password.length < 6) return setFormError('La contraseña debe tener al menos 6 caracteres.');
    if (form.password && form.password !== form.confirmPassword) return setFormError('Las contraseñas no coinciden.');

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        role: form.role,
        is_active: form.is_active,
      };
      if (form.password) body.password = form.password;

      const url = editingUser ? `${API}/users/${editingUser.id}/` : `${API}/users/`;
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await loadUsers();
        setShowModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data.username?.[0] || data.error || data.detail || 'Error al guardar el usuario.';
        setFormError(msg);
      }
    } catch {
      setFormError('No se puede conectar al servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API}/users/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok || res.status === 204) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setDeleteConfirm(null);
      } else {
        alert('Error al eliminar el usuario.');
      }
    } catch {
      alert('No se puede conectar al servidor.');
    }
  };

  const handleToggleActive = async (user: UserData) => {
    try {
      const res = await fetch(`${API}/users/${user.id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      }
    } catch {
      alert('No se puede conectar al servidor.');
    }
  };

  const getInitials = (user: UserData) => {
    const name = `${user.first_name} ${user.last_name}`.trim() || user.username;
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'from-purple-500 to-purple-700',
      cashier: 'from-blue-500 to-blue-700',
      waiter: 'from-green-500 to-green-700',
    };
    return colors[role] || 'from-gray-500 to-gray-700';
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
          <p className="text-gray-500">Solo los administradores pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <UsersIcon size={22} className="text-white" />
            </div>
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-13">
            Administra los empleados y sus accesos al sistema
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 font-medium transition-all"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-medium shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus size={18} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: users.length, icon: '👥', color: 'bg-gray-100 text-gray-700' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: '🛡️', color: 'bg-purple-100 text-purple-700' },
          { label: 'Cajeros', value: users.filter(u => u.role === 'cashier').length, icon: '💰', color: 'bg-blue-100 text-blue-700' },
          { label: 'Meseros', value: users.filter(u => u.role === 'waiter').length, icon: '☕', color: 'bg-green-100 text-green-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-amber-500 mx-auto mb-3" />
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold mb-2">Error al cargar usuarios</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button onClick={loadUsers} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition-all">
            Reintentar
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon size={40} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay usuarios registrados</h3>
          <p className="text-gray-500 text-sm mb-4">Crea el primer usuario para comenzar</p>
          <button onClick={openCreate} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all">
            Crear Usuario
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                !user.is_active ? 'opacity-60 border-gray-200' : 'border-gray-100'
              }`}
            >
              {/* Header de la tarjeta */}
              <div className={`bg-gradient-to-r ${getAvatarColor(user.role)} p-4 flex items-center gap-4`}>
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(user)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-lg leading-tight truncate">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username}
                  </p>
                  <p className="text-white/70 text-sm">@{user.username}</p>
                </div>
                <div className="text-2xl">{ROLE_ICONS[user.role]}</div>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    user.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {user.is_active ? '● Activo' : '● Inactivo'}
                  </span>
                </div>

                {user.email && (
                  <p className="text-xs text-gray-500 mb-3 truncate">📧 {user.email}</p>
                )}

                {/* Acciones */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-medium transition-all"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    disabled={user.id === currentUser.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      user.id === currentUser.id
                        ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400'
                        : user.is_active
                        ? 'bg-orange-50 hover:bg-orange-100 text-orange-700'
                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                    }`}
                  >
                    {user.is_active ? '⏸ Desactivar' : '▶ Activar'}
                  </button>
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() => setDeleteConfirm(user.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Confirmar eliminación */}
                {deleteConfirm === user.id && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-xs text-red-700 font-semibold mb-2 text-center">
                      ¿Eliminar a {user.username}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header modal */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  {editingUser ? <Edit2 size={20} className="text-white" /> : <Plus size={20} className="text-white" />}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {editingUser ? `Editando @${editingUser.username}` : 'Crear cuenta de empleado'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Cuerpo del modal */}
            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Coffee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      placeholder="Nombre"
                      className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-amber-400 text-sm bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Apellido"
                    className="w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-amber-400 text-sm bg-gray-50"
                  />
                </div>
              </div>

              {/* Usuario */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nombre de usuario <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    placeholder="nombre.usuario"
                    className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-amber-400 text-sm bg-gray-50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-amber-400 text-sm bg-gray-50"
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Rol <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'cashier', 'waiter'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm({ ...form, role })}
                      className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                        form.role === role
                          ? ROLE_COLORS[role] + ' border-current'
                          : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{ROLE_ICONS[role]}</span>
                      <span>{ROLE_LABELS[role]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {editingUser ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'} <span className="text-red-500">{!editingUser ? '*' : ''}</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                    className="w-full pl-9 pr-10 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-amber-400 text-sm bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              {form.password && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repetir contraseña"
                      className={`w-full pl-9 pr-10 py-2.5 border-2 rounded-xl focus:outline-none text-sm bg-gray-50 ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? 'border-red-300 focus:border-red-400'
                          : form.confirmPassword && form.password === form.confirmPassword
                          ? 'border-green-300 focus:border-green-400'
                          : 'border-gray-100 focus:border-amber-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {form.confirmPassword && (
                      <div className="absolute right-9 top-1/2 -translate-y-1/2">
                        {form.password === form.confirmPassword
                          ? <Check size={16} className="text-green-500" />
                          : <X size={16} className="text-red-500" />
                        }
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estado activo */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <Coffee size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-gray-700">Usuario activo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`relative w-12 h-6 rounded-full transition-all ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border-2 border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><Loader2 size={18} className="animate-spin" /> Guardando...</>
                  ) : (
                    <><Check size={18} /> {editingUser ? 'Guardar cambios' : 'Crear usuario'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
