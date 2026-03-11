#!/usr/bin/env python3
"""
fix_emojis.py - Corrige los íconos de productos en la base de datos SQLite
Ejecutar desde la carpeta raíz: python fix_emojis.py
"""
import os
import sys
import sqlite3
from pathlib import Path

# Mapa de nombres de texto a emojis
NAME_TO_EMOJI = {
    # Cafés
    'espresso': '☕', 'café': '☕', 'cafe': '☕', 'latte': '☕',
    'cappuccino': '☕', 'capuchino': '☕', 'americano': '☕',
    'cortado': '☕', 'macchiato': '☕', 'mocha': '☕',
    # Tés e infusiones
    'té': '🍵', 'te ': '🍵', 'infusion': '🍵', 'manzanilla': '🍵',
    'verde': '🍵', 'matcha': '🍵',
    # Jugos y bebidas frías
    'jugo': '🧃', 'zumo': '🧃', 'limonada': '🧃', 'naranja': '🧃',
    # Agua
    'agua': '💧',
    # Leche
    'leche': '🥛',
    # Chocolate
    'chocolate': '🍫',
    # Tortas y pasteles
    'torta': '🎂', 'pastel': '🎂', 'cake': '🎂',
    'tarta': '🍰', 'cheesecake': '🍰',
    # Cupcakes
    'cupcake': '🧁', 'muffin': '🧁',
    # Panadería
    'medialuna': '🥐', 'croissant': '🥐',
    'pan': '🍞', 'bread': '🍞',
    # Sandwiches
    'sandwich': '🥪', 'sándwich': '🥪',
    # Ensaladas
    'ensalada': '🥗', 'salad': '🥗',
    # Helados
    'helado': '🍦', 'ice cream': '🍦',
    # Galletas
    'galleta': '🍪', 'cookie': '🍪',
    # Donas
    'dona': '🍩', 'donut': '🍩',
    # Desayunos
    'desayuno': '🍳', 'breakfast': '🍳', 'huevo': '🍳',
    # Batidos
    'batido': '🥤', 'smoothie': '🥤', 'frappé': '🥤', 'frappe': '🥤',
    # Comidas
    'pizza': '🍕',
    'hamburguesa': '🍔', 'burger': '🍔',
    'fruta': '🍎', 'fruit': '🍎',
    'waf': '🧇', 'pancake': '🧇',
    'granola': '🥣', 'cereal': '🥣',
    'yogur': '🥛',
}

def get_emoji_for_name(name: str) -> str:
    """Determina el emoji correcto basado en el nombre del producto."""
    n = name.lower()
    for keyword, emoji in NAME_TO_EMOJI.items():
        if keyword in n:
            return emoji
    return '🍽️'

def is_real_emoji(text: str) -> bool:
    """Verifica si el texto ya es un emoji real."""
    if not text or text.strip() == '':
        return False
    cleaned = text.strip()
    has_non_ascii = any(ord(c) > 127 for c in cleaned)
    return has_non_ascii and len(cleaned) <= 10

def fix_emojis():
    # Buscar la base de datos SQLite
    script_dir = Path(os.path.abspath(__file__)).parent
    possible_paths = [
        script_dir / 'cafeteria_backend' / 'db.sqlite3',
        script_dir / 'backend-django' / 'db.sqlite3',
        script_dir / 'db.sqlite3',
    ]

    db_path = None
    for path in possible_paths:
        if path.exists():
            db_path = path
            break

    if not db_path:
        print("❌ No se encontró db.sqlite3")
        print("   Rutas buscadas:")
        for p in possible_paths:
            print(f"   - {p}")
        sys.exit(1)

    print(f"✅ Base de datos encontrada: {db_path}")
    print()

    # Conectar a SQLite
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    # Verificar que existe la tabla de productos
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%product%'")
    tables = cursor.fetchall()

    if not tables:
        print("❌ No se encontró tabla de productos")
        conn.close()
        sys.exit(1)

    product_table = tables[0][0]
    print(f"📋 Tabla de productos: {product_table}")

    # Obtener todos los productos
    cursor.execute(f"SELECT id, name, image FROM {product_table}")
    products = cursor.fetchall()

    print(f"📦 Total de productos: {len(products)}")
    print()

    corrected = 0
    skipped = 0

    for product_id, name, image in products:
        if image and is_real_emoji(image):
            print(f"  ✓ [{product_id}] {name:<30} → {image} (ya es emoji, sin cambios)")
            skipped += 1
            continue

        new_emoji = get_emoji_for_name(name)
        old_value = image or '(vacío)'

        cursor.execute(f"UPDATE {product_table} SET image = ? WHERE id = ?", (new_emoji, product_id))
        print(f"  🔄 [{product_id}] {name:<30} '{old_value}' → {new_emoji}")
        corrected += 1

    conn.commit()
    conn.close()

    print()
    print("=" * 50)
    print(f"✅ Correcciones aplicadas: {corrected}")
    print(f"⏭️  Sin cambios (ya tenían emoji): {skipped}")
    print()
    print("🔄 Reinicia el servidor Django para ver los cambios:")
    print("   Ctrl+C en la terminal de Django y luego:")
    print("   python manage.py runserver")
    print()

if __name__ == '__main__':
    fix_emojis()
