#!/usr/bin/env python3
"""
==============================================================
  SCRIPT DE CONFIGURACION AUTOMATICA - CAFETERIA BACKEND
  Compatible con Windows, Mac y Linux
  Django + SQLite + Django REST Framework
==============================================================
  ESTRUCTURA DEL PROYECTO:
    C:\\cafeteria_jujuy\\
    |-- setup_backend.py        <- ejecutar desde aqui
    |-- cafeteria_frontend\\    <- frontend React (package.json)
    |-- cafeteria_backend\\     <- backend Django (se crea aqui)

  USO:
    python setup_backend.py

  REQUISITOS:
    - Python 3.8 o superior
    - Conexion a internet (para instalar paquetes)
==============================================================
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

# ── CONFIGURACION ────────────────────────────────────────────
SCRIPT_DIR     = Path(os.path.abspath(__file__)).parent   # Carpeta donde esta setup_backend.py
BACKEND_DIR    = SCRIPT_DIR / "cafeteria_backend"         # C:\cafeteria_jujuy\cafeteria_backend
FRONTEND_DIR   = SCRIPT_DIR / "cafeteria_frontend"        # C:\cafeteria_jujuy\cafeteria_frontend
PROJECT_NAME   = "cafeteria_backend"
APP_NAME       = "api"
SUPERUSER_USER = "admin"
SUPERUSER_PASS = "admin1234"
SUPERUSER_MAIL = "admin@cafeteria.com"
IS_WINDOWS     = platform.system() == "Windows"

# ── HELPERS ──────────────────────────────────────────────────
def step(n, msg):  print(f"\n[Paso {n}] {msg}")
def ok(msg):       print(f"  OK  {msg}")
def warn(msg):     print(f"  AVISO  {msg}")
def err(msg):      print(f"  ERROR  {msg}")

def venv_python():
    if IS_WINDOWS:
        return BACKEND_DIR / "venv" / "Scripts" / "python.exe"
    return BACKEND_DIR / "venv" / "bin" / "python"

def venv_pip():
    if IS_WINDOWS:
        return BACKEND_DIR / "venv" / "Scripts" / "pip.exe"
    return BACKEND_DIR / "venv" / "bin" / "pip"

def venv_django_admin():
    if IS_WINDOWS:
        return BACKEND_DIR / "venv" / "Scripts" / "django-admin.exe"
    return BACKEND_DIR / "venv" / "bin" / "django-admin"

def run_cmd(args, cwd=None, check=True):
    args_list = [str(a) for a in args]
    try:
        result = subprocess.run(
            args_list,
            cwd=str(cwd) if cwd else None,
            shell=False,
            text=True,
            capture_output=False
        )
        if check and result.returncode != 0:
            return False
        return True
    except FileNotFoundError as e:
        err(f"Archivo no encontrado: {e}")
        return False
    except Exception as e:
        err(f"Error inesperado: {e}")
        return False

def write_file(path, content):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    ok(f"Archivo creado: {p}")

# ══════════════════════════════════════════════════════════════
#  CONTENIDO DE LOS ARCHIVOS DJANGO
# ══════════════════════════════════════════════════════════════

SETTINGS_PY = """
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-cafeteria-2024-cambiar-en-produccion'
DEBUG = True
ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1', '0.0.0.0']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cafeteria_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cafeteria_backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Argentina/Jujuy'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS - Permite conexion desde el frontend React
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
]
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization',
    'content-type', 'dnt', 'origin', 'user-agent',
    'x-csrftoken', 'x-requested-with',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [],
}
"""

MAIN_URLS_PY = """
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'Cafeteria API funcionando correctamente',
        'endpoints': {
            'categories': '/api/categories/',
            'products':   '/api/products/',
            'tables':     '/api/tables/',
            'orders':     '/api/orders/',
            'users':      '/api/users/',
            'login':      '/api/auth/login/',
            'admin':      '/admin/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', api_root),
]
"""

MODELS_PY = """
from django.db import models


class Category(models.Model):
    name  = models.CharField(max_length=100, verbose_name='Nombre')
    icon  = models.CharField(max_length=10, default='coffee', verbose_name='Icono')
    color = models.CharField(max_length=80, default='bg-amber-100 text-amber-800', verbose_name='Color')

    class Meta:
        verbose_name        = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering            = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name        = models.CharField(max_length=200, verbose_name='Nombre')
    description = models.TextField(blank=True, default='', verbose_name='Descripcion')
    price       = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio')
    image       = models.CharField(max_length=20, default='', blank=True, verbose_name='Emoji')
    category    = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='products', verbose_name='Categoria'
    )
    available   = models.BooleanField(default=True, verbose_name='Disponible')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Producto'
        verbose_name_plural = 'Productos'
        ordering            = ['name']

    def __str__(self):
        return self.name


class Table(models.Model):
    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('occupied',  'Ocupada'),
        ('reserved',  'Reservada'),
        ('cleaning',  'Limpieza'),
    ]
    number = models.IntegerField(unique=True, verbose_name='Numero de Mesa')
    seats  = models.IntegerField(default=4, verbose_name='Asientos')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES,
        default='available', verbose_name='Estado'
    )

    class Meta:
        verbose_name        = 'Mesa'
        verbose_name_plural = 'Mesas'
        ordering            = ['number']

    def __str__(self):
        return f'Mesa {self.number}'


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pendiente'),
        ('preparing', 'Preparando'),
        ('ready',     'Listo'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]
    TYPE_CHOICES = [
        ('dine-in',  'En Mesa'),
        ('takeaway', 'Para Llevar'),
    ]
    table         = models.ForeignKey(
        Table, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='orders', verbose_name='Mesa'
    )
    table_number  = models.IntegerField(null=True, blank=True, verbose_name='Numero de Mesa')
    customer_name = models.CharField(max_length=200, blank=True, default='', verbose_name='Cliente')
    status        = models.CharField(
        max_length=20, choices=STATUS_CHOICES,
        default='pending', verbose_name='Estado'
    )
    type          = models.CharField(
        max_length=20, choices=TYPE_CHOICES,
        default='dine-in', verbose_name='Tipo'
    )
    total         = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Total')
    notes         = models.TextField(blank=True, default='', verbose_name='Notas')
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Pedido'
        verbose_name_plural = 'Pedidos'
        ordering            = ['-created_at']

    def __str__(self):
        return f'Pedido #{self.id} - {self.customer_name}'


class OrderItem(models.Model):
    order    = models.ForeignKey(
        Order, on_delete=models.CASCADE,
        related_name='items', verbose_name='Pedido'
    )
    product  = models.ForeignKey(
        Product, on_delete=models.SET_NULL,
        null=True, verbose_name='Producto'
    )
    quantity = models.IntegerField(default=1, verbose_name='Cantidad')
    price    = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Precio unitario')
    notes    = models.TextField(blank=True, default='', verbose_name='Notas')

    class Meta:
        verbose_name        = 'Item de Pedido'
        verbose_name_plural = 'Items de Pedido'

    def __str__(self):
        return f'{self.quantity}x {self.product}'
"""

SERIALIZERS_PY = """
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Table, Order, OrderItem


class UserSerializer(serializers.ModelSerializer):
    role      = serializers.SerializerMethodField()
    firstName = serializers.CharField(source='first_name')
    lastName  = serializers.CharField(source='last_name')
    isActive  = serializers.BooleanField(source='is_active')

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'isActive']

    def get_role(self, obj):
        if obj.is_superuser or obj.groups.filter(name='Administradores').exists():
            return 'admin'
        if obj.groups.filter(name='Cajeros').exists():
            return 'cashier'
        return 'waiter'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'icon', 'color']


class ProductSerializer(serializers.ModelSerializer):
    categoryId   = serializers.SerializerMethodField()
    categoryName = serializers.SerializerMethodField()
    category_id  = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'description', 'price',
            'image', 'available',
            'categoryId', 'categoryName', 'category_id',
            'created_at', 'updated_at'
        ]

    def get_categoryId(self, obj):
        return obj.category_id

    def get_categoryName(self, obj):
        return obj.category.name if obj.category else ''

    def create(self, validated_data):
        cat_id  = validated_data.pop('category_id', None)
        product = Product(**validated_data)
        if cat_id:
            product.category_id = cat_id
        product.save()
        return product

    def update(self, instance, validated_data):
        cat_id = validated_data.pop('category_id', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if cat_id is not None:
            instance.category_id = cat_id
        instance.save()
        return instance


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Table
        fields = ['id', 'number', 'seats', 'status']


class OrderItemReadSerializer(serializers.ModelSerializer):
    productId    = serializers.SerializerMethodField()
    productName  = serializers.SerializerMethodField()
    productImage = serializers.SerializerMethodField()
    unitPrice    = serializers.SerializerMethodField()
    subtotal     = serializers.SerializerMethodField()

    class Meta:
        model  = OrderItem
        fields = ['id', 'productId', 'productName', 'productImage', 'quantity', 'unitPrice', 'subtotal', 'price', 'notes']

    def get_productId(self, obj):
        return obj.product.id if obj.product else None

    def get_productName(self, obj):
        return obj.product.name if obj.product else ''

    def get_productImage(self, obj):
        return obj.product.image if obj.product else ''

    def get_unitPrice(self, obj):
        if obj.product:
            return float(obj.product.price)
        return float(obj.price) / obj.quantity if obj.quantity else 0

    def get_subtotal(self, obj):
        if obj.product:
            return round(float(obj.product.price) * obj.quantity, 2)
        return float(obj.price)


class OrderItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False, allow_null=True)
    product    = serializers.IntegerField(required=False, allow_null=True)
    quantity   = serializers.IntegerField(default=1)
    notes      = serializers.CharField(default='', allow_blank=True)

    def validate(self, data):
        pid = data.get('product_id') or data.get('product')
        if not pid:
            raise serializers.ValidationError('Se requiere product_id o product')
        data['resolved_product_id'] = pid
        return data


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'items', 'table_number', 'customer_name',
            'status', 'type', 'total', 'notes',
            'created_at', 'updated_at'
        ]


class OrderCreateSerializer(serializers.Serializer):
    items         = OrderItemWriteSerializer(many=True)
    table_number  = serializers.IntegerField(required=False, allow_null=True)
    customer_name = serializers.CharField(default='', allow_blank=True)
    type          = serializers.CharField(default='dine-in')
    notes         = serializers.CharField(default='', allow_blank=True)

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order      = Order.objects.create(**validated_data)
        total      = 0
        for item_data in items_data:
            pid = item_data['resolved_product_id']
            qty = item_data.get('quantity', 1)
            try:
                product = Product.objects.get(id=pid)
                price   = float(product.price) * qty
                total  += price
                OrderItem.objects.create(
                    order=order, product=product,
                    quantity=qty, price=price,
                    notes=item_data.get('notes', '')
                )
            except Product.DoesNotExist:
                pass
        order.total = round(total, 2)
        order.save()
        return order
"""

VIEWS_PY = """
import json
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from .models import Category, Product, Table, Order
from .serializers import (
    CategorySerializer, ProductSerializer, TableSerializer,
    OrderSerializer, OrderCreateSerializer, UserSerializer,
)


@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)
    try:
        body = json.loads(request.body)
    except Exception:
        return JsonResponse({'error': 'JSON invalido'}, status=400)

    username = body.get('username', '').strip()
    password = body.get('password', '').strip()

    if not username or not password:
        return JsonResponse({'error': 'Usuario y contrasena son requeridos'}, status=400)

    user = authenticate(request, username=username, password=password)
    if not user:
        return JsonResponse({'error': 'Usuario o contrasena incorrectos'}, status=401)
    if not user.is_active:
        return JsonResponse({'error': 'Esta cuenta esta desactivada'}, status=403)

    if user.is_superuser or user.groups.filter(name='Administradores').exists():
        role = 'admin'
    elif user.groups.filter(name='Cajeros').exists():
        role = 'cashier'
    else:
        role = 'waiter'

    full_name = f'{user.first_name} {user.last_name}'.strip() or user.username

    return JsonResponse({
        'id':        user.id,
        'username':  user.username,
        'firstName': user.first_name,
        'lastName':  user.last_name,
        'fullName':  full_name,
        'email':     user.email,
        'role':      role,
        'isStaff':   user.is_staff,
    })


class UserViewSet(viewsets.ViewSet):

    def list(self, request):
        users = User.objects.all().order_by('username')
        data  = []
        for u in users:
            if u.is_superuser or u.groups.filter(name='Administradores').exists():
                role = 'admin'
            elif u.groups.filter(name='Cajeros').exists():
                role = 'cashier'
            else:
                role = 'waiter'
            data.append({
                'id':        u.id,
                'username':  u.username,
                'email':     u.email,
                'firstName': u.first_name,
                'lastName':  u.last_name,
                'role':      role,
                'isActive':  u.is_active,
            })
        return Response(data)

    def create(self, request):
        d        = request.data
        username = d.get('username', '').strip()
        password = d.get('password', '').strip()
        if not username or not password:
            return Response({'error': 'username y password son requeridos'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'El usuario ya existe'}, status=400)

        u = User.objects.create_user(
            username   = username,
            password   = password,
            email      = d.get('email', ''),
            first_name = d.get('firstName', ''),
            last_name  = d.get('lastName',  ''),
        )
        role = d.get('role', 'waiter')
        if role == 'admin':
            u.is_staff = True
            u.save()
        group_map  = {'admin': 'Administradores', 'cashier': 'Cajeros', 'waiter': 'Meseros'}
        group_name = group_map.get(role)
        if group_name:
            group, _ = Group.objects.get_or_create(name=group_name)
            u.groups.set([group])

        return Response(UserSerializer(u).data, status=201)

    def update(self, request, pk=None):
        try:
            u = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)

        d            = request.data
        u.email      = d.get('email',     u.email)
        u.first_name = d.get('firstName', u.first_name)
        u.last_name  = d.get('lastName',  u.last_name)
        u.is_active  = d.get('isActive',  u.is_active)

        new_username = d.get('username', u.username)
        if new_username != u.username:
            if User.objects.filter(username=new_username).exists():
                return Response({'error': 'El nombre de usuario ya existe'}, status=400)
            u.username = new_username

        if d.get('password') and len(d['password']) >= 6:
            u.set_password(d['password'])

        role = d.get('role')
        if role:
            group_map  = {'admin': 'Administradores', 'cashier': 'Cajeros', 'waiter': 'Meseros'}
            group_name = group_map.get(role)
            u.is_staff = (role == 'admin')
            if group_name:
                group, _ = Group.objects.get_or_create(name=group_name)
                u.groups.set([group])

        u.save()
        return Response(UserSerializer(u).data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        try:
            u = User.objects.get(pk=pk)
            if u.is_superuser:
                return Response({'error': 'No se puede eliminar al superusuario'}, status=400)
            u.delete()
            return Response(status=204)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset         = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset         = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs        = super().get_queryset()
        category  = self.request.query_params.get('category')
        available = self.request.query_params.get('available')
        if category:
            qs = qs.filter(category_id=category)
        if available is not None:
            qs = qs.filter(available=available.lower() == 'true')
        return qs

    def _normalize_data(self, data):
        d = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'category' in d and 'category_id' not in d:
            d['category_id'] = d['category']
        if 'categoryId' in d and 'category_id' not in d:
            d['category_id'] = d['categoryId']
        return d

    def create(self, request, *args, **kwargs):
        data       = self._normalize_data(request.data)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        data       = self._normalize_data(request.data)
        partial    = kwargs.pop('partial', False)
        instance   = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'patch'])
    def toggle_available(self, request, pk=None):
        product           = self.get_object()
        product.available = not product.available
        product.save()
        return Response(ProductSerializer(product).data)


class TableViewSet(viewsets.ModelViewSet):
    queryset         = Table.objects.all()
    serializer_class = TableSerializer

    @action(detail=True, methods=['post', 'patch'])
    def update_status(self, request, pk=None):
        table      = self.get_object()
        new_status = request.data.get('status')
        valid      = [s[0] for s in Table.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': f'Estado invalido. Opciones: {valid}'}, status=400)
        table.status = new_status
        table.save()
        return Response(TableSerializer(table).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related('items__product').all()

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Normalizar tipo de pedido
        t        = data.get('type') or data.get('order_type') or 'dine-in'
        type_map = {
            'dine_in':    'dine-in',
            'dinein':     'dine-in',
            'en_mesa':    'dine-in',
            'en-mesa':    'dine-in',
            'takeout':    'takeaway',
            'take_away':  'takeaway',
            'take-away':  'takeaway',
            'para_llevar':'takeaway',
        }
        data['type'] = type_map.get(t, t)

        # Normalizar table_number
        tn = data.get('table_number') or data.get('table') or data.get('tableNumber')
        try:
            data['table_number'] = int(tn) if tn else None
        except (ValueError, TypeError):
            data['table_number'] = None

        # Normalizar customer_name
        data['customer_name'] = (
            data.get('customer_name') or
            data.get('customerName') or ''
        )

        # Normalizar items
        items = data.get('items', [])
        normalized_items = []
        for item in items:
            pid = (
                item.get('product_id') or
                item.get('productId') or
                item.get('product')
            )
            normalized_items.append({
                'product_id': pid,
                'quantity':   item.get('quantity', 1),
                'notes':      item.get('notes', ''),
            })
        data['items'] = normalized_items

        serializer = OrderCreateSerializer(data=data)
        if serializer.is_valid():
            order = serializer.save()

            # Actualizar estado de la mesa automaticamente
            if order.type == 'dine-in' and order.table_number:
                try:
                    table        = Table.objects.get(number=order.table_number)
                    table.status = 'occupied'
                    table.save()
                except Table.DoesNotExist:
                    pass

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post', 'patch'])
    def update_status(self, request, pk=None):
        order      = self.get_object()
        new_status = request.data.get('status')
        valid      = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': f'Estado invalido. Opciones: {valid}'}, status=400)
        old_status   = order.status
        order.status = new_status
        order.save()

        # Liberar mesa cuando el pedido es entregado o cancelado
        if new_status in ('delivered', 'cancelled') and old_status not in ('delivered', 'cancelled'):
            if order.type == 'dine-in' and order.table_number:
                try:
                    table        = Table.objects.get(number=order.table_number)
                    other_active = Order.objects.filter(
                        table_number=order.table_number,
                        type='dine-in'
                    ).exclude(id=order.id).exclude(
                        status__in=['delivered', 'cancelled']
                    ).exists()
                    if not other_active:
                        table.status = 'available'
                        table.save()
                except Table.DoesNotExist:
                    pass

        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        today        = timezone.now().date()
        today_orders = Order.objects.filter(created_at__date=today)
        delivered    = today_orders.filter(status='delivered')
        total_sales  = sum(float(o.total) for o in delivered)
        avg_ticket   = total_sales / delivered.count() if delivered.count() > 0 else 0
        return Response({
            'today_orders': today_orders.count(),
            'today_sales':  round(total_sales, 2),
            'avg_ticket':   round(avg_ticket, 2),
            'pending':      today_orders.filter(status='pending').count(),
            'preparing':    today_orders.filter(status='preparing').count(),
            'ready':        today_orders.filter(status='ready').count(),
            'delivered':    delivered.count(),
            'cancelled':    today_orders.filter(status='cancelled').count(),
        })
"""

API_URLS_PY = """
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'products',   views.ProductViewSet,  basename='product')
router.register(r'tables',     views.TableViewSet,    basename='table')
router.register(r'orders',     views.OrderViewSet,    basename='order')
router.register(r'users',      views.UserViewSet,     basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='login'),
]
"""

ADMIN_PY = """
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Category, Product, Table, Order, OrderItem


class CustomUserAdmin(UserAdmin):
    list_display  = ['username', 'first_name', 'last_name', 'email', 'get_role', 'is_active']
    list_filter   = ['is_active', 'groups', 'is_staff']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering      = ['username']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'Superusuario'
        groups = obj.groups.values_list('name', flat=True)
        if 'Administradores' in groups: return 'Administrador'
        if 'Cajeros'         in groups: return 'Cajero'
        if 'Meseros'         in groups: return 'Mesero'
        return 'Sin rol'
    get_role.short_description = 'Rol'


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['id', 'icon', 'name']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ['id', 'image', 'name', 'category', 'price', 'available']
    list_filter   = ['category', 'available']
    list_editable = ['price', 'available']
    search_fields = ['name', 'description']


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display  = ['id', 'number', 'seats', 'status']
    list_editable = ['status']
    list_filter   = ['status']
    ordering      = ['number']


class OrderItemInline(admin.TabularInline):
    model           = OrderItem
    extra           = 0
    readonly_fields = ['price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ['id', 'customer_name', 'table_number', 'status', 'type', 'total', 'created_at']
    list_filter     = ['status', 'type', 'created_at']
    search_fields   = ['customer_name']
    inlines         = [OrderItemInline]
    readonly_fields = ['created_at', 'updated_at']
    ordering        = ['-created_at']
"""

# ── SEED DATA ─────────────────────────────────────────────────
SEED_PY = (
    "import os, django\n"
    "os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafeteria_backend.settings')\n"
    "django.setup()\n"
    "from api.models import Category, Product, Table\n"
    "from django.contrib.auth.models import Group\n"
    "\n"
    "print('Limpiando datos anteriores...')\n"
    "Product.objects.all().delete()\n"
    "Category.objects.all().delete()\n"
    "Table.objects.all().delete()\n"
    "\n"
    "print('Creando categorias...')\n"
    "cats_data = [\n"
    "    ('Cafe',           'bg-amber-100 text-amber-800'),\n"
    "    ('Te e Infusiones','bg-green-100 text-green-800'),\n"
    "    ('Bebidas Frias',  'bg-blue-100 text-blue-800'),\n"
    "    ('Postres',        'bg-pink-100 text-pink-800'),\n"
    "    ('Sandwiches',     'bg-yellow-100 text-yellow-800'),\n"
    "    ('Desayunos',      'bg-orange-100 text-orange-800'),\n"
    "]\n"
    "cat_objs = {}\n"
    "for name, color in cats_data:\n"
    "    obj = Category.objects.create(name=name, color=color)\n"
    "    cat_objs[name] = obj\n"
    "\n"
    "print('Creando productos...')\n"
    "products = [\n"
    "    ('Espresso',             'Cafe espresso clasico puro',            2.50, 'Cafe'),\n"
    "    ('Americano',            'Espresso con agua caliente',            3.00, 'Cafe'),\n"
    "    ('Cappuccino',           'Espresso con leche espumada',           3.50, 'Cafe'),\n"
    "    ('Latte',                'Cafe con leche vaporizada',             4.00, 'Cafe'),\n"
    "    ('Mocaccino',            'Espresso con chocolate',                4.50, 'Cafe'),\n"
    "    ('Macchiato',            'Espresso con toque de leche',           3.00, 'Cafe'),\n"
    "    ('Te Verde',             'Te verde natural antioxidante',         2.50, 'Te e Infusiones'),\n"
    "    ('Te Negro',             'Te negro clasico energizante',          2.50, 'Te e Infusiones'),\n"
    "    ('Manzanilla',           'Infusion relajante de manzanilla',      2.00, 'Te e Infusiones'),\n"
    "    ('Jugo de Naranja',      'Jugo natural de naranja fresco',        3.00, 'Bebidas Frias'),\n"
    "    ('Limonada',             'Limonada natural refrescante',          3.00, 'Bebidas Frias'),\n"
    "    ('Smoothie de Fresa',    'Smoothie de fresa y yogur',             4.50, 'Bebidas Frias'),\n"
    "    ('Agua Mineral',         'Agua mineral con o sin gas',            1.50, 'Bebidas Frias'),\n"
    "    ('Frappe de Cafe',       'Cafe frio cremoso con chantilly',       5.00, 'Bebidas Frias'),\n"
    "    ('Cheesecake',           'Cheesecake de fresa con base galleta',  4.00, 'Postres'),\n"
    "    ('Brownie',              'Brownie de chocolate caliente',         3.50, 'Postres'),\n"
    "    ('Croissant',            'Croissant de mantequilla hojaldrado',   2.50, 'Postres'),\n"
    "    ('Muffin de Arandanos',  'Muffin artesanal de arandanos',         2.50, 'Postres'),\n"
    "    ('Dona Glaseada',        'Dona clasica con glaseado de colores',  2.00, 'Postres'),\n"
    "    ('Sandwich de Pollo',    'Sandwich de pollo a la plancha',        5.50, 'Sandwiches'),\n"
    "    ('Sandwich Vegetariano', 'Sandwich con vegetales frescos',        4.50, 'Sandwiches'),\n"
    "    ('Club Sandwich',        'Club sandwich clasico triple',          6.00, 'Sandwiches'),\n"
    "    ('Wrap de Pollo',        'Wrap con pollo y verduras',             5.00, 'Sandwiches'),\n"
    "    ('Desayuno Completo',    'Huevos revueltos, pan tostado y jugo',  8.00, 'Desayunos'),\n"
    "    ('Tostadas Mantequilla', 'Pan tostado con mantequilla y mermelada', 3.00, 'Desayunos'),\n"
    "    ('Granola con Yogur',    'Granola artesanal con yogur y miel',    4.50, 'Desayunos'),\n"
    "    ('Tostadas de Aguacate', 'Pan tostado con aguacate y huevo',      5.50, 'Desayunos'),\n"
    "    ('Panqueques',           'Panqueques con miel de maple',          5.00, 'Desayunos'),\n"
    "]\n"
    "for name, desc, price, cat_name in products:\n"
    "    cat = cat_objs.get(cat_name)\n"
    "    if cat:\n"
    "        Product.objects.create(name=name, description=desc, price=price, category=cat, available=True)\n"
    "\n"
    "print('Creando mesas...')\n"
    "for i in range(1, 13):\n"
    "    seats = 2 if i <= 3 else (6 if i >= 11 else 4)\n"
    "    Table.objects.create(number=i, seats=seats, status='available')\n"
    "\n"
    "print('Creando grupos de usuarios...')\n"
    "for g in ['Administradores', 'Cajeros', 'Meseros']:\n"
    "    Group.objects.get_or_create(name=g)\n"
    "\n"
    "nc = str(Category.objects.count())\n"
    "np = str(Product.objects.count())\n"
    "nt = str(Table.objects.count())\n"
    "print('')\n"
    "print('Datos cargados correctamente:')\n"
    "print('  ' + nc + ' categorias')\n"
    "print('  ' + np + ' productos')\n"
    "print('  ' + nt + ' mesas')\n"
    "print('  3 grupos: Administradores, Cajeros, Meseros')\n"
    "print('Listo!')\n"
)

SUPERUSER_PY = (
    "import os, django\n"
    "os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cafeteria_backend.settings')\n"
    "django.setup()\n"
    "from django.contrib.auth.models import User, Group\n"
    "if not User.objects.filter(username='admin').exists():\n"
    "    u = User.objects.create_superuser('admin', 'admin@cafeteria.com', 'admin1234')\n"
    "    g, _ = Group.objects.get_or_create(name='Administradores')\n"
    "    u.groups.set([g])\n"
    "    print('Superusuario creado: admin / admin1234')\n"
    "else:\n"
    "    print('El usuario admin ya existe')\n"
)

# ══════════════════════════════════════════════════════════════
#  PASOS DEL SCRIPT
# ══════════════════════════════════════════════════════════════

def paso1_verificar_python():
    step(1, "Verificando Python...")
    v = sys.version_info
    if v.major < 3 or (v.major == 3 and v.minor < 8):
        err(f"Necesitas Python 3.8+. Tienes {v.major}.{v.minor}")
        sys.exit(1)
    ok(f"Python {v.major}.{v.minor}.{v.micro} OK")

def paso2_crear_directorio():
    step(2, f"Creando directorio: {BACKEND_DIR}/")
    BACKEND_DIR.mkdir(exist_ok=True)
    ok(f"Directorio listo: {BACKEND_DIR}/")

def paso3_crear_venv():
    step(3, "Creando entorno virtual...")
    venv_dir = BACKEND_DIR / "venv"
    if venv_dir.exists():
        warn("El entorno virtual ya existe, omitiendo...")
        return
    result = run_cmd([sys.executable, "-m", "venv", "venv"], cwd=BACKEND_DIR)
    if not result:
        err("No se pudo crear el entorno virtual")
        sys.exit(1)
    ok("Entorno virtual creado")

def paso4_instalar_paquetes():
    step(4, "Instalando paquetes Python...")
    pip = venv_pip()
    if not pip.exists():
        err(f"No se encontro pip en: {pip}")
        sys.exit(1)

    packages = ["django", "djangorestframework", "django-cors-headers"]
    ok(f"Instalando: {', '.join(packages)}")
    run_cmd([str(pip), "install", "--upgrade", "pip", "-q"], cwd=BACKEND_DIR, check=False)
    result = run_cmd([str(pip), "install"] + packages, cwd=BACKEND_DIR)
    if not result:
        err("Error instalando paquetes")
        sys.exit(1)
    ok("Paquetes instalados correctamente")

def paso5_crear_proyecto():
    step(5, "Creando proyecto Django...")
    manage = BACKEND_DIR / "manage.py"
    if manage.exists():
        warn("El proyecto Django ya existe, omitiendo...")
        return
    da = venv_django_admin()
    if not da.exists():
        err(f"django-admin no encontrado en: {da}")
        sys.exit(1)
    result = run_cmd([str(da), "startproject", PROJECT_NAME, "."], cwd=BACKEND_DIR)
    if not result:
        err("Error creando proyecto Django")
        sys.exit(1)
    ok(f"Proyecto '{PROJECT_NAME}' creado")

def paso6_crear_app():
    step(6, f"Creando app '{APP_NAME}'...")
    app_dir = BACKEND_DIR / APP_NAME
    if app_dir.exists():
        warn(f"La app '{APP_NAME}' ya existe, omitiendo...")
        return
    py     = venv_python()
    result = run_cmd([str(py), "manage.py", "startapp", APP_NAME], cwd=BACKEND_DIR)
    if not result:
        err(f"Error creando app '{APP_NAME}'")
        sys.exit(1)
    ok(f"App '{APP_NAME}' creada")

def paso7_escribir_archivos():
    step(7, "Escribiendo archivos de configuracion...")
    write_file(BACKEND_DIR / PROJECT_NAME / "settings.py", SETTINGS_PY)
    write_file(BACKEND_DIR / PROJECT_NAME / "urls.py",     MAIN_URLS_PY)
    write_file(BACKEND_DIR / APP_NAME / "models.py",       MODELS_PY)
    write_file(BACKEND_DIR / APP_NAME / "serializers.py",  SERIALIZERS_PY)
    write_file(BACKEND_DIR / APP_NAME / "views.py",        VIEWS_PY)
    write_file(BACKEND_DIR / APP_NAME / "urls.py",         API_URLS_PY)
    write_file(BACKEND_DIR / APP_NAME / "admin.py",        ADMIN_PY)
    write_file(BACKEND_DIR / "seed_data.py",               SEED_PY)
    write_file(BACKEND_DIR / "create_superuser.py",        SUPERUSER_PY)
    ok("Todos los archivos escritos correctamente")

def paso8_migraciones():
    step(8, "Ejecutando migraciones (creando db.sqlite3)...")
    py = venv_python()
    r1 = run_cmd([str(py), "manage.py", "makemigrations", APP_NAME], cwd=BACKEND_DIR)
    r2 = run_cmd([str(py), "manage.py", "migrate"], cwd=BACKEND_DIR)
    if not (r1 and r2):
        err("Error en las migraciones")
        sys.exit(1)
    ok(f"Base de datos SQLite creada: {BACKEND_DIR}/db.sqlite3")

def paso9_superusuario():
    step(9, f"Creando superusuario '{SUPERUSER_USER}'...")
    py     = venv_python()
    result = run_cmd([str(py), "create_superuser.py"], cwd=BACKEND_DIR)
    if result:
        ok(f"Credenciales: {SUPERUSER_USER} / {SUPERUSER_PASS}")
    else:
        warn(f"Ejecuta manualmente: cd {BACKEND_DIR} && python manage.py createsuperuser")

def paso10_seed_data():
    step(10, "Cargando datos de prueba en SQLite...")
    py     = venv_python()
    result = run_cmd([str(py), "seed_data.py"], cwd=BACKEND_DIR)
    if result:
        ok("Datos cargados: 6 categorias, 28 productos, 12 mesas, 3 grupos")
    else:
        warn(f"Ejecuta manualmente: cd {BACKEND_DIR} && python seed_data.py")

def paso11_scripts_inicio():
    step(11, "Creando scripts de inicio automatico...")

    # Verificar si el frontend existe en la ruta esperada
    if not FRONTEND_DIR.exists() or not (FRONTEND_DIR / "package.json").exists():
        # Buscar en otras ubicaciones
        candidatos = [
            SCRIPT_DIR / "frontend",
            SCRIPT_DIR / "cafeteria-frontend",
            SCRIPT_DIR,
        ]
        frontend_encontrado = FRONTEND_DIR
        for c in candidatos:
            if (c / "package.json").exists():
                frontend_encontrado = c
                break
    else:
        frontend_encontrado = FRONTEND_DIR

    ok(f"Backend:  {BACKEND_DIR}")
    ok(f"Frontend: {frontend_encontrado}")

    if IS_WINDOWS:
        bat_lines = [
            "@echo off",
            "chcp 65001 > nul",
            "echo.",
            "echo ============================================",
            "echo    SISTEMA CAFETERIA JUJUY - Iniciando...",
            "echo ============================================",
            "echo.",
            "echo Verificando archivos...",
            f'if not exist "{BACKEND_DIR}\\manage.py" (',
            f'    echo ERROR: No se encontro manage.py en {BACKEND_DIR}',
            "    pause",
            "    exit /b 1",
            ")",
            f'if not exist "{frontend_encontrado}\\package.json" (',
            f'    echo ERROR: No se encontro package.json en {frontend_encontrado}',
            "    pause",
            "    exit /b 1",
            ")",
            "echo.",
            "echo [1/2] Iniciando Backend Django en puerto 8000...",
            f'start "Django Backend" cmd /k "cd /d {BACKEND_DIR} && venv\\Scripts\\activate && python manage.py runserver"',
            "timeout /t 3 /nobreak > nul",
            "echo [2/2] Iniciando Frontend React en puerto 5173...",
            f'start "React Frontend" cmd /k "cd /d {frontend_encontrado} && npm run dev"',
            "timeout /t 2 /nobreak > nul",
            "echo.",
            "echo ============================================",
            "echo  Sistema iniciado correctamente!",
            "echo.",
            f"echo  Frontend: http://localhost:5173",
            f"echo  Backend:  http://localhost:8000",
            f"echo  Admin:    http://localhost:8000/admin",
            f"echo  Usuario:  {SUPERUSER_USER} / {SUPERUSER_PASS}",
            "echo ============================================",
            "echo.",
            "pause",
        ]
        bat_content = "\n".join(bat_lines) + "\n"
        bat_path    = SCRIPT_DIR / "iniciar_cafeteria.bat"
        bat_path.write_text(bat_content, encoding="utf-8")
        ok(f"Script Windows creado: {bat_path}")

    else:
        sh_lines = [
            "#!/bin/bash",
            'echo "Iniciando Sistema Cafeteria..."',
            f'cd "{BACKEND_DIR}"',
            "source venv/bin/activate",
            "python manage.py runserver &",
            "DJANGO_PID=$!",
            'echo "Backend Django iniciado en http://localhost:8000"',
            "sleep 2",
            f'cd "{frontend_encontrado}"',
            "npm run dev &",
            "REACT_PID=$!",
            'echo "Frontend React iniciado en http://localhost:5173"',
            'echo ""',
            'echo "Presiona Ctrl+C para detener todo"',
            'trap "kill $DJANGO_PID $REACT_PID 2>/dev/null; echo Detenido." EXIT',
            "wait",
        ]
        sh_content = "\n".join(sh_lines) + "\n"
        sh_path    = SCRIPT_DIR / "iniciar_cafeteria.sh"
        sh_path.write_text(sh_content, encoding="utf-8")
        os.chmod(str(sh_path), 0o755)
        ok(f"Script Linux/Mac creado: {sh_path}")

    ok("Scripts de inicio creados correctamente")

def finalizar():
    print("\n")
    print("=" * 55)
    print("  CONFIGURACION COMPLETADA EXITOSAMENTE!")
    print("=" * 55)
    print("")
    print("RUTAS DEL PROYECTO:")
    print(f"  Backend:   {BACKEND_DIR}")
    print(f"  Frontend:  {FRONTEND_DIR}")
    print(f"  BD SQLite: {BACKEND_DIR}/db.sqlite3")
    print("")
    print("CREDENCIALES ADMIN:")
    print(f"  Usuario:    {SUPERUSER_USER}")
    print(f"  Contrasena: {SUPERUSER_PASS}")
    print(f"  URL Admin:  http://localhost:8000/admin")
    print("")
    print("COMO INICIAR EL SISTEMA:")
    print("")
    print("  Opcion A - Automatico (recomendado):")
    if IS_WINDOWS:
        print(f'    Doble clic en "iniciar_cafeteria.bat"')
        print(f'    Ubicado en: {SCRIPT_DIR}')
    else:
        print(f"    ./iniciar_cafeteria.sh")
    print("")
    print("  Opcion B - Manual (2 terminales separadas):")
    print("")
    print("    Terminal 1 - Backend Django:")
    print(f"      cd {BACKEND_DIR}")
    if IS_WINDOWS:
        print("      venv\\Scripts\\activate")
    else:
        print("      source venv/bin/activate")
    print("      python manage.py runserver")
    print("")
    print("    Terminal 2 - Frontend React:")
    print(f"      cd {FRONTEND_DIR}")
    print("      npm run dev")
    print("")
    print("URLS DEL SISTEMA:")
    print("  Frontend:  http://localhost:5173")
    print("  Backend:   http://localhost:8000")
    print("  API:       http://localhost:8000/api/")
    print("  Admin:     http://localhost:8000/admin")
    print("")
    print("=" * 55)

    resp = input("\nDeseas iniciar el servidor Django ahora? (s/n): ").strip().lower()
    if resp in ['s', 'si', 'y', 'yes']:
        print("\nIniciando Django en http://localhost:8000 ...")
        print("Presiona Ctrl+C para detener\n")
        py = venv_python()
        run_cmd([str(py), "manage.py", "runserver"], cwd=BACKEND_DIR, check=False)

# ══════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════

def main():
    print("")
    print("=" * 55)
    print("  CONFIGURACION AUTOMATICA - CAFETERIA BACKEND")
    print("  Django + SQLite - Compatible con Frontend React")
    print("=" * 55)
    print("")
    print(f"  Carpeta raiz: {SCRIPT_DIR}")
    print(f"  Backend:      {BACKEND_DIR}")
    print(f"  Frontend:     {FRONTEND_DIR}")
    print("")

    # Si ya existe la carpeta, preguntar si sobreescribir
    if BACKEND_DIR.exists() and (BACKEND_DIR / "manage.py").exists():
        print(f"  El directorio '{BACKEND_DIR.name}' ya existe.")
        resp = input("  Deseas sobreescribir los archivos de configuracion? (s/n): ").strip().lower()
        if resp not in ['s', 'si', 'y', 'yes']:
            print("\n  Solo se regeneraran los scripts de inicio...\n")
            paso11_scripts_inicio()
            finalizar()
            return

    paso1_verificar_python()
    paso2_crear_directorio()
    paso3_crear_venv()
    paso4_instalar_paquetes()
    paso5_crear_proyecto()
    paso6_crear_app()
    paso7_escribir_archivos()
    paso8_migraciones()
    paso9_superusuario()
    paso10_seed_data()
    paso11_scripts_inicio()
    finalizar()

if __name__ == "__main__":
    main()
