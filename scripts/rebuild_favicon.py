"""Rebuild all favicon assets from the source portrait.

Current scheme (2026-10):
- Full original square image everywhere (no face-focused cropping, per owner).
- Tab icons (favicon.ico / favicon-96x96.png / favicon.svg): circular alpha mask.
- apple-touch-icon.png / web-app-manifest-192x192.png: full square PNG
  (systems apply their own circular masks).
- web-app-manifest-512x512.webp: WebP to keep the PWA icon small.

Usage: python scripts/rebuild_favicon.py [source_image]
"""
import base64
import io
import os
import sys

from PIL import Image, ImageDraw

FAV_DIR = os.path.join("public", "favicon")
DEFAULT_SRC = os.path.expanduser(
    "~/Pictures/银发少女的静谧肖像.png"
)


def circle(img: Image.Image, size: int) -> Image.Image:
    """Resize with a 4x-supersampled antialiased circular alpha mask."""
    ss = size * 4
    im = img.resize((ss, ss), Image.LANCZOS).convert("RGBA")
    mask = Image.new("L", (ss, ss), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, ss - 1, ss - 1), fill=255)
    im.putalpha(mask)
    return im.resize((size, size), Image.LANCZOS)


def report(name: str, path: str) -> None:
    kb = os.path.getsize(path) / 1024
    print(f"{name}: {kb:.1f} KB")


def main() -> None:
    src_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    src = Image.open(src_path).convert("RGB")
    if src.size[0] != src.size[1]:
        raise SystemExit(f"source must be square, got {src.size}")

    # Tab icons: full image + circular mask
    circle(src, 96).save(
        os.path.join(FAV_DIR, "favicon-96x96.png"), optimize=True
    )
    report("favicon-96x96.png", os.path.join(FAV_DIR, "favicon-96x96.png"))

    circle(src, 96).save(
        os.path.join(FAV_DIR, "favicon.ico"), format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    report("favicon.ico", os.path.join(FAV_DIR, "favicon.ico"))

    buf = io.BytesIO()
    circle(src, 256).save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'xmlns:xlink="http://www.w3.org/1999/xlink" '
        'viewBox="0 0 256 256" width="256" height="256">'
        f'<image width="256" height="256" xlink:href="data:image/png;base64,{b64}"/>'
        "</svg>"
    )
    with open(os.path.join(FAV_DIR, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"favicon.svg: {len(svg) / 1024:.1f} KB")

    # Square icons (system applies circular masks)
    for name, size in [
        ("apple-touch-icon.png", 180),
        ("web-app-manifest-192x192.png", 192),
    ]:
        src.resize((size, size), Image.LANCZOS).save(
            os.path.join(FAV_DIR, name), optimize=True
        )
        report(name, os.path.join(FAV_DIR, name))

    # PWA 512: WebP
    src.resize((512, 512), Image.LANCZOS).save(
        os.path.join(FAV_DIR, "web-app-manifest-512x512.webp"),
        "WEBP", quality=85, method=6,
    )
    report("web-app-manifest-512x512.webp",
           os.path.join(FAV_DIR, "web-app-manifest-512x512.webp"))


if __name__ == "__main__":
    main()
