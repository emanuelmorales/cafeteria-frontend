import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Server, Code, Layers, Globe, Terminal, FolderTree, Settings, Wifi } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  highlight?: 'red' | 'green' | 'blue';
}

const sections: Section[] = [
  {
    id: 'where',
    title: '0. ¿DÓNDE crear el backend? (MUY IMPORTANTE)',
    icon: <FolderTree size={18} />,
    highlight: 'red',
    content: `# ===========================================================
# ⚠️  SON DOS PROYECTOS SEPARADOS EN CARPETAS DIFERENTES ⚠️
# ===========================================================
#
# NO crear el backend dentro del frontend ni viceversa.
# Cada proyecto tiene su propia carpeta independiente.
#
# ============================================
# ESTRUCTURA CORRECTA ✅
# ============================================
#
# Tu escritorio o carpeta de proyectos/
# │
# ├── cafeteria-frontend/          ← Proyecto React (YA LO TIENES descargado)
# │   ├── package.json
# │   ├── src/
# │   ├── index.html
# │   └── ...
# │
# └── cafeteria_backend/           ← Proyecto Django (LO VAS A CREAR)
#     ├── cafeteria_backend/
#     │   ├── __init__.py
#     │   ├── settings.py
#     │   └── urls.py
#     ├── api/
#     │   ├── models.py
#     │   ├── views.py
#     │   ├── serializers.py       ← Archivo nuevo que crearás
#     │   └── urls.py              ← Archivo nuevo que crearás
#     ├── db.sqlite3               ← TU BASE DE DATOS (1 solo archivo!)
#     ├── manage.py
#     └── venv/
#
# ============================================
# ESTRUCTURA INCORRECTA ❌  (NO hagas esto)
# ============================================
#
# cafeteria-frontend/
# └── cafeteria_backend/       ← ¡ERROR! No meter uno dentro del otro
#
# ============================================
# ¿POR QUÉ SEPARADOS?
# ============================================
#
# - Son tecnologías diferentes (Node.js vs Python)
# - Cada uno tiene su propio servidor:
#     → React corre en   http://localhost:5173
#     → Django corre en  http://localhost:8000
# - Se comunican entre sí por HTTP (fetch)
`,
  },
  {
    id: 'why-sqlite',
    title: '1. ¿Por qué SQLite? (Ventajas para tu cafetería)',
    icon: <Server size={18} />,
    highlight: 'green',
    content: `# ===========================================================
# 🏆 SQLite ES LA MEJOR OPCIÓN PARA UNA CAFETERÍA CON 1 PC
# ===========================================================
#
# ============================================
# COMPARACIÓN RÁPIDA
# ============================================
#
#   SQLite                          MySQL / MariaDB
#   ─────────────────────────       ─────────────────────────
#   ✅ Ya viene con Python          ❌ Necesita XAMPP/servidor
#   ✅ Cero configuración           ❌ Puertos, contraseñas
#   ✅ 1 solo archivo (db.sqlite3)  ❌ Servicio corriendo
#   ✅ Backup = copiar archivo      ❌ Exportar dump SQL
#   ✅ Sin errores de conexión      ❌ Muchos errores posibles
#   ✅ Funciona en cualquier PC     ❌ Depende de XAMPP
#   ✅ Perfecto para 1-5 usuarios   ✅ Para muchos usuarios
#
# ============================================
# ¿CUÁNTO SOPORTA SQLite?
# ============================================
#
# - Hasta 281 TERABYTES de datos
# - Miles de lecturas por segundo
# - Cientos de escrituras por segundo
# - Una cafetería genera máximo ~200 pedidos al día
# - SQLite soporta MILLONES de registros sin problemas
#
# ============================================
# BACKUP SÚPER FÁCIL
# ============================================
#
# Tu base de datos COMPLETA es UN SOLO ARCHIVO:
#   cafeteria_backend/db.sqlite3
#
# Para hacer backup:
#   1. Copiar db.sqlite3 a una USB / Google Drive / Dropbox
#   2. ¡Listo!
#
# Para restaurar:
#   1. Copiar db.sqlite3 de vuelta a la carpeta
#   2. ¡Listo!
#
# ============================================
# NO NECESITAS XAMPP NI MySQL
# ============================================
#
# Puedes DESINSTALAR XAMPP si solo lo usabas para la BD.
# Python ya incluye SQLite, no hay NADA que instalar.
# No hay puertos que abrir, ni servicios que iniciar.
# Simplemente funciona. ✅
`,
  },
  {
    id: 'create-project',
    title: '2. Crear el Proyecto Django (Paso a Paso)',
    icon: <Terminal size={18} />,
    content: `# ============================================
# INSTRUCCIONES PASO A PASO
# ============================================

# PASO 1: Abre una terminal NUEVA
# (No uses la terminal donde corre React)

# PASO 2: Ve a tu carpeta de proyectos
# En Windows:
cd C:\\Users\\TU_USUARIO\\Documents\\Proyectos

# En Mac/Linux:
cd ~/Proyectos

# (usa la misma carpeta donde está cafeteria-frontend)

# PASO 3: Crear carpeta del backend y entrar
mkdir cafeteria_backend
cd cafeteria_backend

# PASO 4: Crear entorno virtual de Python
python -m venv venv

# PASO 5: Activar el entorno virtual
# En Windows (CMD):
venv\\Scripts\\activate
# En Windows (PowerShell):
venv\\Scripts\\Activate.ps1
# En Mac/Linux:
source venv/bin/activate

# ✅ Verás (venv) al inicio de tu terminal

# PASO 6: Instalar dependencias (¡Solo 3 paquetes!)
pip install django djangorestframework django-cors-headers

# ⚡ NOTA: ¡NO necesitas pymysql ni mysqlclient!
# SQLite viene incluido con Python, no requiere drivers

# PASO 7: Crear el proyecto Django
django-admin startproject cafeteria_backend .

# ¡OJO! El punto (.) al final es MUY importante
# Crea el proyecto en la carpeta actual

# PASO 8: Crear la app "api"
python manage.py startapp api

# ============================================
# RESULTADO: Tu carpeta debe verse así
# ============================================
#
# cafeteria_backend/
# ├── venv/                   ← Entorno virtual (NO tocar)
# ├── cafeteria_backend/      ← Configuración Django
# │   ├── __init__.py
# │   ├── settings.py         ← MODIFICAR (configuración)
# │   ├── urls.py             ← MODIFICAR (rutas)
# │   ├── asgi.py
# │   └── wsgi.py
# ├── api/                    ← Tu aplicación
# │   ├── __init__.py
# │   ├── admin.py            ← MODIFICAR
# │   ├── apps.py
# │   ├── models.py           ← MODIFICAR
# │   ├── views.py            ← MODIFICAR
# │   ├── tests.py
# │   └── migrations/
# │       └── __init__.py
# └── manage.py
#
# ARCHIVOS QUE VAS A CREAR:
#   api/serializers.py   ← Paso 5 de esta guía
#   api/urls.py          ← Paso 7 de esta guía
`,
  },
  {
    id: 'settings',
    title: '3. Configurar settings.py (SUPER SIMPLE con SQLite)',
    icon: <Settings size={18} />,
    highlight: 'green',
    content: `# ============================================
# ARCHIVO: cafeteria_backend/settings.py
# ============================================
# Abre este archivo y modifica las secciones indicadas.
# No borres lo que ya existe, solo agrega/modifica.

# ------ MODIFICAR INSTALLED_APPS ------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # --- Agregar estas 3 líneas ---
    'rest_framework',
    'corsheaders',
    'api',
]

# ------ MODIFICAR MIDDLEWARE ------
# (agregar corsheaders.middleware LO MÁS ARRIBA posible)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',     # ← AGREGAR PRIMERA
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ------ DATABASES ------
# ¡NO TOCAR! La configuración por defecto YA usa SQLite.
# Debería verse así (ya viene así):

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ✅ ¡Eso es TODO! No necesitas host, puerto, usuario ni contraseña.
# El archivo db.sqlite3 se crea automáticamente al migrar.

# ------ AGREGAR AL FINAL del archivo ------

# Permitir que React se conecte a Django (CORS):
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# También permitir credenciales si es necesario:
CORS_ALLOW_CREDENTIALS = True

# Configurar REST Framework:
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}

# Zona horaria y lenguaje:
LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'America/Mexico_City'
USE_I18N = True
USE_TZ = True

# Para que DEFAULT_AUTO_FIELD no de warnings:
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
`,
  },
  {
    id: 'models',
    title: '4. Modelos - models.py (tablas de la BD)',
    icon: <Layers size={18} />,
    content: `# ============================================
# ARCHIVO: api/models.py
# ============================================
# Abre api/models.py y REEMPLAZA todo su contenido con esto:

from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='Nombre')
    icon = models.CharField(max_length=10, default='☕', verbose_name='Icono')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['name']

    def __str__(self):
        return self.icon + ' ' + self.name


class Product(models.Model):
    name = models.CharField(max_length=200, verbose_name='Nombre')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio')
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name='Categoria'
    )
    image = models.CharField(max_length=10, default='☕', verbose_name='Icono/Emoji')
    description = models.TextField(blank=True, verbose_name='Descripcion')
    available = models.BooleanField(default=True, verbose_name='Disponible')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['category', 'name']

    def __str__(self):
        return self.image + ' ' + self.name + ' - $' + str(self.price)


class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('occupied', 'Ocupada'),
        ('reserved', 'Reservada'),
        ('cleaning', 'Limpieza'),
    ]

    number = models.IntegerField(unique=True, verbose_name='Numero de Mesa')
    seats = models.IntegerField(default=4, verbose_name='Asientos')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='available',
        verbose_name='Estado'
    )

    class Meta:
        db_table = 'tables'
        verbose_name = 'Mesa'
        verbose_name_plural = 'Mesas'
        ordering = ['number']

    def __str__(self):
        return 'Mesa ' + str(self.number) + ' (' + str(self.seats) + ' asientos)'


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('preparing', 'Preparando'),
        ('ready', 'Listo'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]
    TYPE_CHOICES = [
        ('dine-in', 'En Mesa'),
        ('takeaway', 'Para Llevar'),
    ]

    table = models.ForeignKey(
        Table, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='orders', verbose_name='Mesa'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    order_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='dine-in')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    customer_name = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'
        ordering = ['-created_at']

    def __str__(self):
        return 'Pedido #' + str(self.id) + ' - $' + str(self.total)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE,
        related_name='items', verbose_name='Pedido'
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Producto'
    )
    quantity = models.IntegerField(default=1, verbose_name='Cantidad')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio Unitario')
    notes = models.TextField(blank=True, verbose_name='Notas')

    class Meta:
        db_table = 'order_items'
        verbose_name = 'Item del Pedido'
        verbose_name_plural = 'Items del Pedido'

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return str(self.quantity) + 'x ' + self.product.name

    def save(self, *args, **kwargs):
        if not self.unit_price:
            self.unit_price = self.product.price
        super().save(*args, **kwargs)
`,
  },
  {
    id: 'serializers',
    title: '5. Serializers - serializers.py (CREAR archivo nuevo)',
    icon: <Code size={18} />,
    content: `# ============================================
# ARCHIVO: api/serializers.py   ← CREAR ESTE ARCHIVO
# ============================================
# Este archivo NO existe. Debes crearlo dentro de la carpeta api/
# Click derecho en api/ → Nuevo archivo → serializers.py

from rest_framework import serializers
from .models import Category, Product, Table, Order, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'product_count']

    def get_product_count(self, obj):
        return obj.products.count()


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'category', 'category_name',
            'image', 'description', 'available', 'created_at'
        ]


class TableSerializer(serializers.ModelSerializer):
    current_order_id = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = ['id', 'number', 'seats', 'status', 'current_order_id']

    def get_current_order_id(self, obj):
        active_order = obj.orders.filter(
            status__in=['pending', 'preparing', 'ready']
        ).first()
        return active_order.id if active_order else None


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image',
            'quantity', 'unit_price', 'subtotal', 'notes'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.IntegerField(source='table.number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'table', 'table_number', 'status', 'status_display',
            'order_type', 'total', 'customer_name',
            'created_at', 'updated_at', 'items'
        ]


class CreateOrderSerializer(serializers.Serializer):
    table_number = serializers.IntegerField(required=False, allow_null=True)
    order_type = serializers.ChoiceField(choices=['dine-in', 'takeaway'])
    customer_name = serializers.CharField(required=False, allow_blank=True, default='')
    items = serializers.ListField(child=serializers.DictField())

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        table_number = validated_data.pop('table_number', None)

        table = None
        if table_number and validated_data.get('order_type') == 'dine-in':
            try:
                table = Table.objects.get(number=table_number)
                table.status = 'occupied'
                table.save()
            except Table.DoesNotExist:
                pass

        order = Order.objects.create(
            table=table,
            order_type=validated_data['order_type'],
            customer_name=validated_data.get('customer_name', ''),
        )

        total = 0
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            quantity = item_data.get('quantity', 1)
            notes = item_data.get('notes', '')
            OrderItem.objects.create(
                order=order, product=product,
                quantity=quantity, unit_price=product.price, notes=notes,
            )
            total += product.price * quantity

        order.total = total
        order.save()
        return order
`,
  },
  {
    id: 'views',
    title: '6. Views / Endpoints - views.py',
    icon: <Server size={18} />,
    content: `# ============================================
# ARCHIVO: api/views.py
# ============================================
# Abre api/views.py y REEMPLAZA todo su contenido con esto:

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.utils import timezone

from .models import Category, Product, Table, Order, OrderItem
from .serializers import (
    CategorySerializer, ProductSerializer, TableSerializer,
    OrderSerializer, CreateOrderSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        available = self.request.query_params.get('available')
        if available is not None:
            queryset = queryset.filter(available=available.lower() == 'true')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset

    @action(detail=True, methods=['post'])
    def toggle_availability(self, request, pk=None):
        product = self.get_object()
        product.available = not product.available
        product.save()
        return Response({'id': product.id, 'available': product.available})


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        table = self.get_object()
        new_status = request.data.get('status')
        valid = ['available', 'occupied', 'reserved', 'cleaning']
        if new_status not in valid:
            return Response(
                {'error': 'Estado invalido. Use: ' + str(valid)},
                status=status.HTTP_400_BAD_REQUEST
            )
        if new_status in ['available', 'cleaning']:
            table.orders.filter(
                status__in=['pending', 'preparing', 'ready']
            ).update(status='delivered')
        table.status = new_status
        table.save()
        return Response(TableSerializer(table).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related('items__product').select_related('table').all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        order_type = self.request.query_params.get('type')
        if order_type:
            queryset = queryset.filter(order_type=order_type)
        today = self.request.query_params.get('today')
        if today and today.lower() == 'true':
            queryset = queryset.filter(created_at__date=timezone.now().date())
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        valid = ['pending', 'preparing', 'ready', 'delivered', 'cancelled']
        if new_status not in valid:
            return Response(
                {'error': 'Estado invalido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = new_status
        order.save()
        if new_status in ['delivered', 'cancelled'] and order.table:
            order.table.status = 'cleaning'
            order.table.save()
        return Response(OrderSerializer(order).data)


@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now().date()
    today_orders = Order.objects.filter(created_at__date=today)
    stats = today_orders.exclude(status='cancelled').aggregate(
        total_sales=Sum('total'),
        total_orders=Count('id'),
        avg_ticket=Avg('total'),
    )
    status_counts = {}
    for s in ['pending', 'preparing', 'ready', 'delivered', 'cancelled']:
        status_counts[s] = today_orders.filter(status=s).count()
    recent_orders = OrderSerializer(today_orders[:5], many=True).data
    return Response({
        'today': {
            'total_sales': float(stats['total_sales'] or 0),
            'total_orders': stats['total_orders'] or 0,
            'avg_ticket': round(float(stats['avg_ticket'] or 0), 2),
        },
        'status_counts': status_counts,
        'recent_orders': recent_orders,
    })
`,
  },
  {
    id: 'urls',
    title: '7. URLs y Rutas',
    icon: <Globe size={18} />,
    content: `# ============================================
# ARCHIVO 1: api/urls.py   ← CREAR ESTE ARCHIVO
# ============================================
# Este archivo NO existe. Crealo dentro de la carpeta api/

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'tables', views.TableViewSet)
router.register(r'orders', views.OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
]


# ============================================
# ARCHIVO 2: cafeteria_backend/urls.py   ← MODIFICAR (ya existe)
# ============================================
# Abre cafeteria_backend/urls.py y reemplaza su contenido:

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]


# ============================================
# TODOS LOS ENDPOINTS que quedan disponibles:
# ============================================
#
# GET/POST        /api/categories/
# GET/PUT/DELETE  /api/categories/1/
#
# GET/POST        /api/products/
# GET/PUT/DELETE  /api/products/1/
# POST            /api/products/1/toggle_availability/
# GET             /api/products/?category=1
# GET             /api/products/?search=cafe
# GET             /api/products/?available=true
#
# GET/POST        /api/tables/
# POST            /api/tables/1/update_status/
#
# GET/POST        /api/orders/
# GET             /api/orders/?status=pending
# GET             /api/orders/?today=true
# POST            /api/orders/1/update_status/
#
# GET             /api/dashboard/
#
# Panel admin     /admin/
`,
  },
  {
    id: 'admin',
    title: '8. Panel Admin de Django',
    icon: <Settings size={18} />,
    content: `# ============================================
# ARCHIVO: api/admin.py
# ============================================
# Abre api/admin.py y REEMPLAZA todo su contenido con esto:

from django.contrib import admin
from .models import Category, Product, Table, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'icon', 'name', 'product_count', 'created_at']
    search_fields = ['name']

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Productos'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'image', 'name', 'price', 'category', 'available']
    list_filter = ['category', 'available']
    search_fields = ['name', 'description']
    list_editable = ['price', 'available']


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['id', 'number', 'seats', 'status']
    list_filter = ['status']
    list_editable = ['status']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'order_type', 'status', 'total', 'table', 'created_at']
    list_filter = ['status', 'order_type', 'created_at']
    search_fields = ['customer_name']
    list_editable = ['status']
    inlines = [OrderItemInline]
    readonly_fields = ['created_at', 'updated_at']


# ============================================
# ACCEDER AL ADMIN:
# ============================================
#
# 1. Crear superusuario:
#    python manage.py createsuperuser
#    (te pedira: usuario, email, contraseña)
#
# 2. Abrir en navegador:
#    http://localhost:8000/admin/
#
# 3. Desde ahi puedes:
#    - Ver, crear, editar y eliminar Categorias
#    - Ver, crear, editar y eliminar Productos
#    - Ver, crear, editar y eliminar Mesas
#    - Ver, crear, editar y eliminar Pedidos
#    - Filtrar y buscar datos
`,
  },
  {
    id: 'migrate',
    title: '9. Migrar, Cargar Datos y Ejecutar',
    icon: <Terminal size={18} />,
    content: `# ============================================
# COMANDOS FINALES (ejecutar en orden)
# ============================================

# Asegurate de estar en la carpeta cafeteria_backend/
# con el entorno virtual activado (venv)

# PASO 1: Crear las migraciones
python manage.py makemigrations api

# Veras algo como:
# Migrations for 'api':
#   api/migrations/0001_initial.py
#     - Create model Category
#     - Create model Product
#     - Create model Table
#     - Create model Order
#     - Create model OrderItem

# PASO 2: Aplicar migraciones (crea las tablas en SQLite)
python manage.py migrate

# ✅ Se crea automaticamente el archivo db.sqlite3
# ¡Esa es tu base de datos completa!

# PASO 3: Crear superusuario
python manage.py createsuperuser
# Ingresa: usuario, email, contraseña

# PASO 4: Ejecutar el servidor Django
python manage.py runserver

# Veras:
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CTRL-BREAK.

# PASO 5: Verificar que funciona
# Abre en tu navegador:
#   http://localhost:8000/admin/         → Panel de administracion
#   http://localhost:8000/api/           → Lista de endpoints API
#   http://localhost:8000/api/products/  → Productos (vacio al inicio)

# ============================================
# CARGAR DATOS DE PRUEBA
# ============================================
# Crear carpetas y archivos dentro de api/:
#
#   api/management/                      ← Crear carpeta
#   api/management/__init__.py           ← Crear archivo vacio
#   api/management/commands/             ← Crear carpeta
#   api/management/commands/__init__.py  ← Crear archivo vacio
#   api/management/commands/seed_data.py ← Crear con el codigo de abajo

# --- Contenido de api/management/commands/seed_data.py ---

from django.core.management.base import BaseCommand
from api.models import Category, Product, Table


class Command(BaseCommand):
    help = 'Carga datos iniciales de la cafeteria'

    def handle(self, *args, **options):
        self.stdout.write('Cargando categorias...')
        cats_data = [
            ('Cafe', '☕'),
            ('Te', '🍵'),
            ('Pasteles', '🍰'),
            ('Sandwiches', '🥪'),
            ('Bebidas Frias', '🧊'),
            ('Desayunos', '🍳'),
        ]
        cats = {}
        for name, icon in cats_data:
            cat, created = Category.objects.get_or_create(
                name=name, defaults={'icon': icon}
            )
            cats[name] = cat
            st = 'CREADA' if created else 'ya existia'
            self.stdout.write('  ' + icon + ' ' + name + ': ' + st)

        self.stdout.write('Cargando mesas...')
        for num in range(1, 13):
            seats = 2 if num % 3 == 0 else (6 if num % 5 == 0 else 4)
            table, created = Table.objects.get_or_create(
                number=num, defaults={'seats': seats}
            )
            st = 'CREADA' if created else 'ya existia'
            self.stdout.write('  Mesa ' + str(num) + ': ' + st)

        self.stdout.write('Cargando productos...')
        products = [
            ('Espresso', 35, '☕', 'Cafe'),
            ('Americano', 40, '☕', 'Cafe'),
            ('Cappuccino', 55, '☕', 'Cafe'),
            ('Latte', 55, '☕', 'Cafe'),
            ('Mocha', 60, '☕', 'Cafe'),
            ('Te Verde', 35, '🍵', 'Te'),
            ('Te Negro', 35, '🍵', 'Te'),
            ('Chai Latte', 50, '🍵', 'Te'),
            ('Pastel Chocolate', 65, '🍫', 'Pasteles'),
            ('Cheesecake', 70, '🍰', 'Pasteles'),
            ('Brownie', 45, '🍫', 'Pasteles'),
            ('Club Sandwich', 85, '🥪', 'Sandwiches'),
            ('Panini Caprese', 75, '🥪', 'Sandwiches'),
            ('Baguette Jamon', 70, '🥖', 'Sandwiches'),
            ('Frappe Mokka', 65, '🧊', 'Bebidas Frias'),
            ('Limonada', 40, '🍋', 'Bebidas Frias'),
            ('Smoothie Frutas', 55, '🍓', 'Bebidas Frias'),
            ('Huevos Rancheros', 90, '🍳', 'Desayunos'),
            ('Hot Cakes', 75, '🥞', 'Desayunos'),
            ('Chilaquiles', 85, '🌶️', 'Desayunos'),
        ]
        for name, price, img, cat_name in products:
            prod, created = Product.objects.get_or_create(
                name=name,
                defaults={
                    'price': price,
                    'image': img,
                    'category': cats[cat_name]
                }
            )
            st = 'CREADO' if created else 'ya existia'
            self.stdout.write('  ' + img + ' ' + name + ': ' + st)

        self.stdout.write(self.style.SUCCESS(
            'Datos cargados exitosamente!'
        ))

# --- Ejecutar: ---
# python manage.py seed_data
`,
  },
  {
    id: 'backup',
    title: '10. Backup y Administrar tu Base de Datos',
    icon: <Settings size={18} />,
    highlight: 'green',
    content: `# ============================================
# 💾 BACKUP DE TU BASE DE DATOS
# ============================================
#
# Tu base de datos es UN SOLO ARCHIVO:
#   cafeteria_backend/db.sqlite3
#
# ============================================
# HACER BACKUP (copiar el archivo)
# ============================================

# Opcion 1: Manualmente
#   → Copia db.sqlite3 a una USB, Google Drive, o Dropbox
#   → Renombralo con la fecha: db_2025-01-15.sqlite3

# Opcion 2: Con un comando
# En Windows:
copy db.sqlite3 backups\\db_%date:~-4%-%date:~4,2%-%date:~7,2%.sqlite3

# En Mac/Linux:
cp db.sqlite3 backups/db_$(date +%Y-%m-%d).sqlite3

# Opcion 3: Script automatico (crear archivo backup.py)
# --- Contenido de backup.py ---

import shutil
from datetime import datetime

fecha = datetime.now().strftime('%Y-%m-%d_%H-%M')
origen = 'db.sqlite3'
destino = f'backups/db_{fecha}.sqlite3'

import os
os.makedirs('backups', exist_ok=True)

shutil.copy2(origen, destino)
print(f'Backup creado: {destino}')

# --- Ejecutar: ---
# python backup.py

# ============================================
# RESTAURAR BACKUP
# ============================================
#
# 1. Detener Django (Ctrl+C)
# 2. Copiar el archivo de backup como db.sqlite3
# 3. Volver a iniciar Django: python manage.py runserver
#
# En Windows:
# copy backups\\db_2025-01-15.sqlite3 db.sqlite3
#
# En Mac/Linux:
# cp backups/db_2025-01-15.sqlite3 db.sqlite3

# ============================================
# VER LOS DATOS DE LA BASE DE DATOS
# ============================================
#
# OPCION A: Panel Admin de Django (la mas facil)
#   → http://localhost:8000/admin/
#   → Puedes ver, crear, editar y eliminar todo
#
# OPCION B: DB Browser for SQLite (programa gratuito)
#   → Descargar de: https://sqlitebrowser.org/
#   → Abrir db.sqlite3 con el programa
#   → Puedes ver tablas, ejecutar SQL, exportar datos
#
# OPCION C: Desde la terminal de Django
#   python manage.py dbshell
#   .tables                    ← Ver todas las tablas
#   SELECT * FROM products;    ← Ver productos
#   SELECT * FROM orders;      ← Ver pedidos
#   .quit                      ← Salir

# ============================================
# EXPORTAR DATOS A CSV (para Excel)
# ============================================
# Desde la terminal de Django:
#
# python manage.py shell
#
# Luego escribir:
# import csv
# from api.models import Order
#
# with open('pedidos.csv', 'w', newline='', encoding='utf-8') as f:
#     writer = csv.writer(f)
#     writer.writerow(['ID', 'Cliente', 'Total', 'Estado', 'Fecha'])
#     for o in Order.objects.all():
#         writer.writerow([o.id, o.customer_name, o.total, o.status, o.created_at])
#
# print('Exportado a pedidos.csv')
`,
  },
  {
    id: 'remote',
    title: '11. Acceso Remoto (desde celular o cualquier lugar)',
    icon: <Wifi size={18} />,
    highlight: 'blue',
    content: `# ===========================================================
# 🌐 OPCIONES PARA ACCEDER DESDE CUALQUIER LUGAR
# ===========================================================
#
# ============================================
# OPCION 1: RED LOCAL (misma WiFi) - GRATIS
# ============================================
# Accede desde tu celular o tablet en la misma WiFi.
#
# Paso 1: Buscar tu IP local
#   Windows: ipconfig (busca "IPv4 Address", ej: 192.168.1.100)
#   Mac/Linux: ifconfig o ip addr
#
# Paso 2: Iniciar Django en esa IP
python manage.py runserver 0.0.0.0:8000
#
# Paso 3: Agregar tu IP a settings.py
ALLOWED_HOSTS = ['*']   # o ['192.168.1.100', 'localhost']
#
# En CORS agregar:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://192.168.1.100:5173",    # tu IP local
    "http://192.168.1.100:8000",
]
#
# Paso 4: Abrir desde el celular
#   http://192.168.1.100:8000/admin/   ← Admin
#   http://192.168.1.100:5173/         ← Frontend
#
# ⚠️ Solo funciona en la MISMA red WiFi

# ============================================
# OPCION 2: NGROK (desde cualquier lugar) - GRATIS
# ============================================
# Ngrok crea un tunel seguro a tu PC.
# Puedes acceder desde CUALQUIER lugar con internet.
#
# Paso 1: Registrate en https://ngrok.com (gratis)
#
# Paso 2: Descarga ngrok
#   https://ngrok.com/download
#
# Paso 3: Conecta tu cuenta
ngrok config add-authtoken TU_TOKEN_AQUI
#
# Paso 4: Inicia Django normalmente
python manage.py runserver
#
# Paso 5: En OTRA terminal, inicia ngrok
ngrok http 8000
#
# Veras algo como:
#   Forwarding  https://abc123.ngrok-free.app -> http://localhost:8000
#
# Paso 6: Agregar la URL de ngrok a settings.py
ALLOWED_HOSTS = ['*']
CSRF_TRUSTED_ORIGINS = ['https://abc123.ngrok-free.app']
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://abc123.ngrok-free.app",
]
#
# Paso 7: Abre desde cualquier dispositivo
#   https://abc123.ngrok-free.app/admin/
#
# ⚠️ La URL cambia cada vez que reinicias ngrok (plan gratis)
# ⚠️ Plan gratis: 1 tunel, velocidad limitada

# ============================================
# OPCION 3: TAILSCALE (VPN personal) - GRATIS
# ============================================
# Crea una red privada entre tus dispositivos.
# Mas seguro que ngrok, sin limite de velocidad.
#
# Paso 1: Instala Tailscale en tu PC y celular
#   https://tailscale.com/download
#
# Paso 2: Inicia sesion con Google en ambos dispositivos
#
# Paso 3: Tu PC tendra una IP tipo 100.x.x.x
#
# Paso 4: Inicia Django
python manage.py runserver 0.0.0.0:8000
#
# Paso 5: Desde tu celular abre:
#   http://100.x.x.x:8000/admin/
#
# ✅ Funciona desde cualquier lugar
# ✅ Conexion encriptada
# ✅ Gratis para uso personal (hasta 100 dispositivos)
# ✅ No necesitas abrir puertos en tu router

# ============================================
# RECOMENDACION PARA TU CAFETERIA
# ============================================
#
# → Uso diario (dentro de la cafeteria):
#   OPCION 1 (Red Local) - Gratis, rapido, sin configuracion
#   Conecta tu celular/tablet a la WiFi del negocio
#
# → Acceso desde casa o fuera:
#   OPCION 3 (Tailscale) - Gratis, seguro, facil
#   Instalar en PC de la cafeteria + tu celular
#
# → Para mostrar a un cliente o socio:
#   OPCION 2 (Ngrok) - Rapido para compartir un link temporal
`,
  },
  {
    id: 'connect',
    title: '12. Conectar React con Django',
    icon: <Globe size={18} />,
    content: `# ============================================
# Como correr ambos proyectos al mismo tiempo
# ============================================
#
# Necesitas 2 COSAS corriendo simultaneamente:
# (¡Ya no necesitas XAMPP!)
#
# 1. TERMINAL 1 - Backend Django:
#    cd cafeteria_backend
#    venv\\Scripts\\activate
#    python manage.py runserver
#    → Corriendo en http://localhost:8000
#
# 2. TERMINAL 2 - Frontend React:
#    cd cafeteria-frontend
#    npm run dev
#    → Corriendo en http://localhost:5173
#
# Los 2 deben estar corriendo al mismo tiempo.
#
# ============================================
# Crear archivo: src/services/api.ts (en el proyecto React)
# ============================================

const API_URL = 'http://localhost:8000/api';

// ---- CATEGORIAS ----
export async function fetchCategories() {
    const res = await fetch(API_URL + '/categories/');
    const data = await res.json();
    return data.results || data;
}

// ---- PRODUCTOS ----
export async function fetchProducts(categoryId?: number) {
    const params = categoryId ? '?category=' + categoryId : '';
    const res = await fetch(API_URL + '/products/' + params);
    const data = await res.json();
    return data.results || data;
}

export async function createProduct(data: any) {
    const res = await fetch(API_URL + '/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateProduct(id: number, data: any) {
    const res = await fetch(API_URL + '/products/' + id + '/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function toggleProductAvailability(id: number) {
    const res = await fetch(
        API_URL + '/products/' + id + '/toggle_availability/',
        { method: 'POST' }
    );
    return res.json();
}

// ---- PEDIDOS ----
export async function fetchOrders(status?: string) {
    const params = status ? '?status=' + status : '';
    const res = await fetch(API_URL + '/orders/' + params);
    const data = await res.json();
    return data.results || data;
}

export async function createOrder(data: {
    table_number: number | null;
    order_type: 'dine-in' | 'takeaway';
    customer_name: string;
    items: { product_id: number; quantity: number }[];
}) {
    const res = await fetch(API_URL + '/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function updateOrderStatus(id: number, status: string) {
    const res = await fetch(
        API_URL + '/orders/' + id + '/update_status/',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        }
    );
    return res.json();
}

// ---- MESAS ----
export async function fetchTables() {
    const res = await fetch(API_URL + '/tables/');
    const data = await res.json();
    return data.results || data;
}

export async function updateTableStatus(id: number, status: string) {
    const res = await fetch(
        API_URL + '/tables/' + id + '/update_status/',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        }
    );
    return res.json();
}

// ---- DASHBOARD ----
export async function fetchDashboardStats() {
    const res = await fetch(API_URL + '/dashboard/');
    return res.json();
}
`,
  },
];

export default function DjangoGuide() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['why-sqlite']));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenSections(new Set(sections.map((s) => s.id)));
  };

  const collapseAll = () => {
    setOpenSections(new Set());
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Server className="text-amber-600" size={24} />
            Guía: Django + SQLite (Sin XAMPP)
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Configuración simplificada — sin MySQL, sin XAMPP, sin complicaciones
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            Expandir todo
          </button>
          <button
            onClick={collapseAll}
            className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-bold text-amber-800 mb-3">🏗️ Arquitectura del Sistema (Simplificada)</h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="bg-white rounded-xl p-4 border border-amber-200 text-center min-w-[140px]">
            <div className="text-2xl mb-1">⚛️</div>
            <p className="font-bold text-sm text-gray-800">React Frontend</p>
            <p className="text-xs text-gray-500">:5173</p>
          </div>
          <div className="text-amber-400 text-2xl font-bold">→</div>
          <div className="bg-white rounded-xl p-4 border border-green-200 text-center min-w-[140px]">
            <div className="text-2xl mb-1">🐍</div>
            <p className="font-bold text-sm text-gray-800">Django API</p>
            <p className="text-xs text-gray-500">:8000</p>
          </div>
          <div className="text-amber-400 text-2xl font-bold">→</div>
          <div className="bg-white rounded-xl p-4 border border-blue-200 text-center min-w-[140px]">
            <div className="text-2xl mb-1">📄</div>
            <p className="font-bold text-sm text-gray-800">SQLite</p>
            <p className="text-xs text-gray-500">db.sqlite3 (1 archivo)</p>
          </div>
        </div>
        <div className="mt-4 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <p className="text-sm text-emerald-800 font-medium flex items-center gap-2">
            ✅ Ventajas vs la configuración anterior (XAMPP/MariaDB):
          </p>
          <ul className="text-xs text-emerald-700 mt-2 space-y-1 ml-6 list-disc">
            <li><strong>NO necesitas XAMPP</strong> — puedes desinstalarlo</li>
            <li><strong>NO necesitas PyMySQL</strong> ni parches de versión</li>
            <li><strong>NO hay errores</strong> de conexión, puertos o contraseñas</li>
            <li><strong>Solo instalas 3 paquetes</strong>: django, djangorestframework, django-cors-headers</li>
            <li><strong>Backup = copiar 1 archivo</strong> (db.sqlite3) a USB o nube</li>
          </ul>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="font-bold text-blue-800 mb-2">📋 Solo necesitas esto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-blue-100">
            <p className="font-medium text-sm text-gray-800">🐍 Python 3.10+</p>
            <code className="text-xs text-gray-500">python --version</code>
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-100">
            <p className="font-medium text-sm text-gray-800">📦 pip</p>
            <code className="text-xs text-gray-500">pip --version</code>
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-100">
            <p className="font-medium text-sm text-gray-800">🟢 Node.js 18+</p>
            <code className="text-xs text-gray-500">node --version</code>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-3 font-medium text-center">
          ¡Eso es todo! No necesitas XAMPP, MySQL, MariaDB ni ningún servidor de BD.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          const bgClass = section.highlight === 'red'
            ? 'bg-red-50 border-red-200'
            : section.highlight === 'green'
            ? 'bg-emerald-50 border-emerald-200'
            : section.highlight === 'blue'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-white border-gray-100';
          const hoverClass = section.highlight === 'red'
            ? 'hover:bg-red-100'
            : section.highlight === 'green'
            ? 'hover:bg-emerald-100'
            : section.highlight === 'blue'
            ? 'hover:bg-blue-100'
            : 'hover:bg-gray-50';
          const iconColor = section.highlight === 'red'
            ? 'text-red-600'
            : section.highlight === 'green'
            ? 'text-emerald-600'
            : section.highlight === 'blue'
            ? 'text-blue-600'
            : 'text-amber-600';
          const titleColor = section.highlight === 'red'
            ? 'text-red-800'
            : section.highlight === 'green'
            ? 'text-emerald-800'
            : section.highlight === 'blue'
            ? 'text-blue-800'
            : 'text-gray-800';
          const badge = section.highlight === 'red'
            ? { text: 'LEER PRIMERO', bg: 'bg-red-200 text-red-800' }
            : section.highlight === 'green'
            ? { text: 'FÁCIL', bg: 'bg-emerald-200 text-emerald-800' }
            : section.highlight === 'blue'
            ? { text: 'ACCESO REMOTO', bg: 'bg-blue-200 text-blue-800' }
            : null;

          return (
            <div
              key={section.id}
              className={`rounded-2xl border shadow-sm overflow-hidden ${bgClass}`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center gap-3 p-4 transition-colors text-left ${hoverClass}`}
              >
                <div className={iconColor}>
                  {section.icon}
                </div>
                <span className={`font-semibold flex-1 ${titleColor}`}>
                  {section.title}
                </span>
                {badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.bg}`}>
                    {badge.text}
                  </span>
                )}
                {isOpen ? (
                  <ChevronDown size={18} className="text-gray-400" />
                ) : (
                  <ChevronRight size={18} className="text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  <div className="flex justify-end p-2 pb-0">
                    <button
                      onClick={() => copyToClipboard(section.content, section.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      {copiedId === section.id ? (
                        <>
                          <Check size={14} className="text-emerald-500" />
                          <span className="text-emerald-500">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copiar código
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 pt-2 text-sm text-gray-700 overflow-x-auto bg-gray-50 m-3 mt-0 rounded-xl leading-relaxed">
                    <code>{section.content}</code>
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Summary */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <h3 className="font-bold text-emerald-800 mb-3">✅ Resumen rápido — Todos los comandos</h3>
        <div className="bg-white rounded-xl p-4 border border-emerald-100">
          <pre className="text-sm text-gray-700 leading-loose whitespace-pre-wrap">{`# ===== CREAR PROYECTO DJANGO =====
mkdir cafeteria_backend && cd cafeteria_backend
python -m venv venv
venv\\Scripts\\activate                    # (source venv/bin/activate en Mac)
pip install django djangorestframework django-cors-headers

django-admin startproject cafeteria_backend .
python manage.py startapp api

# ===== CONFIGURAR ARCHIVOS =====
# 1. cafeteria_backend/settings.py  → Config (Paso 3)
# 2. api/models.py                  → Modelos (Paso 4)
# 3. api/serializers.py             → CREAR nuevo (Paso 5)
# 4. api/views.py                   → Endpoints (Paso 6)
# 5. api/urls.py                    → CREAR nuevo (Paso 7)
# 6. cafeteria_backend/urls.py      → Agregar api/ (Paso 7)
# 7. api/admin.py                   → Panel admin (Paso 8)

# ===== EJECUTAR =====
python manage.py makemigrations api
python manage.py migrate                  # Crea db.sqlite3 automáticamente
python manage.py seed_data                # Cargar datos de prueba
python manage.py createsuperuser
python manage.py runserver

# ===== VERIFICAR =====
# http://localhost:8000/admin/   → Panel admin
# http://localhost:8000/api/     → API REST`}</pre>
        </div>
      </div>

      {/* Two Services */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
        <h3 className="font-bold text-purple-800 mb-3">🖥️ Para que todo funcione: 2 terminales</h3>
        <p className="text-sm text-purple-600 mb-4">¡Ya no necesitas XAMPP! Solo 2 terminales abiertas.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-green-200">
            <p className="font-bold text-sm text-green-800 mb-2">🐍 Terminal 1 — Django</p>
            <pre className="text-xs text-gray-600 leading-relaxed">{`cd cafeteria_backend
venv\\Scripts\\activate
python manage.py runserver

→ http://localhost:8000`}</pre>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <p className="font-bold text-sm text-blue-800 mb-2">⚛️ Terminal 2 — React</p>
            <pre className="text-xs text-gray-600 leading-relaxed">{`cd cafeteria-frontend
npm run dev

→ http://localhost:5173`}</pre>
          </div>
        </div>
      </div>

      {/* Remote Access Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
        <h3 className="font-bold text-indigo-800 mb-3">🌐 Acceso Remoto — Resumen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-indigo-100">
            <p className="font-bold text-sm text-indigo-800 mb-1">📶 Red Local</p>
            <p className="text-xs text-gray-600">Misma WiFi del negocio</p>
            <p className="text-xs text-emerald-600 font-medium mt-2">✅ Gratis, sin instalar nada</p>
            <p className="text-xs text-gray-400 mt-1">Ideal para: uso diario en la cafetería</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-indigo-100">
            <p className="font-bold text-sm text-indigo-800 mb-1">🔗 Ngrok</p>
            <p className="text-xs text-gray-600">Desde cualquier lugar</p>
            <p className="text-xs text-emerald-600 font-medium mt-2">✅ Gratis, fácil de usar</p>
            <p className="text-xs text-gray-400 mt-1">Ideal para: compartir link temporal</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-indigo-100">
            <p className="font-bold text-sm text-indigo-800 mb-1">🔒 Tailscale</p>
            <p className="text-xs text-gray-600">VPN personal segura</p>
            <p className="text-xs text-emerald-600 font-medium mt-2">✅ Gratis, más seguro</p>
            <p className="text-xs text-gray-400 mt-1">Ideal para: acceso permanente desde casa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
