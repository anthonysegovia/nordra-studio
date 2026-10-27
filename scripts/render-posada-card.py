"""Build the compact invitation from the digital invitation's artwork and fonts.

Run with Python + Pillow. The checked-in JPEG is served directly to guests;
no browser rendering, external fonts, or network calls are needed to download it.
"""
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
VENUE = 'Jardín Aurora' if DEMO else 'La Covadonga'
PLAN = 'CENA  ·  PIÑATA  ·  INTERCAMBIO' if DEMO else 'HABRÁ JUEGOS  ·  BYOB'
W, H = 1080, 1620
IVORY, GOLD, WINE = '#f3edde', '#e2c593', '#702f3e'


def font(family, size, italic=False, weight=400):
    filename = ('cormorantgaramond-CormorantGaramond' + ('-Italic' if italic else '') + '[wght].ttf') if family == 'serif' else 'manrope-Manrope[wght].ttf'
    result = ImageFont.truetype(str(FONTS / filename), size)
    result.set_variation_by_axes([weight])
    return result


# The same pine background, with a quiet warm glow behind the paper piñata.
art = Image.new('RGB', (W, H))
pixels = art.load()
for y in range(H):
    for x in range(W):
        glow = max(0, 1 - math.hypot((x - W / 2) / 650, (y - 730) / 920))
        pixels[x, y] = (int(13 + 15 * glow), int(37 + 18 * glow), int(33 + 9 * glow))
art = art.convert('RGBA')
draw = ImageDraw.Draw(art)
draw.rounded_rectangle((52, 128, 1028, 1508), radius=450, outline='#7c795049', width=2)
draw.rounded_rectangle((67, 143, 1013, 1493), radius=435, outline='#606343', width=1)


def picture(name, x, y, width):
    source = Image.open(ASSETS / name).convert('RGBA')
    source = source.resize((width, round(source.height * width / source.width)), Image.Resampling.LANCZOS)
    art.alpha_composite(source, (x, y))


def centered(text, y, face, fill=IVORY, tracking=0):
    drawing = ImageDraw.Draw(art)
    baseline = y - drawing.textbbox((0, 0), text, font=face, anchor='ls')[1]
    if tracking == 0:
        drawing.text((W / 2, baseline), text, font=face, fill=fill, anchor='ms')
        return
    width = sum(drawing.textlength(c, font=face) for c in text) + tracking * (len(text) - 1)
    x = (W - width) / 2
    for char in text:
        drawing.text((x, baseline), char, font=face, fill=fill, anchor='ls')
        x += drawing.textlength(char, font=face) + tracking


picture('guirnalda-navidad-1600.webp', -160, -205, 1400)
centered(f'{VENUE.upper()}  ·  2026', 253, font('sans', 22, weight=500), GOLD, 4)
centered('Se viene', 310, font('serif', 116))
centered('la posada', 413, font('serif', 132, italic=True), GOLD)
picture('pinata-1120.webp', 307, 540, 466)

# A few quiet snow crystals echo the falling snow of the digital invitation.
draw = ImageDraw.Draw(art)
for x, y, radius in [(166, 570, 9), (899, 628, 12), (215, 858, 7), (895, 967, 8), (145, 1040, 5)]:
    for angle in [0, math.pi / 3, 2 * math.pi / 3]:
        dx, dy = math.cos(angle) * radius, math.sin(angle) * radius
        draw.line((x-dx, y-dy, x+dx, y+dy), fill='#9e9c79', width=1)

# Compact stationery card: date, year, time and venue stay legible on a phone.
draw.rounded_rectangle((101, 1138, 987, 1533), radius=5, fill='#071d1b')
draw.rounded_rectangle((93, 1129, 979, 1524), radius=5, fill='#fff9ec')
draw.rectangle((109, 1145, 963, 1508), outline='#d9c7a4', width=1)
draw.text((153, 1169), '19', font=font('serif', 165), fill=WINE, anchor='lt')
draw.text((386, 1189), 'diciembre', font=font('serif', 74, italic=True), fill='#102a27', anchor='lt')
draw.text((392, 1280), 'SÁBADO · 2026', font=font('sans', 24, weight=500), fill='#75654d', anchor='lt')
draw.line((145, 1342, 927, 1342), fill='#d9c7a4', width=1)
centered('A partir de las 6:00 p. m.', 1370, font('sans', 29), '#102a27')
centered(VENUE, 1412, font('sans', 34, weight=500), WINE)
centered(PLAN, 1464, font('sans', 26, weight=500), '#6d5745', 1.8)
picture('guirnalda-navidad-800.webp', 65, 1057, 355)
draw = ImageDraw.Draw(art)
draw.polygon([(900, 1129), (941, 1129), (979, 1167), (979, 1208)], fill=WINE)
centered('NORDRA  STUDIO  ·  DEMO' if DEMO else 'NORDRA  STUDIO', 1560, font('sans', 21, weight=500), GOLD, 4)
destination = ASSETS / ('invitacion-posada-demo.jpg' if DEMO else 'invitacion-posada-covadonga.jpg')
art.convert('RGB').save(destination, quality=94, subsampling=0, optimize=True)
print(f'{destination}: {W} × {H}, {destination.stat().st_size} bytes')
