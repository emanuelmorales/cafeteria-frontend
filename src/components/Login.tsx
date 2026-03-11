import { useState } from 'react';
import { Eye, EyeOff, Coffee, Lock, User, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const COFFEE_FACTS = [
  'El café es la segunda bebida más consumida en el mundo.',
  'Un barista experto puede preparar hasta 400 cafés por hora.',
  'El aroma del café activa áreas del cerebro relacionadas con el placer.',
  'El espresso tiene menos cafeína que el café filtrado.',
  'El café fue descubierto en Etiopía hace más de 1,000 años.',
  'La palabra "espresso" significa "expresado" en italiano.',
  'El café verde tiene antioxidantes que se pierden al tostarlo.',
  'Brasil produce el 40% del café del mundo.',
];

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [fact] = useState(() => COFFEE_FACTS[Math.floor(Math.random() * COFFEE_FACTS.length)]);

  // NO limpiar sesión aquí — se maneja desde App.tsx

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      setBackendStatus('online');

      if (response.ok) {
        const data = await response.json();
        // El backend puede devolver { user: {...} } o directamente { id, role, ... }
        const userData = data.user || data;

        // Mapear el rol que viene del backend Django
        const rawRole = (userData.role || userData.group || '').toLowerCase();
        let mappedRole: 'admin' | 'cashier' | 'waiter' = 'cashier';
        if (
          rawRole === 'admin' ||
          rawRole === 'administrator' ||
          rawRole === 'administrador' ||
          rawRole === 'administradores' ||
          userData.is_superuser === true ||
          userData.is_staff === true
        ) {
          mappedRole = 'admin';
        } else if (
          rawRole === 'waiter' ||
          rawRole === 'mesero' ||
          rawRole === 'meseros'
        ) {
          mappedRole = 'waiter';
        } else {
          mappedRole = 'cashier';
        }

        const fullName = userData.full_name ||
          (userData.first_name
            ? `${userData.first_name} ${userData.last_name || ''}`.trim()
            : userData.username || username);

        const user: UserType = {
          id: userData.id || 1,
          firstName: userData.first_name || fullName.split(' ')[0] || username,
          lastName: userData.last_name || fullName.split(' ').slice(1).join(' ') || '',
          username: userData.username || username,
          role: mappedRole,
          email: userData.email || '',
          isActive: true,
        };
        if (data.token) {
          localStorage.setItem('cafeteria_token', data.token);
        }
        localStorage.setItem('cafeteria_user', JSON.stringify(user));
        onLogin(user);
        return;
      } else if (response.status === 401 || response.status === 400) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || data.detail || 'Usuario o contraseña incorrectos.');
        setLoading(false);
        return;
      } else {
        setError('Error del servidor. Intenta nuevamente.');
        setLoading(false);
        return;
      }
    } catch {
      setBackendStatus('offline');
      setError('No se puede conectar al servidor Django. Asegúrate de que el backend esté corriendo en http://localhost:8000');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 flex-col items-center justify-center p-12">
        {/* Círculos decorativos */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-700/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-800/40 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-amber-600/20 rounded-full translate-x-1/2" />

        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 gap-4 p-4 h-full">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="flex items-center justify-center text-2xl">☕</div>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-amber-500 p-5 rounded-3xl shadow-2xl shadow-amber-900/50">
              <Coffee size={56} className="text-white" />
            </div>
          </div>

          <h1 className="text-6xl font-black text-white mb-3 leading-tight">
            Café
            <span className="text-amber-400"> & Co.</span>
          </h1>
          <p className="text-amber-200 text-xl font-light mb-12">
            Sistema de Gestión de Cafetería
          </p>

          {/* Separador */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-amber-700" />
            <Coffee size={16} className="text-amber-500" />
            <div className="flex-1 h-px bg-amber-700" />
          </div>

          {/* Stats decorativas */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { value: '100%', label: 'Productos frescos' },
              { value: '24/7', label: 'Disponible' },
              { value: '∞', label: 'Sabores' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
                <p className="text-xs text-amber-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Dato curioso */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-left border border-amber-700/50">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-2">
              ☕ ¿Sabías que...?
            </p>
            <p className="text-amber-100 text-sm leading-relaxed italic">
              "{fact}"
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/30 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-200/30 rounded-full -translate-x-1/2 translate-y-1/2" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo móvil */}
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg mr-3">
              <Coffee size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-amber-900">Café & Co.</h1>
              <p className="text-amber-600 text-sm">Sistema de Gestión</p>
            </div>
          </div>

          {/* Tarjeta del formulario */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 p-8 border border-amber-100">
            {/* Encabezado */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/30 mb-4">
                <Coffee size={30} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Bienvenido</h2>
              <p className="text-gray-500 text-sm mt-1">
                Inicia sesión para acceder al sistema
              </p>
            </div>

            {/* Estado del backend */}
            {backendStatus !== 'unknown' && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 mb-5 text-sm font-medium ${
                backendStatus === 'online'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {backendStatus === 'online'
                  ? <><Wifi size={16} /> Conectado al servidor</>
                  : <><WifiOff size={16} /> Sin conexión al servidor</>
                }
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Error de acceso</p>
                  <p>{error}</p>
                  {backendStatus === 'offline' && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="font-semibold text-xs mb-1">¿Cómo iniciar el servidor?</p>
                      <code className="text-xs bg-red-100 rounded px-2 py-1 block">
                        cd cafeteria_backend<br />
                        venv\Scripts\activate<br />
                        python manage.py runserver
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Usuario */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); setBackendStatus('unknown'); }}
                    placeholder="Ingresa tu usuario"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-amber-50/30 transition-all text-gray-800 placeholder-gray-400 bg-gray-50"
                    disabled={loading}
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); setBackendStatus('unknown'); }}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-amber-50/30 transition-all text-gray-800 placeholder-gray-400 bg-gray-50"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <Coffee size={20} />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-xs text-amber-700 text-center">
                💡 Usa las credenciales creadas en el panel de administración de Django
              </p>
              <p className="text-xs text-amber-600 text-center mt-1">
                <a href="http://localhost:8000/admin" target="_blank" rel="noreferrer" className="underline hover:text-amber-800">
                  http://localhost:8000/admin
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-amber-700/60 mt-6">
            © 2024 Café & Co. — Sistema de Gestión de Cafetería
          </p>
        </div>
      </div>
    </div>
  );
}
