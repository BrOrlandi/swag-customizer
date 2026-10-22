import re
import json

HTML_FILE = "Gocase B2B _ Presentes Corporativos Personalizados – Soluções premium para onboarding, eventos, endomarketing e ações corporativas..html"
CSS_FILE = "Gocase B2B _ Presentes Corporativos Personalizados – Soluções premium para onboarding, eventos, endomarketing e ações corporativas._files/post-11.css"

# --- 1. Parse CSS bullet colors ---
with open(CSS_FILE, "r") as f:
    css = f.read()

bullet_colors = {}
pattern = r'#([\w-]+)-slider\s+\.swiper-pagination-bullet:nth-child\((\d+)\)\s*\{[^}]*background-color:\s*(#[a-fA-F0-9]+)[^}]*\}'
for match in re.finditer(pattern, css):
    slider_id = match.group(1)
    nth = int(match.group(2))
    color = match.group(3)
    if slider_id not in bullet_colors:
        bullet_colors[slider_id] = {}
    bullet_colors[slider_id][nth] = color

# --- 2. Parse HTML ---
with open(HTML_FILE, "r") as f:
    html = f.read()

COLOR_NAMES = {
    "#ffffff": "Branco",
    "#fbd4cb": "Rosa Claro",
    "#2f2f2f": "Preto",
    "#b0ebc5": "Verde Menta",
    "#a0a9ca": "Azul Lavanda",
    "#cebbdf": "Lilás",
    "#003e73": "Azul Marinho",
    "#e06575": "Rosa",
}

TEXTILE_COLOR_MAP = {
    "Imagens_Vitrine_Textil-removebg-preview.png": {"color": "#f5c6b8", "color_name": "Rosa"},
    "Imagens_Vitrine_Textil__1_-removebg-preview.png": {"color": "#2f2f2f", "color_name": "Preto"},
    "lancheira.png": {"color": "#f5c6b8", "color_name": "Rosa"},
    "Imagens_Vitrine_Textil__2_-removebg-preview.png": {"color": "#2f2f2f", "color_name": "Preto"},
    "Imagens_Vitrine_Textil__3_-removebg-preview.png": {"color": "#2f2f2f", "color_name": "Preto"},
    "Imagens_Vitrine_Textil__4_-removebg-preview.png": {"color": "#556b2f", "color_name": "Verde Oliva"},
    "Imagens_Vitrine_Textil__5_-removebg-preview.png": {"color": "#2f2f2f", "color_name": "Preto"},
    "mala-trip-preta.png": {"color": "#2f2f2f", "color_name": "Preto"},
    "mala-trip-rosa.png": {"color": "#f5c6b8", "color_name": "Rosa"},
    "mala-trip-off.png": {"color": "#f5f5dc", "color_name": "Off-White"},
}

def extract_slider_images(section):
    """Extract unique images from a slider section by pairing slide-index with image URL."""
    images = {}
    # Find each swiper-slide with its data-swiper-slide-index and the image URL inside
    # Skip duplicates (swiper-slide-duplicate)
    slide_blocks = re.finditer(
        r'<div\s+class="swiper-slide(?:\s+[^"]*)?"\s+data-swiper-slide-index="(\d+)"[^>]*>'
        r'[\s\S]*?'
        r'background-image:\s*url\(&#39;(https://[^&]+)&#39;\)',
        section
    )
    for m in slide_blocks:
        slide_idx = int(m.group(1))
        img_url = m.group(2)
        if slide_idx not in images:
            images[slide_idx] = img_url
    return images

def get_slider_section(html, slider_html_id):
    """Get the full slider section by id."""
    idx = html.find(f'id="{slider_html_id}"')
    if idx == -1:
        return None
    # Go back to find the container start
    start = max(0, idx - 200)
    # Find the next text-editor widget (product name comes after slider)
    end_marker = html.find('elementor-widget-text-editor', idx)
    if end_marker == -1:
        end_marker = idx + 10000
    return html[start:end_marker]

def get_textile_section(html, product_name):
    """Get slider section for textile products (no slider ID)."""
    name_idx = html.find(f'<p>{product_name}</p>')
    if name_idx == -1:
        return None
    # Look backwards for the swiper wrapper
    search_start = max(0, name_idx - 5000)
    section = html[search_start:name_idx]
    # Find the last 'elementor-main-swiper' start
    last_swiper = section.rfind('elementor-main-swiper')
    if last_swiper == -1:
        return None
    return section[last_swiper:]

# --- 3. Build products ---
products = []

# Product 1: Garrafa Térmica Fresh
section = get_slider_section(html, "garrafa-termica-fresh-slider")
images = extract_slider_images(section) if section else {}
colors = bullet_colors.get("garrafa-termica-fresh", {})
variants = []
for i in sorted(images.keys()):
    color_hex = colors.get(i + 1)
    variants.append({
        "image_url": images[i],
        "color": color_hex,
        "color_name": COLOR_NAMES.get(color_hex)
    })
products.append({
    "name": "Garrafa Térmica Fresh",
    "category": "termica",
    "size": "650ml e 950ml",
    "variants": variants
})

# Product 2: Garrafa Térmica Urban
section = get_slider_section(html, "garrafa-termica-urban-slider")
images = extract_slider_images(section) if section else {}
colors = bullet_colors.get("garrafa-termica-urban", {})
variants = []
for i in sorted(images.keys()):
    color_hex = colors.get(i + 1)
    variants.append({
        "image_url": images[i],
        "color": color_hex,
        "color_name": COLOR_NAMES.get(color_hex)
    })
products.append({
    "name": "Garrafa Térmica Urban",
    "category": "termica",
    "size": "500ml",
    "variants": variants
})

# Product 3: Garrafa Térmica Mini
section = get_slider_section(html, "garrafa-termica-mini-slider")
images = extract_slider_images(section) if section else {}
colors = bullet_colors.get("garrafa-termica-mini", {})
variants = []
for i in sorted(images.keys()):
    color_hex = colors.get(i + 1)
    variants.append({
        "image_url": images[i],
        "color": color_hex,
        "color_name": COLOR_NAMES.get(color_hex)
    })
products.append({
    "name": "Garrafa Térmica Mini",
    "category": "termica",
    "size": "350ml",
    "variants": variants
})

# Product 4: Copo Térmico Vibe
section = get_slider_section(html, "copo-termico-mini-slider")
images = extract_slider_images(section) if section else {}
colors = bullet_colors.get("copo-termico-mini", {})
variants = []
for i in sorted(images.keys()):
    color_hex = colors.get(i + 1)
    variants.append({
        "image_url": images[i],
        "color": color_hex,
        "color_name": COLOR_NAMES.get(color_hex)
    })
products.append({
    "name": "Copo Térmico Vibe",
    "category": "termica",
    "size": "470ml",
    "variants": variants
})

# Textile products
textile_products = [
    ("Necessaire Makeup Double", "*Consulte disponibilidade"),
    ("Lancheira Térmica MIDI", "Novos modelos!"),
    ("Bolsa de Viagem Joy", "Novos modelos!"),
    ("Mala de Viagem Trip", "*Consulte disponibilidade"),
]

for name, note in textile_products:
    section = get_textile_section(html, name)
    images = extract_slider_images(section) if section else {}
    variants = []
    for i in sorted(images.keys()):
        img_url = images[i]
        filename = img_url.split("/")[-1]
        color_info = TEXTILE_COLOR_MAP.get(filename, {"color": None, "color_name": None})
        variants.append({
            "image_url": img_url,
            "color": color_info["color"],
            "color_name": color_info["color_name"]
        })
    products.append({
        "name": name,
        "category": "textil",
        "note": note,
        "variants": variants
    })

# --- 4. Save ---
output = {"products": products}
with open("products.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

# Print summary
for p in products:
    print(f"{p['name']}: {len(p['variants'])} variantes")
    for v in p['variants']:
        print(f"  {v['color_name']} ({v['color']}) -> {v['image_url'].split('/')[-1]}")

print(f"\nSalvo em products.json com {len(products)} produtos")
