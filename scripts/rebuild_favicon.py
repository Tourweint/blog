"""Rebuild favicon.svg and PNG icons from the oversized embedded source image."""
import base64
import io
import os
import re

from PIL import Image

FAV_DIR = os.path.join("public", "favicon")
SVG_PATH = os.path.join(FAV_DIR, "favicon.svg")

with open(SVG_PATH, "r", encoding="utf-8") as f:
    svg_text = f.read()

match = re.search(r'base64,([A-Za-z0-9+/=\s]+)"', svg_text)
if not match:
    raise SystemExit("no embedded base64 PNG found")
src = Image.open(io.BytesIO(base64.b64decode(match.group(1))))
print("source:", src.size, src.mode)
if src.mode != "RGBA":
    src = src.convert("RGBA")


def save_png(size: int, name: str) -> None:
    im = src.resize((size, size), Image.LANCZOS)
    im.save(os.path.join(FAV_DIR, name), "PNG", optimize=True)
    kb = os.path.getsize(os.path.join(FAV_DIR, name)) / 1024
    print(f"{name}: {size}x{size}, {kb:.1f} KB")


save_png(96, "favicon-96x96.png")
save_png(180, "apple-touch-icon.png")
save_png(192, "web-app-manifest-192x192.png")
save_png(512, "web-app-manifest-512x512.png")

# favicon.svg: keep the same URL/filename, but embed a small optimized PNG
im256 = src.resize((256, 256), Image.LANCZOS)
buf = io.BytesIO()
im256.save(buf, "PNG", optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode("ascii")
clean_svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
    'viewBox="0 0 256 256" width="256" height="256">'
    f'<image width="256" height="256" xlink:href="data:image/png;base64,{b64}"/>'
    "</svg>"
)
with open(SVG_PATH, "w", encoding="utf-8") as f:
    f.write(clean_svg)
print(f"favicon.svg: {len(clean_svg)/1024:.1f} KB")
