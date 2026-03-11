import { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Terminal,
  Database,
  Copy,
  Check,
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

interface TestResult {
  name: string;
  url: string;
  status: 'pending' | 'success' | 'error' | 'loading';
  httpCode?: number;
  message: string;
  detail?: string;
  dataPreview?: string;
  hasData?: boolean;
  tip?: string;
}

interface CopyState {
  [key: string]: boolean;
}

export default function Diagnostics() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState<CopyState>({});
  const [liveResponse, setLiveResponse] = useState<Record<string, unknown> | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
    });
  };

  const initialTests: TestResult[] = [
    {
      name: 'Servidor Django corriendo',
      url: 'http://localhost:8000/',
      status: 'pending',
      message: 'Sin probar',
    },
    {
      name: 'Endpoint /api/ responde',
      url: `${API_BASE}/`,
      status: 'pending',
      message: 'Sin probar',
    },
    {
      name: 'API Categorías',
      url: `${API_BASE}/categories/`,
      status: 'pending',
      message: 'Sin probar',
    },
    {
      name: 'API Productos',
      url: `${API_BASE}/products/`,
      status: 'pending',
      message: 'Sin probar',
    },
    {
      name: 'API Pedidos',
      url: `${API_BASE}/orders/`,
      status: 'pending',
      message: 'Sin probar',
    },
    {
      name: 'API Mesas',
      url: `${API_BASE}/tables/`,
      status: 'pending',
      message: 'Sin probar',
    },
  ];

  useEffect(() => {
    setTests(initialTests);
  }, []);

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...update } : t))
    );
  };

  const runTest = async (test: TestResult, index: number): Promise<boolean> => {
    updateTest(index, { status: 'loading', message: 'Probando...' });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(test.url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      clearTimeout(timeout);

      let responseData: unknown = null;
      let responseText = '';

      try {
        responseText = await response.text();
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      // Analizar resultado
      if (response.ok) {
        const isArray = Array.isArray(responseData);
        const count = isArray ? (responseData as unknown[]).length : null;

        if (index === 3 && isArray) {
          setLiveResponse(responseData as Record<string, unknown>);
        }

        const previewStr = isArray && (responseData as unknown[]).length > 0
          ? JSON.stringify((responseData as unknown[]).slice(0, 2), null, 2)
          : '';
        updateTest(index, {
          status: 'success',
          httpCode: response.status,
          message:
            count !== null
              ? `✅ OK — ${count} registro(s) encontrado(s)`
              : '✅ OK — Responde correctamente',
          detail: count === 0
            ? 'La tabla está vacía. Agrega datos desde el admin de Django.'
            : undefined,
          dataPreview: previewStr,
          hasData: previewStr.length > 0,
        });
        return true;
      } else if (response.status === 404) {
        // 404 en raíz es normal para Django
        if (index === 0) {
          updateTest(index, {
            status: 'success',
            httpCode: 404,
            message: '✅ Django está corriendo (404 en raíz es normal)',
          });
          return true;
        }
        updateTest(index, {
          status: 'error',
          httpCode: 404,
          message: `❌ Ruta no encontrada: ${test.url}`,
          tip: 'Las URLs de la API no están configuradas en Django. Copia el archivo urls.py de abajo.',
        });
        return false;
      } else if (response.status === 403 || response.status === 401) {
        updateTest(index, {
          status: 'error',
          httpCode: response.status,
          message: `⚠️ Acceso denegado (HTTP ${response.status})`,
          tip: 'Agrega CORS_ALLOW_ALL_ORIGINS = True en settings.py',
        });
        return false;
      } else {
        updateTest(index, {
          status: 'error',
          httpCode: response.status,
          message: `❌ Error HTTP ${response.status}`,
          detail: responseText.slice(0, 200),
          tip: 'Revisa la consola de Django para ver el error completo.',
        });
        return false;
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        updateTest(index, {
          status: 'error',
          message: '❌ Timeout — Sin respuesta en 5 segundos',
          tip:
            index === 0
              ? 'Ejecuta: python manage.py runserver'
              : 'El servidor no responde. Verifica que Django esté corriendo.',
        });
      } else if ((err as Error).message.includes('Failed to fetch') || (err as Error).message.includes('NetworkError')) {
        updateTest(index, {
          status: 'error',
          message: '❌ No se puede conectar — CORS bloqueado o servidor caído',
          tip:
            index === 0
              ? 'Ejecuta: python manage.py runserver'
              : 'Agrega "corsheaders" en INSTALLED_APPS y CORS_ALLOW_ALL_ORIGINS = True en settings.py',
        });
      } else {
        updateTest(index, {
          status: 'error',
          message: `❌ Error: ${(err as Error).message}`,
          tip: 'Verifica que Django esté corriendo en el puerto 8000.',
        });
      }
      return false;
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setDone(false);
    setLiveResponse(null);
    setTests(initialTests);

    for (let i = 0; i < initialTests.length; i++) {
      await runTest(initialTests[i], i);
      await new Promise((r) => setTimeout(r, 300));
    }

    setRunning(false);
    setDone(true);
  };

  const allPassed = tests.every((t) => t.status === 'success');
  const passedCount = tests.filter((t) => t.status === 'success').length;
  const hasErrors = tests.some((t) => t.status === 'error');

  const settingsCode = `# cafeteria_backend/settings.py
# Agrega/modifica estas secciones:

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',        # <-- AGREGA ESTO
    'rest_framework',     # <-- AGREGA ESTO
    'api',               # <-- AGREGA ESTO
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # <-- PRIMERA LINEA
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Al final del archivo agrega:
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True`;

  const urlsCode = `# cafeteria_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # <-- AGREGA ESTO
]`;

  const apiUrlsCode = `# api/urls.py (CREA ESTE ARCHIVO)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'orders', views.OrderViewSet)
router.register(r'tables', views.TableViewSet)

urlpatterns = [
    path('', include(router.urls)),
]`;

  const modelsCode = `# api/models.py
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, default='☕')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'


class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    category_id_field = None
    image = models.URLField(blank=True, default='')
    description = models.TextField(blank=True, default='')
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('occupied', 'Ocupada'),
        ('reserved', 'Reservada'),
        ('cleaning', 'Limpieza'),
    ]
    number = models.IntegerField(unique=True)
    seats = models.IntegerField(default=4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    def __str__(self):
        return f'Mesa {self.number}'


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('preparing', 'Preparando'),
        ('ready', 'Listo'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]
    TYPE_CHOICES = [
        ('dine-in', 'En mesa'),
        ('takeaway', 'Para llevar'),
    ]
    table_number = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='dine-in')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    customer_name = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Pedido #{self.id}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField(default=1)
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f'{self.quantity}x {self.product}'`;

  const serializersCode = `# api/serializers.py (CREA ESTE ARCHIVO)
from rest_framework import serializers
from .models import Category, Product, Table, Order, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(source='category.id', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'category', 'category_id',
                  'image', 'description', 'available']


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(
        source='product.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'notes']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'items', 'table_number', 'status', 'type',
                  'total', 'customer_name', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order`;

  const viewsCode = `# api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Product, Table, Order
from .serializers import (
    CategorySerializer, ProductSerializer,
    TableSerializer, OrderSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=True, methods=['post'])
    def toggle_availability(self, request, pk=None):
        product = self.get_object()
        product.available = not product.available
        product.save()
        return Response(ProductSerializer(product).data)


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all().order_by('number')
    serializer_class = TableSerializer

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        table = self.get_object()
        table.status = request.data.get('status', table.status)
        table.save()
        return Response(TableSerializer(table).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        order.status = request.data.get('status', order.status)
        order.save()
        return Response(OrderSerializer(order).data)`;

  const commandsCode = `# Ejecuta estos comandos en la carpeta cafeteria_backend/
# con el entorno virtual activado:

python manage.py makemigrations api
python manage.py migrate
python manage.py runserver`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wifi className="text-amber-500" size={28} />
          Diagnóstico de Conexión
        </h1>
        <p className="text-gray-500 mt-1">
          Verifica que el frontend puede comunicarse con el backend Django
        </p>
      </div>

      {/* Botón principal */}
      <button
        onClick={runAllTests}
        disabled={running}
        className="w-full mb-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 
                   disabled:opacity-60 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center 
                   gap-3 transition-all shadow-lg shadow-amber-500/30 text-lg"
      >
        {running ? (
          <>
            <Loader2 size={22} className="animate-spin" />
            Ejecutando diagnóstico...
          </>
        ) : (
          <>
            <RefreshCw size={22} />
            {done ? 'Ejecutar de nuevo' : 'Ejecutar Diagnóstico'}
          </>
        )}
      </button>

      {/* Resultados */}
      {tests.length > 0 && (
        <div className="space-y-3 mb-6">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`rounded-xl border p-4 transition-all ${
                test.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200'
                  : test.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : test.status === 'loading'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {test.status === 'loading' && (
                    <Loader2 size={20} className="text-amber-500 animate-spin" />
                  )}
                  {test.status === 'success' && (
                    <CheckCircle size={20} className="text-emerald-500" />
                  )}
                  {test.status === 'error' && (
                    <XCircle size={20} className="text-red-500" />
                  )}
                  {test.status === 'pending' && (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">
                      {test.name}
                    </span>
                    {test.httpCode && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                          test.httpCode < 300
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        HTTP {test.httpCode}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      test.status === 'success'
                        ? 'text-emerald-700'
                        : test.status === 'error'
                        ? 'text-red-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {test.message}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    {test.url}
                  </p>
                  {test.detail && (
                    <p className="text-xs text-gray-500 mt-1 bg-white/60 rounded p-2 font-mono">
                      {test.detail}
                    </p>
                  )}
                  {test.tip && test.status === 'error' && (
                    <div className="mt-2 flex items-start gap-1.5 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                      <AlertTriangle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-yellow-800">
                        <strong>Solución:</strong> {test.tip}
                      </p>
                    </div>
                  )}
                  {/* Mostrar datos de ejemplo si hay */}
                  {test.status === 'success' && test.hasData && test.dataPreview && (
                    <details className="mt-2">
                      <summary className="text-xs text-emerald-600 cursor-pointer hover:text-emerald-800">
                        Ver datos de ejemplo
                      </summary>
                      <pre className="text-xs bg-white rounded p-2 mt-1 overflow-x-auto border border-emerald-100 max-h-32">
                        {test.dataPreview}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen final */}
      {done && (
        <div
          className={`rounded-2xl p-5 mb-6 border-2 ${
            allPassed
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-orange-50 border-orange-300'
          }`}
        >
          {allPassed ? (
            <div className="text-center">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-emerald-800">
                ¡Todo funciona correctamente!
              </h3>
              <p className="text-emerald-700 mt-1">
                El frontend está conectado al backend Django. Los datos vienen de SQLite.
              </p>
              <p className="text-sm text-emerald-600 mt-2">
                Si el banner superior aún dice "Modo Offline", haz clic en{' '}
                <strong>"Reintentar"</strong> o recarga la página (F5).
              </p>
            </div>
          ) : (
            <div className="text-center">
              <AlertTriangle size={40} className="text-orange-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-orange-800">
                {passedCount} de {tests.length} tests pasaron
              </h3>
              <p className="text-orange-700 mt-1">
                Revisa los errores arriba y copia los archivos de la sección de abajo.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Respuesta real de la API */}
      {liveResponse && (
        <div className="mb-6 bg-gray-900 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <Database size={16} className="text-amber-400" />
            Respuesta real de /api/products/
          </h3>
          <pre className="text-green-400 text-xs overflow-x-auto max-h-48">
            {JSON.stringify(liveResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* Soluciones — Archivos para copiar */}
      {(hasErrors || !done) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Terminal size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">
              Archivos que necesitas en tu backend Django
            </h2>
          </div>
          <p className="text-sm text-gray-500 -mt-2 mb-4">
            Copia cada archivo en el orden indicado. Si ya los tienes, verifica que el contenido sea correcto.
          </p>

          {[
            {
              key: 'settings',
              title: '1. settings.py — Agregar estas secciones',
              path: 'cafeteria_backend/settings.py',
              code: settingsCode,
              color: 'blue',
            },
            {
              key: 'urls',
              title: '2. urls.py principal — Agregar ruta /api/',
              path: 'cafeteria_backend/urls.py',
              code: urlsCode,
              color: 'purple',
            },
            {
              key: 'apiurls',
              title: '3. api/urls.py — Crear este archivo',
              path: 'api/urls.py',
              code: apiUrlsCode,
              color: 'indigo',
            },
            {
              key: 'models',
              title: '4. api/models.py — Modelos de datos',
              path: 'api/models.py',
              code: modelsCode,
              color: 'green',
            },
            {
              key: 'serializers',
              title: '5. api/serializers.py — Crear este archivo',
              path: 'api/serializers.py',
              code: serializersCode,
              color: 'teal',
            },
            {
              key: 'views',
              title: '6. api/views.py — Endpoints de la API',
              path: 'api/views.py',
              code: viewsCode,
              color: 'orange',
            },
            {
              key: 'commands',
              title: '7. Comandos finales en la terminal',
              path: 'Terminal',
              code: commandsCode,
              color: 'gray',
            },
          ].map(({ key, title, path, code, color }) => (
            <div key={key} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className={`flex items-center justify-between px-4 py-3 bg-${color}-50 border-b border-${color}-100`}>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 font-mono">{path}</p>
                </div>
                <button
                  onClick={() => handleCopy(code, key)}
                  className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 
                             text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  {copied[key] ? (
                    <>
                      <Check size={13} className="text-green-600" />
                      <span className="text-green-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs p-4 overflow-x-auto max-h-56 bg-gray-950 text-gray-100 leading-relaxed">
                {code}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Si todo pasó: solo mostrar el comando de recarga */}
      {done && allPassed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <p className="text-emerald-800 font-medium">
            🎉 ¡El sistema está completamente conectado!
          </p>
          <p className="text-sm text-emerald-600 mt-1">
            Todos los datos que crees (pedidos, productos, mesas) se guardarán en SQLite.
          </p>
          <div className="flex gap-3 justify-center mt-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Recargar frontend
            </button>
          </div>
        </div>
      )}

      {/* Estado inicial */}
      {!done && !running && tests.every((t) => t.status === 'pending') && (
        <div className="text-center py-12 text-gray-400">
          <WifiOff size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Haz clic en "Ejecutar Diagnóstico"</p>
          <p className="text-sm">
            Se probarán 6 endpoints de tu backend Django
          </p>
        </div>
      )}
    </div>
  );
}
