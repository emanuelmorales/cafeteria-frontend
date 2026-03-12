import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import POS from "./components/POS";
import Menu from "./components/Menu";
import Orders from "./components/Orders";
import Tables from "./components/Tables";
import DjangoGuide from "./components/DjangoGuide";
import Diagnostics from "./components/Diagnostics";
import Users from "./components/Users";
import Login from "./components/Login";

import { Page, Product, Order, Table, Category, User } from "./types";
import * as api from "./services/api";
import "./index.css";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  Cloud,
  ServerCrash,
  Coffee,
  AlertTriangle,
} from "lucide-react";

// ============================================================
// Pantalla: Django no disponible
// ============================================================
function ServerOffScreen({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center max-w-md px-6">
        {/* Ícono */}
        <div className="relative inline-block mb-6">
          <div className="bg-red-100 p-6 rounded-3xl">
            <ServerCrash size={56} className="text-red-500" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-2">
            <Coffee size={18} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          No se puede conectar al servidor
        </h1>
        <p className="text-gray-500 mb-6">
          El sistema requiere que el servidor Django esté corriendo para
          funcionar. Todos los datos se guardan en la base de datos SQLite del
          backend.
        </p>

        {/* Instrucciones */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 text-left mb-6 shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Para iniciar el servidor:
          </p>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              <span>
                Abre una terminal en la carpeta{" "}
                <code className="bg-gray-100 px-1 rounded">
                  cafeteria_backend/
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </span>
              <span>Activa el entorno virtual:</span>
            </li>
            <li className="ml-7">
              <code className="block bg-gray-900 text-green-400 px-3 py-1.5 rounded-lg text-xs">
                venv\Scripts\activate
              </code>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </span>
              <span>Inicia el servidor:</span>
            </li>
            <li className="ml-7">
              <code className="block bg-gray-900 text-green-400 px-3 py-1.5 rounded-lg text-xs">
                python manage.py runserver
              </code>
            </li>
          </ol>
        </div>

        <div className="flex items-center gap-2 justify-center text-xs text-gray-400 mb-6">
          <Wifi size={14} />
          <span>
            Conectando a: <strong>http://localhost:8000/api/</strong>
          </span>
        </div>

        <button
          onClick={onRetry}
          disabled={retrying}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-amber-500/30"
        >
          <RefreshCw size={18} className={retrying ? "animate-spin" : ""} />
          {retrying ? "Conectando..." : "Reintentar conexión"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// App principal
// ============================================================
export default function App() {
  // // Al cargar la app, restaura el usuario si hay sesión guardada
  // const savedSession = localStorage.getItem('cafeteria_session');
  // if (savedSession) {
  //   const { user } = JSON.parse(savedSession);
  //   setCurrentUser(user);  // ← restaura sin pasar por Login
  // }

  const getInitialPage = (user: User | null): Page => {
    if (!user) return "dashboard";
    if (user.role === "waiter") return "pos";
    return "dashboard";
  };

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  // Auth
  // const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("cafeteria_session");
      if (saved) return JSON.parse(saved).user;
    } catch {
      /* ignorar */
    }
    return null;
  });

  // Páginas permitidas según rol y username
  const getAllowedPages = (user: User | null): Page[] => {
    if (!user) return [];
    // Solo el usuario 'admin' ve Herramientas
    if (user.username === "admin") {
      return [
        "dashboard",
        "pos",
        "menu",
        "orders",
        "tables",
        "users",
        "diagnostics",
        "django-guide",
      ];
    }
    // Administradores (otros username): todo menos Herramientas
    if (
      ["admin", "administrator", "administrador", "manager"].includes(user.role)
    ) {
      return ["dashboard", "pos", "menu", "orders", "tables", "users"];
    }
    // Cajeros: sección Principal completa
    if (["cashier", "cajero"].includes(user.role)) {
      return ["dashboard", "pos", "menu", "orders", "tables"];
    }
    // Meseros: solo POS, Pedidos y Mesas
    if (["waiter", "mesero"].includes(user.role)) {
      return ["pos", "orders", "tables"];
    }
    return ["dashboard"];
  };

  // const handleLogin = (user: User) => {
  //   setCurrentUser(user);
  //   setCurrentPage(getInitialPage(user));
  // };

  const handleLogin = (user: User) => {
    localStorage.setItem("cafeteria_session", JSON.stringify({ user })); // ← nuevo
    setCurrentUser(user);
    setCurrentPage(getInitialPage(user));
  };

  const handleSetPage = (page: Page) => {
    if (!currentUser) return;
    const allowed = getAllowedPages(currentUser);
    if (allowed.includes(page)) setCurrentPage(page);
  };

  // const handleLogout = () => {
  //   setCurrentUser(null);
  //   setCurrentPage("dashboard");
  // };

  const handleLogout = () => {
    localStorage.removeItem("cafeteria_session"); // ← nuevo
    setCurrentUser(null);
    setCurrentPage("dashboard");
  };

  // Estado de conexión
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null); // null = verificando

  // Datos — solo desde API
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================================
  // Cargar TODO desde Django/SQLite — sin fallback a localStorage
  // ============================================================
  const loadFromAPI = useCallback(async () => {
    try {
      setSyncing(true);

      const isConnected = await api.checkConnection();

      if (!isConnected) {
        setConnected(false);
        setServerAvailable(false);
        return;
      }

      setServerAvailable(true);
      setConnected(true);

      // Cargar todos los datos en paralelo
      const [apiCategories, apiProducts, apiTables, apiOrders] =
        await Promise.all([
          api.fetchCategories(),
          api.fetchProducts(),
          api.fetchTables(),
          api.fetchOrders(),
        ]);

      setCategories(apiCategories);
      setProducts(apiProducts);
      setTables(apiTables);
      setOrders(apiOrders);
      setLastSync(new Date());
    } catch (err) {
      console.error("Error cargando datos desde API:", err);
      setConnected(false);
      setServerAvailable(false);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, []);

  // Cargar al iniciar
  useEffect(() => {
    loadFromAPI();

    // Verificar conexión cada 30 segundos y recargar datos
    syncInterval.current = setInterval(() => {
      loadFromAPI();
    }, 30000);

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // Handlers — 100% API, sin fallback a localStorage
  // ============================================================
  const handleCreateOrder = async (
    orderData: Omit<Order, "id" | "createdAt">,
  ) => {
    try {
      const newOrder = await api.createOrder(orderData);
      setOrders((prev) => [newOrder, ...prev]);

      // Recargar mesas SIEMPRE después de crear un pedido para reflejar cambios
      const updatedTables = await api.fetchTables();
      setTables(updatedTables);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error creando pedido:", errorMsg);
      alert("❌ Error al crear el pedido:\n\n" + errorMsg);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: number,
    status: Order["status"],
    paymentMethod?: string,
  ) => {
    try {
      await api.updateOrderStatus(orderId, status, paymentMethod);

      // Actualizar estado local del pedido
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status, ...(paymentMethod ? { paymentMethod } : {}) }
            : o,
        ),
      );

      // Recargar mesas cuando el pedido se cobra o cancela
      if (status === "paid" || status === "cancelled") {
        const order = orders.find((o) => o.id === orderId);
        if (order?.tableNumber && order.type === "dine-in") {
          try {
            // Al cobrar → mesa en limpieza. Al cancelar → mesa disponible
            const newTableStatus = status === "paid" ? "cleaning" : "available";
            const updatedTables = await api.fetchTables();
            const table = updatedTables.find(
              (t) => t.number === order.tableNumber,
            );
            if (table) {
              await api.updateTableStatus(table.id, newTableStatus);
            }
          } catch (err) {
            console.warn("No se pudo actualizar la mesa automáticamente:", err);
          }
        }
        const updatedTables = await api.fetchTables();
        setTables(updatedTables);
      }
    } catch (err) {
      console.error("Error actualizando estado del pedido:", err);
      alert(
        "❌ Error al actualizar el pedido. Verifica la conexión con el servidor.",
      );
    }
  };

  const handleToggleAvailability = async (productId: number) => {
    try {
      const updated = await api.toggleProductAvailability(productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updated : p)),
      );
    } catch (err) {
      console.error("Error cambiando disponibilidad:", err);
      alert(
        "❌ Error al cambiar disponibilidad. Verifica la conexión con el servidor.",
      );
    }
  };

  const handleAddProduct = async (product: Omit<Product, "id">) => {
    try {
      const newProduct = await api.createProduct(product);
      setProducts((prev) => [...prev, newProduct]);
    } catch (err) {
      console.error("Error creando producto:", err);
      alert(
        "❌ Error al crear el producto. Verifica la conexión con el servidor.",
      );
    }
  };

  const handleEditProduct = async (product: Product) => {
    try {
      const updated = await api.updateProduct(product);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? updated : p)),
      );
    } catch (err) {
      console.error("Error editando producto:", err);
      alert(
        "❌ Error al editar el producto. Verifica la conexión con el servidor.",
      );
    }
  };

  const handleUpdateTableStatus = async (
    tableId: number,
    status: Table["status"],
  ) => {
    try {
      const updated = await api.updateTableStatus(tableId, status);
      setTables((prev) => prev.map((t) => (t.id === tableId ? updated : t)));
    } catch (err) {
      console.error("Error actualizando mesa:", err);
      alert(
        "❌ Error al actualizar la mesa. Verifica la conexión con el servidor.",
      );
    }
  };

  // ============================================================
  // Render condicional
  // ============================================================

  // 1. Login — siempre primero
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Verificando conexión inicial
  if (loading || serverAvailable === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="bg-amber-500 p-5 rounded-3xl inline-block mb-6 shadow-lg shadow-amber-500/30">
            <Loader2 size={40} className="text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Iniciando Sistema
          </h2>
          <p className="text-gray-500 mb-4">
            Conectando con el servidor Django...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
            <Wifi size={16} />
            <span>localhost:8000/api/</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Servidor no disponible
  if (!serverAvailable) {
    return (
      <ServerOffScreen
        onRetry={async () => {
          setLoading(true);
          setServerAvailable(null);
          await loadFromAPI();
        }}
        retrying={syncing}
      />
    );
  }

  // 4. Sistema completo conectado a Django
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard orders={orders} />;
      case "pos":
        return (
          <POS
            categories={categories}
            products={products}
            tables={tables}
            onCreateOrder={handleCreateOrder}
          />
        );
      case "menu":
        return (
          <Menu
            categories={categories}
            products={products}
            onToggleAvailability={handleToggleAvailability}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
          />
        );
      case "orders":
        return (
          <Orders orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
        );
      case "tables":
        return (
          <Tables
            tables={tables}
            orders={orders}
            onUpdateTableStatus={handleUpdateTableStatus}
          />
        );
      case "django-guide":
        return <DjangoGuide />;
      case "diagnostics":
        return <Diagnostics />;
      case "users":
        return <Users currentUser={currentUser} />;
      default:
        return <Dashboard orders={orders} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleSetPage}
        connected={connected}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto max-h-screen relative">
        {/* Banner superior — siempre verde si llegamos aquí */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <Cloud size={16} />
            <span>
              <strong>Conectado a Django + SQLite</strong>
              {lastSync && (
                <span className="ml-2 opacity-80 text-xs">
                  — Última sincronización:{" "}
                  {lastSync.toLocaleTimeString("es-ES")}
                </span>
              )}
            </span>
          </div>
          <button
            onClick={loadFromAPI}
            disabled={syncing}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 text-xs"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Sincronizando..." : "Sincronizar"}
          </button>
        </div>

        {/* Aviso si se pierde la conexión en mitad de la sesión */}
        {!connected && serverAvailable && (
          <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <WifiOff size={16} />
              <span>
                <strong>Conexión perdida</strong> — Los cambios no se guardarán
                hasta reconectar.
              </span>
            </div>
            <button
              onClick={loadFromAPI}
              disabled={syncing}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs"
            >
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            </button>
          </div>
        )}

        {renderPage()}
      </main>
    </div>
  );
}
