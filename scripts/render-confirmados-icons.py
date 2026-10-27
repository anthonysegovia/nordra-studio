"""Extend the invitation's existing star mark with a confirmation check."""
from pathlib import Path
from PIL import Image, ImageDraw

ASSETS = Path(__file__).resolve().parents[1] / 'public/invitaciones/posada-confirmados/assets'
ASSETS.mkdir(parents=True, exist_ok=True)
points = [(32,7),(38,24),(55,16),(44,33),(55,46),(37,43),(32,59),(27,43),(9,46),(20,33),(9,16),(26,24)]
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#102a27"/><path d="M32 7 38 24 55 16 44 33 55 46 37 43 32 59 27 43 9 46 20 33 9 16 26 24Z" fill="#e2c593"/><circle cx="32" cy="33" r="13" fill="#702f3e"/><path d="m25 33 5 5 10-11" fill="none" stroke="#f3edde" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
(ASSETS / 'confirmados-icon-v1.svg').write_text(svg, encoding='utf-8')
def icon(size, rounded=True):
    s=16
    art=Image.new('RGBA',(64*s,64*s),(0,0,0,0) if rounded else '#102a27')
    d=ImageDraw.Draw(art)
    if rounded: d.rounded_rectangle((0,0,64*s-1,64*s-1),radius=15*s,fill='#102a27')
    d.polygon([(x*s,y*s) for x,y in points],fill='#e2c593')
    d.ellipse((19*s,20*s,45*s,46*s),fill='#702f3e')
    d.line([(25*s,33*s),(30*s,38*s),(40*s,27*s)],fill='#f3edde',width=round(3.6*s),joint='curve')
    return art.resize((size,size),Image.Resampling.LANCZOS)
icon(32).save(ASSETS/'confirmados-icon-v1-32.png',optimize=True)
icon(48).save(ASSETS/'confirmados-icon-v1.ico',format='ICO',sizes=[(16,16),(32,32),(48,48)])
icon(180,False).convert('RGB').save(ASSETS/'confirmados-apple-v1.png',optimize=True)
print('Confirmation icons generated: SVG, PNG, ICO and Apple')
