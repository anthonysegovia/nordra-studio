"""Export the existing star.svg mark for browser tabs and iPhone bookmarks."""
from pathlib import Path
from shutil import copyfile

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / 'public/demos/posada-luz'
ASSETS = ROOT / 'assets'
PINE, GOLD = '#102a27', '#e2c593'
# Absolute coordinates of the existing star.svg path, on its 64 x 64 grid.
POINTS = [(32, 7), (38, 24), (55, 16), (44, 33), (55, 46), (37, 43),
          (32, 59), (27, 43), (9, 46), (20, 33), (9, 16), (26, 24)]


def icon(size, rounded=True):
    scale = 16
    image = Image.new('RGBA', (64 * scale, 64 * scale), (0, 0, 0, 0) if rounded else PINE)
    draw = ImageDraw.Draw(image)
    if rounded:
        draw.rounded_rectangle((0, 0, 64 * scale - 1, 64 * scale - 1),
                               radius=16 * scale, fill=PINE)
    draw.polygon([(x * scale, y * scale) for x, y in POINTS], fill=GOLD)
    return image.resize((size, size), Image.Resampling.LANCZOS)


copyfile(ASSETS / 'star.svg', ASSETS / 'favicon-posada-v2.svg')
icon(32).save(ASSETS / 'favicon-posada-v2-32.png', optimize=True)
icon(48).save(ASSETS / 'favicon-posada-v2.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
icon(180, rounded=False).convert('RGB').save(ASSETS / 'apple-touch-icon-posada-v2.png', optimize=True)
# Conventional paths also cover browsers that discover icons without reading <link>.
copyfile(ASSETS / 'favicon-posada-v2.ico', ROOT / 'favicon.ico')
copyfile(ASSETS / 'apple-touch-icon-posada-v2.png', ROOT / 'apple-touch-icon.png')
print('Posada icons exported: SVG, PNG 32, ICO 16/32/48 and Apple PNG 180')
