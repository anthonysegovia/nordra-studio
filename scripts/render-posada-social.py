"""Render a 1200 x 630 sharing card using the invitation's existing design assets."""
from pathlib import Path
import argparse
import math
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--demo', action='store_true', help='Render the public seasonal example')
DEMO = parser.parse_args().demo
SOURCE_ASSETS = ROOT / 'public/demos/posada-luz/assets'
ASSETS = ROOT / 'public/demos/posada-pinata/assets' if DEMO else SOURCE_ASSETS
FONTS = SOURCE_ASSETS / 'fonts'
W, H = 1200, 630
IVORY, GOLD, WINE = '#f3edde', '#e2c593', '#702f3e'


def font(family, size, italic=False, weight=400):
    name = ('cormorantgaramond-CormorantGaramond' + ('-Italic' if italic else '') + '[wght].ttf') if family == 'serif' else 'manrope-Manrope[wght].ttf'
    face = ImageFont.truetype(str(FONTS / name), size)
    face.set_variation_by_axes([weight])
    return face


art = Image.new('RGB', (W, H))
pixels = art.load()
for y in range(H):
    for x in range(W):
        glow = max(0, 1 - math.hypot((x - 910) / 740, (y - 320) / 550))
        pixels[x, y] = (int(13 + 15 * glow), int(37 + 18 * glow), int(33 + 9 * glow))
art = art.convert('RGBA')


def picture(name, x, y, width):
    source = Image.open(ASSETS / name).convert('RGBA')
    source = source.resize((width, round(source.height * width / source.width)), Image.Resampling.LANCZOS)
    art.alpha_composite(source, (x, y))


def text(value, x, y, face, fill=IVORY, tracking=0):
    draw = ImageDraw.Draw(art)
    baseline = y - draw.textbbox((0, 0), value, font=face, anchor='ls')[1]
    if not tracking:
        draw.text((x, baseline), value, font=face, fill=fill, anchor='ls')
        return
    for char in value:
        draw.text((x, baseline), char, font=face, fill=fill, anchor='ls')
        x += draw.textlength(char, font=face) + tracking


draw = ImageDraw.Draw(art)
draw.rounded_rectangle((28, 28, 1172, 602), radius=16, outline='#746e47', width=1)
draw.rounded_rectangle((36, 36, 1164, 594), radius=10, outline='#384b37', width=1)
draw.ellipse((690, 60, 1160, 581), outline='#4f583b', width=1)
draw.ellipse((703, 73, 1147, 568), outline='#394e38', width=1)
picture('guirnalda-navidad-1600.webp', -50, -240, 1300)
text('POSADA  ·  2026', 93, 137, font('sans', 17, weight=500), GOLD, 3)
text('Se viene', 85, 183, font('serif', 96))
text('la posada', 85, 270, font('serif', 114, italic=True), GOLD)
picture('pinata-1120.webp', 731, 104, 392)

draw = ImageDraw.Draw(art)
draw.rounded_rectangle((90, 410, 671, 550), radius=4, fill='#071d1b')
draw.rounded_rectangle((84, 404, 665, 544), radius=4, fill='#fff9ec')
draw.rectangle((94, 414, 655, 534), outline='#d9c7a4', width=1)
draw.polygon([(616, 404), (641, 404), (665, 428), (665, 453)], fill=WINE)
text('19 diciembre', 110, 421, font('serif', 47), WINE)
text('SÁBADO · 2026  /  6:00 p. m.', 112, 475, font('sans', 17, weight=500), '#75654d')
text('Jardín Aurora  ·  Cena, piñata e intercambio' if DEMO else 'La Covadonga  ·  Juegos  ·  BYOB', 112, 507, font('sans', 18, weight=500), '#102a27')
text('NORDRA  STUDIO  ·  DEMO' if DEMO else 'NORDRA  STUDIO', 94, 570, font('sans', 14, weight=500), GOLD, 3)

draw = ImageDraw.Draw(art)
for x, y, radius in [(695, 232, 7), (1143, 318, 8), (696, 492, 5), (1100, 570, 5)]:
    for angle in [0, math.pi / 3, 2 * math.pi / 3]:
        dx, dy = math.cos(angle) * radius, math.sin(angle) * radius
        draw.line((x-dx, y-dy, x+dx, y+dy), fill='#9e9c79', width=1)

destination = ASSETS / ('posada-demo-social-v1.jpg' if DEMO else 'se-viene-la-posada-social-v1.jpg')
art.convert('RGB').save(destination, quality=90, subsampling=0, optimize=True)
print(f'{destination}: {W} x {H}, {destination.stat().st_size} bytes')
