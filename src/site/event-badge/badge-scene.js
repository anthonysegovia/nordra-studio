// Visual and physics constants from the approved 2026-11-10 prototype.
import * as THREE from 'three';
import { preparePMREM, prepareBadgePrograms, yieldSetup } from './prepare-programs.js';
export async function createBadgeScene(stage, options = {}) {
    const hero = stage.closest('.badge-hero'), title = hero.querySelector('h1');
    const events = new AbortController(), envTargets = [];
    let disposed = false, prepared = false, frameId = 0, currentDark = Boolean(options.dark);
    const listen = (target, type, fn) => target.addEventListener(type, fn, { signal: events.signal });
    function releaseTree(tree) { tree.traverse(object => { object.geometry?.dispose(); for (const material of (Array.isArray(object.material) ? object.material : [object.material]))
        material?.dispose(); }); }
    await Promise.all(['600 40px Sora', '700 20px Manrope', '600 20px Manrope', '500 24px Manrope'].map(font => document.fonts.load(font)));
    await document.fonts.ready;
    const english = document.documentElement.lang === 'en';
    const reduce = false;
    const wideQ = matchMedia('(min-width:901px)');
    const LITE = matchMedia('(max-width:700px)').matches;
    const clamp = t => Math.min(1, Math.max(0, t));
    const TAU = Math.PI * 2;
    // ---------- Events printed on the badge (all fictitious) ----------
    const EVENTS = [
        { lan: '#1b5a6e', type: 'Congreso', name: 'Conexión 27', date: 'SÁB 12 · 06 · 2027', hour: '10:00', place: ['Espacio Nodo', 'Monterrey'], guest: 'Lucía Herrera', role: 'ASISTENTE', code: 'A-0127', accent: '#126781', ink: '#123044', paper: '#eef6f9', mark: 'rings' },
        { lan: '#3a2723', type: 'Lanzamiento', name: 'Nova Uno', date: 'JUE 09 · 09 · 2027', hour: '19:30', place: ['Galería Fundidora', 'Monterrey'], guest: 'Tomás Aguilar', role: 'PRENSA', code: 'P-0412', accent: '#d9583a', ink: '#2b1813', paper: '#fbf2ed', mark: 'star' },
        { lan: '#1f2d48', type: 'Graduación', name: 'Generación 2027', date: 'VIE 02 · 07 · 2027', hour: '18:00', place: ['Auditorio Central', 'San Pedro'], guest: 'Daniela Ruiz', role: 'GRADUADA', code: 'G-0233', accent: '#a9822a', ink: '#1d283a', paper: '#f8f4ea', mark: 'cap' },
        { lan: '#2c3a8f', type: 'Gala con causa', name: 'Noche Azul', date: 'SÁB 20 · 11 · 2027', hour: '20:00', place: ['Casino del Valle', 'Monterrey'], guest: 'Rodrigo Saldaña', role: 'MESA 4', code: 'M-0004', accent: '#3d4fb5', ink: '#151a3a', paper: '#eff1fa', mark: 'moon' },
        { lan: '#22603f', type: 'Reencuentro', name: 'Prepa 07 · 20 años', date: 'SÁB 15 · 05 · 2027', hour: '17:00', place: ['Terraza Alameda', 'Monterrey'], guest: 'Paola Cantú', role: 'GENERACIÓN 2007', code: 'R-0720', accent: '#2c8a57', ink: '#15301f', paper: '#eff7f1', mark: 'circles' }
    ];
    if (english) {
        const types = ['Conference', 'Launch', 'Graduation', 'Charity gala', 'Reunion'];
        const names = ['Conexión 27', 'Nova Uno', 'Class of 2027', 'Noche Azul', 'Class of ’07 · 20 years'];
        const dates = ['JUN 12 · 2027', 'SEP 09 · 2027', 'JUL 02 · 2027', 'NOV 20 · 2027', 'MAY 15 · 2027'];
        const roles = ['ATTENDEE', 'PRESS', 'GRADUATE', 'TABLE 4', 'CLASS OF 2007'];
        EVENTS.forEach((event, index) => Object.assign(event, { type: types[index], name: names[index], date: dates[index], role: roles[index] }));
    }
    // ---------- Renderer ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, LITE ? 1.5 : 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0, 0);
    stage.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, .1, 60);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const pmremPrepared = await preparePMREM(renderer, pmrem);
    const MAX_ANISO = renderer.capabilities.getMaxAnisotropy();
    async function studio(dark) {
        const env = new THREE.Scene();
        env.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: dark ? '#0d1c24' : '#bfb4a4' })));
        const box = (w, h, x, y, z, c, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
        box(7, 1.4, -1, 6, 3, '#fff6ea', dark ? 1.8 : 3.2);
        box(1.2, 7, -6, 1, 2, dark ? '#7fdcef' : '#fff1dc', dark ? 2.4 : 2.4);
        box(1.2, 7, 6, 0, 1, dark ? '#b9a4ff' : '#f4f8ff', dark ? 2.2 : 2.2);
        box(5, 1, 0, -1, -7, '#ffe9cc', 1.4);
        box(2.5, 2.5, 2, -2, 6, dark ? '#5ff0b0' : '#ffffff', dark ? 1 : 1.6);
        await yieldSetup();
        if (pmremPrepared) {
            renderer.setRenderTarget(pmrem._pingPongRenderTarget);
            await renderer.compileAsync(env, new THREE.PerspectiveCamera(90, 1, .1, 100));
            renderer.setRenderTarget(null);
            await yieldSetup();
        }
        const target = pmrem.fromScene(env, .03);
        envTargets.push(target);
        releaseTree(env);
        return target.texture;
    }
    const envLight = await studio(false), envDark = await studio(true);
    scene.environment = envLight;
    const key = new THREE.DirectionalLight('#fff3e2', 1.5);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#dff4ff', .6);
    rim.position.set(4, 1, -3);
    scene.add(rim);
    const amb = new THREE.HemisphereLight('#fff8ee', '#b8ab98', .55);
    scene.add(amb);
    // ---------- Canvas helpers ----------
    function canvasTex(w, h, draw, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); if (srgb)
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = MAX_ANISO; return t; }
    function rr(x, X, Y, W, H, R) { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); }
    function fit(x, text, font, size, max) { let s = size; do {
        x.font = font.replace('#', s);
        s -= 2;
    } while (x.measureText(text).width > max && s > 12); }
    function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    // Woven lanyard with the studio name printed along it
    const strapTex = canvasTex(128, 1024, (x, w, h) => {
        x.fillStyle = '#c4c4c4';
        x.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 4)
            for (let i = 0; i < w; i += 4) {
                const k = ((i + y) / 4) % 2;
                x.fillStyle = k ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)';
                x.fillRect(i, y, 4, 2);
            }
        x.fillStyle = 'rgba(0,0,0,.28)';
        x.fillRect(0, 0, 7, h);
        x.fillRect(w - 7, 0, 7, h);
        x.fillStyle = 'rgba(255,255,255,.07)';
        x.fillRect(8, 0, 3, h);
        x.fillRect(w - 11, 0, 3, h);
    });
    strapTex.wrapT = THREE.RepeatWrapping;
    const tabTex = canvasTex(128, 256, (x, w, h) => {
        x.fillStyle = '#f2f2f2';
        x.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 4)
            for (let i = 0; i < w; i += 4) {
                x.fillStyle = ((i + y) / 4) % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)';
                x.fillRect(i, y, 4, 2);
            }
        x.strokeStyle = 'rgba(0,0,0,.55)';
        x.lineWidth = 5;
        x.setLineDash([9, 6]);
        x.strokeRect(18, 40, w - 36, h - 90);
        x.beginPath();
        x.moveTo(18, 40);
        x.lineTo(w - 18, h - 50);
        x.moveTo(w - 18, 40);
        x.lineTo(18, h - 50);
        x.stroke();
    });
    // Pseudo QR (decorative, no link)
    function drawQR(x, X, Y, S, seed, ink) {
        const n = 25, m = S / n, r = rng(seed);
        x.fillStyle = ink;
        const finder = (cx, cy) => { x.fillRect(X + cx * m, Y + cy * m, 7 * m, 7 * m); x.fillStyle = '#fff'; x.fillRect(X + (cx + 1) * m, Y + (cy + 1) * m, 5 * m, 5 * m); x.fillStyle = ink; x.fillRect(X + (cx + 2) * m, Y + (cy + 2) * m, 3 * m, 3 * m); };
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) {
                const inF = (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9);
                if (!inF && r() > .52)
                    x.fillRect(X + i * m, Y + j * m, m + .5, m + .5);
            }
        finder(0, 0);
        finder(n - 7, 0);
        finder(0, n - 7);
        x.fillRect(X + (n - 9) * m, Y + (n - 9) * m, 5 * m, 5 * m);
        x.fillStyle = '#fff';
        x.fillRect(X + (n - 8) * m, Y + (n - 8) * m, 3 * m, 3 * m);
        x.fillStyle = ink;
        x.fillRect(X + (n - 7) * m, Y + (n - 7) * m, m, m);
    }
    function drawMark(x, kind, X, Y, S, e) {
        x.save();
        x.translate(X + S / 2, Y + S / 2);
        x.lineCap = 'round';
        if (kind === 'rings') {
            const cols = [['#38a8e0', '#9fe0ff'], ['#8a5cf0', '#d3c0ff'], ['#2f86d8', '#bfe6ff']];
            const pos = [[-.17, -.12], [.17, -.1], [0, .16]];
            pos.forEach(([a, b], i) => { const g = x.createLinearGradient(-S / 2, -S / 2, S / 2, S / 2); g.addColorStop(0, cols[i][0]); g.addColorStop(.5, cols[i][1]); g.addColorStop(1, cols[i][0]); x.strokeStyle = g; x.lineWidth = S * .085; x.beginPath(); x.arc(a * S, b * S, S * .24, 0, TAU); x.stroke(); });
        }
        if (kind === 'star') {
            const g = x.createLinearGradient(-S / 2, -S / 2, S / 2, S / 2);
            g.addColorStop(0, '#ff9a6b');
            g.addColorStop(1, e.accent);
            x.fillStyle = g;
            x.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = i * Math.PI / 4 - Math.PI / 2, rad = i % 2 ? S * .12 : S * .46;
                x.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
            }
            x.closePath();
            x.fill();
            x.fillStyle = 'rgba(255,255,255,.7)';
            x.beginPath();
            x.arc(S * .26, -S * .28, S * .05, 0, TAU);
            x.fill();
        }
        if (kind === 'cap') {
            x.fillStyle = e.ink;
            x.beginPath();
            x.moveTo(0, -S * .3);
            x.lineTo(S * .46, -S * .1);
            x.lineTo(0, S * .1);
            x.lineTo(-S * .46, -S * .1);
            x.closePath();
            x.fill();
            x.beginPath();
            x.moveTo(-S * .26, 0);
            x.lineTo(-S * .26, S * .2);
            x.quadraticCurveTo(0, S * .36, S * .26, S * .2);
            x.lineTo(S * .26, 0);
            x.lineTo(0, S * .1);
            x.closePath();
            x.fill();
            x.strokeStyle = e.accent;
            x.lineWidth = S * .035;
            x.beginPath();
            x.moveTo(0, -S * .1);
            x.lineTo(S * .36, -S * .02);
            x.lineTo(S * .36, S * .26);
            x.stroke();
            x.fillStyle = e.accent;
            x.beginPath();
            x.arc(S * .36, S * .3, S * .05, 0, TAU);
            x.fill();
        }
        if (kind === 'moon') {
            const g = x.createLinearGradient(-S / 2, -S / 2, S / 2, S / 2);
            g.addColorStop(0, '#7f90ff');
            g.addColorStop(1, e.accent);
            x.fillStyle = g;
            x.beginPath();
            x.arc(0, 0, S * .4, 0, TAU);
            x.fill();
            x.globalCompositeOperation = 'destination-out';
            x.beginPath();
            x.arc(S * .18, -S * .12, S * .34, 0, TAU);
            x.fill();
            x.globalCompositeOperation = 'source-over';
            x.fillStyle = e.accent;
            [[.3, .18, .04], [.38, -.32, .03], [.12, .36, .025]].forEach(([a, b, c]) => { x.beginPath(); x.arc(a * S, b * S, c * S, 0, TAU); x.fill(); });
        }
        if (kind === 'circles') {
            x.globalAlpha = .85;
            x.fillStyle = e.accent;
            x.beginPath();
            x.arc(-S * .14, 0, S * .3, 0, TAU);
            x.fill();
            x.fillStyle = '#e7b23e';
            x.globalCompositeOperation = 'multiply';
            x.beginPath();
            x.arc(S * .14, 0, S * .3, 0, TAU);
            x.fill();
            x.globalCompositeOperation = 'source-over';
            x.globalAlpha = 1;
            x.fillStyle = '#fff';
            x.font = `700 ${S * .26}px Sora`;
            x.textAlign = 'center';
            x.textBaseline = 'middle';
            x.fillText('20', 0, S * .02);
        }
        x.restore();
    }
    // Insert card: 768 × 1036 px ↔ 1.2 × 1.62 units
    const CW = 768, CH = 1036, IW = 1.2, IH = 1.62;
    const QR = { x: 56, y: 500, s: 280 };
    function drawCard(x, w, h, e, i, ok) {
        const g = x.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(1, e.paper);
        x.fillStyle = g;
        x.fillRect(0, 0, w, h);
        {
            const r = rng(900 + i);
            for (let k = 0; k < 2600; k++) {
                x.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},${.025 + r() * .035})`;
                x.fillRect(r() * w, r() * h, 1 + r() * 3, 1);
            }
        }
        drawMark(x, e.mark, 44, 40, 150, e);
        x.fillStyle = e.accent;
        x.font = '700 26px Manrope';
        x.letterSpacing = '5px';
        x.fillText(e.type.toUpperCase(), 214, 96);
        x.letterSpacing = '0px';
        x.fillStyle = e.ink;
        fit(x, e.name, '600 #px Sora', 62, 500);
        x.fillText(e.name, 212, 160);
        x.fillStyle = e.accent;
        x.fillRect(56, 222, 656, 12);
        x.fillStyle = e.ink;
        fit(x, e.guest, '600 #px Sora', 80, 656);
        x.fillText(e.guest, 56, 336);
        x.font = '700 28px Manrope';
        x.letterSpacing = '4px';
        const pw = x.measureText(e.role).width + 52;
        rr(x, 56, 370, pw, 60, 30);
        x.fillStyle = e.accent;
        x.fill();
        x.fillStyle = '#fff';
        x.fillText(e.role, 82, 410);
        x.letterSpacing = '0px';
        rr(x, QR.x - 10, QR.y - 10, QR.s + 20, QR.s + 20, 18);
        x.fillStyle = '#fff';
        x.fill();
        x.strokeStyle = 'rgba(0,0,0,.08)';
        x.lineWidth = 2;
        x.stroke();
        drawQR(x, QR.x, QR.y, QR.s, 101 + i * 17, e.ink);
        const col = (label, val, y) => { x.fillStyle = e.accent; x.font = '700 21px Manrope'; x.letterSpacing = '4px'; x.fillText(label, 384, y); x.letterSpacing = '0px'; x.fillStyle = e.ink; fit(x, val, '600 #px Manrope', 36, 330); x.fillText(val, 384, y + 44); };
        col(english ? 'DATE' : 'FECHA', english ? e.date : e.date.replace(/^\S+ /, ''), 528);
        col(english ? 'TIME' : 'HORA', e.hour + ' h', 634);
        col(english ? 'VENUE' : 'SEDE', e.place[0], 740);
        if (!ok) {
            x.fillStyle = e.ink;
            x.font = '600 34px Sora';
            x.fillText((english ? 'ACCESS ' : 'ACCESO ') + e.code, 56, 916);
        }
        else { // confirmed: QR veiled with a check, access line becomes the confirmation
            rr(x, QR.x - 10, QR.y - 10, QR.s + 20, QR.s + 20, 18);
            x.fillStyle = 'rgba(255,255,255,.84)';
            x.fill();
            const cx = QR.x + QR.s / 2, cy = QR.y + QR.s / 2;
            x.fillStyle = '#14935f';
            x.beginPath();
            x.arc(cx, cy, 98, 0, TAU);
            x.fill();
            x.strokeStyle = 'rgba(20,147,95,.25)';
            x.lineWidth = 14;
            x.beginPath();
            x.arc(cx, cy, 122, 0, TAU);
            x.stroke();
            x.strokeStyle = '#fff';
            x.lineWidth = 22;
            x.lineCap = 'round';
            x.lineJoin = 'round';
            x.beginPath();
            x.moveTo(cx - 44, cy + 2);
            x.lineTo(cx - 10, cy + 36);
            x.lineTo(cx + 48, cy - 34);
            x.stroke();
            const [hh, mm] = e.hour.split(':');
            const t = (english ? 'ACCESS CONFIRMED · ' : 'ACCESO CONFIRMADO · ') + hh + ':' + String(+mm + 2).padStart(2, '0');
            x.font = '700 28px Manrope';
            x.letterSpacing = '3px';
            const tw = x.measureText(t).width;
            rr(x, 56, 874, tw + 48, 58, 29);
            x.fillStyle = '#14935f';
            x.fill();
            x.fillStyle = '#fff';
            x.fillText(t, 80, 913);
            x.letterSpacing = '0px';
        }
        // holographic seal (the shader adds the shimmer on top)
        const sg = x.createRadialGradient(SEAL.x - 14, SEAL.y - 14, 4, SEAL.x, SEAL.y, SEAL.r);
        sg.addColorStop(0, '#ffffff');
        sg.addColorStop(1, '#c9d3da');
        x.fillStyle = sg;
        x.beginPath();
        x.arc(SEAL.x, SEAL.y, SEAL.r, 0, TAU);
        x.fill();
        x.strokeStyle = 'rgba(18,48,68,.18)';
        x.lineWidth = 1.5;
        for (let r = 10; r < SEAL.r; r += 6) {
            x.beginPath();
            x.arc(SEAL.x, SEAL.y, r, 0, TAU);
            x.stroke();
        }
        x.fillStyle = 'rgba(18,48,68,.62)';
        x.font = '700 40px Sora';
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillText('N', SEAL.x, SEAL.y + 2);
        x.textAlign = 'left';
        x.textBaseline = 'alphabetic';
        const holo = x.createLinearGradient(0, 0, w, 0);
        ['#b8f0ff', '#d9c6ff', '#ffd3ec', '#fff2c2', '#c9ffe6', '#b8f0ff'].forEach((c, k, a) => holo.addColorStop(k / (a.length - 1), c));
        x.fillStyle = holo;
        x.fillRect(0, 960, w, 76);
        x.fillStyle = 'rgba(255,255,255,.55)';
        for (let k = 0; k < w; k += 14) {
            x.fillRect(k, 960, 6, 76);
        }
        x.fillStyle = 'rgba(18,48,68,.55)';
        x.font = '700 18px Manrope';
        x.letterSpacing = '6px';
        x.textAlign = 'center';
        x.fillText('NORDRA EVENTS', w / 2, 1006);
        x.textAlign = 'left';
        x.letterSpacing = '0px';
    }
    const SEAL = { x: 676, y: 902, r: 44 };
    function frontTex(e, i) { return canvasTex(CW, CH, (x, w, h) => drawCard(x, w, h, e, i, false)); }
    function okTex(e, i) { return canvasTex(CW, CH, (x, w, h) => drawCard(x, w, h, e, i, true)); }
    const makeBack = () => canvasTex(CW, CH, (x, w, h) => {
        const g = x.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#f6f8f8');
        g.addColorStop(1, '#e7eeef');
        x.fillStyle = g;
        x.fillRect(0, 0, w, h);
        x.strokeStyle = 'rgba(18,103,129,.12)';
        x.lineWidth = 2;
        for (let k = -h; k < w; k += 28) {
            x.beginPath();
            x.moveTo(k, 0);
            x.lineTo(k + h, h);
            x.stroke();
        }
        x.fillStyle = '#123044';
        x.font = '600 54px Sora';
        x.textAlign = 'center';
        x.fillText(english ? 'Access badge' : 'Gafete de acceso', w / 2, h / 2 - 20);
        x.fillStyle = '#5b6a72';
        x.font = '500 24px Manrope';
        x.fillText(english ? 'If found, please return it to registration' : 'Si lo encuentras, llévalo al registro', w / 2, h / 2 + 30);
        x.font = '700 18px Manrope';
        x.letterSpacing = '8px';
        x.fillText('NORDRA EVENTS', w / 2, h - 120);
    });
    const shadowTex = canvasTex(256, 320, (x) => { x.filter = 'blur(12px)'; x.fillStyle = '#000'; rr(x, 44, 40, 168, 240, 16); x.fill(); }, false);
    const glowTex = canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }, false);
    // ---------- Geometry ----------
    function ribbon(points, width, uvScale) {
        const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
        const segs = 80, L = curve.getLength();
        const pos = [], nor = [], uv = [], idx = [];
        const Z = new THREE.Vector3(0, 0, 1);
        for (let i = 0; i <= segs; i++) {
            const t = i / segs, p = curve.getPointAt(t), tg = curve.getTangentAt(t);
            const side = new THREE.Vector3().crossVectors(tg, Z).normalize();
            const n = new THREE.Vector3().crossVectors(side, tg).normalize();
            for (const s of [-1, 1]) {
                const q = p.clone().addScaledVector(side, s * width / 2);
                pos.push(q.x, q.y, q.z);
                nor.push(n.x, n.y, n.z);
                uv.push(s < 0 ? 0 : 1, t * L / uvScale);
            }
            if (i < segs) {
                const a = i * 2;
                idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
            }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        return g;
    }
    function roundedShape(w, h, r, cx = 0, cy = 0) { const s = new THREE.Shape(); const x = cx - w / 2, y = cy - h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
    function holePath(w, h, r, cx, cy) { const s = roundedShape(w, h, r, cx, cy); const p = new THREE.Path(); p.curves = s.curves; return p; }
    const BW = 1.36, BH = 1.96, BR = .13, TOP = -.36, BCY = TOP - BH / 2;
    const SLOT = { w: .36, h: .075, cy: BH / 2 - .09 };
    // Materials
    const strapMat = new THREE.MeshPhysicalMaterial({ map: strapTex, color: '#1b5a6e', roughness: .85, sheen: 1, sheenRoughness: .5, sheenColor: '#9fd4e2', side: THREE.DoubleSide });
    const tabMat = new THREE.MeshPhysicalMaterial({ map: tabTex, color: '#1b5a6e', roughness: .85, sheen: 1, sheenRoughness: .5, sheenColor: '#9fd4e2', side: THREE.DoubleSide });
    const lanTarget = new THREE.Color('#1b5a6e');
    const metal = new THREE.MeshStandardMaterial({ color: '#dcdde2', metalness: 1, roughness: .2, envMapIntensity: 1.3 });
    const rimMat = new THREE.MeshPhysicalMaterial({ color: '#d9e6ec', emissive: '#000000', metalness: 0, roughness: .12, clearcoat: 1, clearcoatRoughness: .05, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [200, 900], transparent: true, opacity: .92, envMapIntensity: 1.6 });
    const faceMat = new THREE.MeshPhysicalMaterial({ color: '#eef8ff', roughness: .04, clearcoat: 1, iridescence: .8, iridescenceIOR: 1.5, transparent: true, opacity: .07, depthWrite: false, envMapIntensity: 1.8 });
    const holoMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uI: { value: .09 }, uShift: { value: 0 }, uGlint: { value: -3 }, uSpot: { value: new THREE.Vector2(9, 9) }, uSpotA: { value: 0 } },
        vertexShader: `varying vec3 vN;varying vec3 vV;varying vec2 vP;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);vP=position.xy;gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `uniform float uI,uShift,uGlint,uSpotA;uniform vec2 uSpot;varying vec3 vN;varying vec3 vV;varying vec2 vP;
 vec3 hsv(float h){vec3 k=clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);return mix(vec3(1.),k,.55);}
 void main(){float f=abs(dot(vN,vV));float h=fract(vP.x*.45+vP.y*.3+(1.-f)*2.6+uShift);
  float band=smoothstep(.25,0.,abs(fract(vP.x*.35-vP.y*.5+uShift*1.3)-.5));
  float k=uI*(.35+1.6*(1.-f)+band*.9);float gl=smoothstep(.07,0.,abs(vP.x*.8+vP.y*.45-uGlint))*.55;float sp=uSpotA*pow(smoothstep(.45,0.,distance(vP,uSpot)),2.)*.32;gl_FragColor=vec4(hsv(h)*k+vec3(gl)+hsv(h+.3)*sp,0.);}` });
    // Seal shimmer: same idea, stronger, only on the little disc
    const sealMat = holoMat.clone();
    sealMat.uniforms = { uI: { value: .5 }, uShift: holoMat.uniforms.uShift, uGlint: holoMat.uniforms.uGlint, uSpot: holoMat.uniforms.uSpot, uSpotA: holoMat.uniforms.uSpotA };
    // Assembly: rig (drops in) → straps + swing (pendulum at the D-ring) → badge (twists on the clip)
    const rig = new THREE.Group();
    scene.add(rig);
    const straps = new THREE.Group();
    rig.add(straps);
    straps.add(new THREE.Mesh(ribbon([[-1.05, 5.4, -.7], [-.7, 3.2, -.42], [-.32, 1.5, -.12], [-.06, .5, 0]], .2, 1.6), strapMat));
    straps.add(new THREE.Mesh(ribbon([[1.0, 5.4, -.75], [.66, 3.2, -.45], [.3, 1.5, -.13], [.06, .5, 0]], .2, 1.6), strapMat));
    const tab = new THREE.Mesh(new THREE.PlaneGeometry(.21, .44), tabMat);
    tab.position.set(0, .3, .004);
    straps.add(tab);
    const swing = new THREE.Group();
    rig.add(swing);
    const dring = new THREE.Mesh(new THREE.TorusGeometry(.075, .013, 12, 40), metal);
    dring.scale.set(1, .8, 1);
    swing.add(dring);
    const swivel = new THREE.Mesh(new THREE.CylinderGeometry(.024, .03, .08, 20), metal);
    swivel.position.y = -.1;
    swing.add(swivel);
    const clipLoop = new THREE.Mesh(new THREE.TorusGeometry(.055, .015, 12, 40), metal);
    clipLoop.scale.set(1, 1.55, 1);
    clipLoop.position.y = -.23;
    swing.add(clipLoop);
    const gate = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .12, 10), metal);
    gate.position.set(.05, -.24, 0);
    gate.rotation.z = .18;
    swing.add(gate);
    const lever = new THREE.Mesh(new THREE.BoxGeometry(.05, .03, .03), metal);
    lever.position.set(.065, -.17, 0);
    swing.add(lever);
    const twist = new THREE.Group();
    twist.position.y = -.3;
    swing.add(twist);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.052, .01, 10, 36), metal);
    ring.rotation.y = Math.PI / 2;
    ring.position.y = -.1;
    twist.add(ring);
    const badge = new THREE.Group();
    badge.position.y = BCY + .3;
    twist.add(badge);
    { // rim frame
        const outer = roundedShape(BW, BH, BR);
        outer.holes.push(holePath(BW - .08, BH - .08, BR - .04, 0, 0));
        const g = new THREE.ExtrudeGeometry(outer, { depth: .04, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 3, curveSegments: 16 });
        g.translate(0, 0, -.02);
        badge.add(new THREE.Mesh(g, rimMat));
        const faceShape = roundedShape(BW - .02, BH - .02, BR - .01);
        faceShape.holes.push(holePath(SLOT.w, SLOT.h, SLOT.h / 2, 0, SLOT.cy));
        const fg = new THREE.ShapeGeometry(faceShape, 16);
        for (const s of [1, -1]) {
            const f = new THREE.Mesh(fg, faceMat);
            f.position.z = .032 * s;
            if (s < 0)
                f.rotation.y = Math.PI;
            f.renderOrder = 2;
            badge.add(f);
            const h = new THREE.Mesh(fg, holoMat);
            h.position.z = .0335 * s;
            if (s < 0)
                h.rotation.y = Math.PI;
            h.renderOrder = 3;
            badge.add(h);
        }
    }
    const insertY = BH / 2 - .2 - IH / 2;
    const frontMat = new THREE.MeshStandardMaterial({ roughness: .55, metalness: 0, emissive: '#ffffff', emissiveIntensity: .42 });
    let backMat;
    const front = new THREE.Mesh(new THREE.PlaneGeometry(IW, IH), frontMat);
    front.position.set(0, insertY, .006);
    badge.add(front);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(IW, IH), backMat = new THREE.MeshStandardMaterial({ roughness: .55, emissive: '#ffffff', emissiveIntensity: .42 }));
    back.position.set(0, insertY, -.006);
    back.rotation.y = Math.PI;
    badge.add(back);
    const stampMat = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, depthWrite: false, roughness: .55, emissive: '#ffffff', emissiveIntensity: .42 });
    const stamp = new THREE.Mesh(new THREE.PlaneGeometry(IW, IH), stampMat);
    stamp.position.set(0, insertY, .011);
    badge.add(stamp);
    // QR position in badge space
    const qrCenter = new THREE.Vector2((QR.x + QR.s / 2) / CW * IW - IW / 2, insertY + IH / 2 - (QR.y + QR.s / 2) / CH * IH);
    const qrSize = QR.s / CW * IW;
    const scanMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#4dffb0').multiplyScalar(2.2), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(qrSize * 1.12, .012), scanMat);
    scanLine.position.set(qrCenter.x, qrCenter.y, .013);
    badge.add(scanLine);
    const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(qrSize * 1.5, .16), new THREE.MeshBasicMaterial({ map: glowTex, color: '#3dff9e', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    scanGlow.position.set(qrCenter.x, qrCenter.y, .014);
    badge.add(scanGlow);
    const scanLight = new THREE.PointLight('#40ffa0', 0, 2.2, 1.5);
    scanLight.position.set(qrCenter.x, qrCenter.y, .4);
    badge.add(scanLight);
    const seal = new THREE.Mesh(new THREE.CircleGeometry(SEAL.r / CW * IW, 40), sealMat);
    seal.position.set(SEAL.x / CW * IW - IW / 2, insertY + IH / 2 - SEAL.y / CH * IH, .013);
    badge.add(seal);
    // Confirmation ripple over the QR
    const rippleMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#3dff9e').multiplyScalar(1.6), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const ripple = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 64), rippleMat);
    ripple.position.set(qrCenter.x, qrCenter.y, .016);
    ripple.scale.setScalar(.01);
    badge.add(ripple);
    // Night halo behind the badge
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(3, 3.6), new THREE.MeshBasicMaterial({ map: glowTex, color: '#5bc0d8', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.position.set(0, BCY + .3, -.35);
    twist.add(halo);
    // Scanner beam: a fan of light from off-screen to the scan line
    const beamGeo = new THREE.BufferGeometry();
    beamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
    beamGeo.setAttribute('aA', new THREE.BufferAttribute(new Float32Array([0, 1, 1]), 1));
    const beamMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uO: { value: 0 } },
        vertexShader: `attribute float aA;varying float vA;void main(){vA=aA;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `uniform float uO;varying float vA;void main(){float k=uO*pow(vA,2.2)*.6;gl_FragColor=vec4(vec3(.25,1.,.62)*k,0.);}` });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.frustumCulled = false;
    beam.renderOrder = 9;
    scene.add(beam);
    const beamA = new THREE.Vector3(), beamB = new THREE.Vector3(), beamO = new THREE.Vector3();
    const MOTES = LITE ? 60 : 140, motePos = new Float32Array(MOTES * 3), moteSeed = new Float32Array(MOTES);
    {
        const r = rng(5);
        for (let k = 0; k < MOTES; k++) {
            motePos[k * 3] = (r() - .5) * 4;
            motePos[k * 3 + 1] = (r() - .5) * 4.2 - .4;
            motePos[k * 3 + 2] = (r() - .5) * 2.2;
            moteSeed[k] = r() * TAU;
        }
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({ map: glowTex, color: '#fff4dc', size: .05, transparent: true, opacity: .75, depthWrite: false, blending: THREE.AdditiveBlending });
    const motes = new THREE.Points(moteGeo, moteMat);
    motes.frustumCulled = false;
    scene.add(motes);
    // Soft shadow on the stone wall
    const wallShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: .16, depthWrite: false, color: '#3a2a18' }));
    scene.add(wallShadow);
    // ---------- Layout ----------
    const WALL_Z = -1.4;
    let shadowBase = .16;
    const sealY = seal.position.y;
    let baseX = 0, baseY = .95;
    const rendererSize = new THREE.Vector2();
    function layout() {
        const w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h)
            return;
        renderer.getSize(rendererSize);
        if (rendererSize.x !== w || rendererSize.y !== h)
            renderer.setSize(w, h, false);
        camera.aspect = w / h;
        if (wideQ.matches) {
            camera.fov = 30;
            camera.position.set(0, .05, 7.0);
            camera.lookAt(0, .05, 0);
            camera.updateProjectionMatrix();
            const hw = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 7.0 * camera.aspect;
            baseX = hw * .44;
            baseY = .98;
            const v = new THREE.Vector3(baseX, 0, 0).project(camera);
            hero.style.setProperty('--bx', ((v.x + 1) / 2 * w).toFixed(0) + 'px');
        }
        else {
            camera.fov = 30;
            const d = LITE ? 6.3 : 6.6;
            camera.position.set(0, .05, d);
            camera.lookAt(0, -.05, 0);
            camera.updateProjectionMatrix();
            baseX = 0;
            baseY = .76;
            hero.style.setProperty('--bx', '50%');
        }
        rig.position.x = baseX;
    }
    const resizeObserver = new ResizeObserver(() => { if (!disposed) {
        layout();
        if (prepared && !running)
            renderOnce();
    } });
    resizeObserver.observe(stage);
    // ---------- Fonts, then textures ----------
    const fronts = [], stamps = [];
    let current = 0;
    const kindEl = hero.querySelector('[data-badge-kind]'), dots = [...hero.querySelectorAll('.dots i')];
    function showEventTint() { hero.style.setProperty('--ev', document.body.classList.contains('dark') ? new THREE.Color(EVENTS[current].accent).lerp(new THREE.Color('#ffffff'), .45).getStyle() : EVENTS[current].accent); }
    function showEvent(i) {
        current = i;
        frontMat.map = frontMat.emissiveMap = fronts[i];
        frontMat.needsUpdate = true;
        stampMat.map = stampMat.emissiveMap = stamps[i];
        stampMat.needsUpdate = true;
        kindEl.textContent = EVENTS[i].type;
        dots.forEach((d, k) => d.classList.toggle('on', k === i));
        hero.style.setProperty('--ev', document.body.classList.contains('dark') ? new THREE.Color(EVENTS[i].accent).lerp(new THREE.Color('#ffffff'), .45).getStyle() : EVENTS[i].accent);
        lanTarget.set(EVENTS[i].lan);
        halo.material.color.set(EVENTS[i].accent).lerp(new THREE.Color('#9fe6f5'), .5);
    }
    // ---------- Motion ----------
    // Springs: roll (pendulum), pitch (toward camera), turn (twist on the clip), drop (bounce on the lanyard).
    const S = { roll: 0, rollV: 0, pitch: 0, pitchV: 0, turn: 0, turnV: 0, turnT: 0, drop: 0, dropV: 0, lift: 0, liftV: 0, slide: 0, slideV: 0, flash: 0, glintT: 9, rippleT: 9 };
    let hovering = false, entered = false;
    const caption = hero.querySelector('.caption'), dotsBox = hero.querySelector('.dots');
    let paused = reduce, running = false, visible = true, last = 0, clock = 0;
    let phase = 'enter', phaseT = 0, pendingSwap = false, hoverX = 0, hoverY = 0, nextAuto = 0;
    function spring(k, c, x, v, target, dt) { const a = -k * (x - target) - c * v; v += a * dt; x += v * dt; return [x, v]; }
    function flip() { if (pendingSwap)
        return; pendingSwap = true; S.turnT += TAU; S.turnV += 3.2; S.rollV += .35; S.dropV -= .7; dotsBox.style.setProperty('--p', 0); phase = 'flip'; phaseT = 0; fadeStamp = true; }
    let fadeStamp = false;
    function enter() {
        entered = true;
        S.drop = reduce || paused ? 0 : 4.6;
        S.dropV = -1.5;
        S.turn = reduce || paused ? 0 : -TAU;
        S.turnV = 0;
        S.turnT = 0;
        S.roll = 0;
        S.rollV = reduce || paused ? 0 : .9;
        S.pitch = 0;
        S.pitchV = 0;
        phase = reduce || paused ? 'idle' : 'enter';
        phaseT = 0;
        pendingSwap = false;
        stampMat.opacity = 0;
        scanMat.opacity = 0;
        clock = 0;
        nextAuto = 0;
    }
    function waitOffstage() { entered = false; phase = 'wait'; S.drop = 6; S.dropV = 0; S.turn = S.turnT = 0; stampMat.opacity = 0; }
    function step(dt) {
        if (phase === 'wait') {
            apply();
            return;
        }
        clock += dt;
        phaseT += dt;
        // breeze so it never freezes completely
        const breeze = .02 * Math.sin(clock * .8) + .012 * Math.sin(clock * 1.9 + 1);
        [S.drop, S.dropV] = spring(70, 7.5, S.drop, S.dropV, 0, dt);
        [S.roll, S.rollV] = spring(5.8, .9, S.roll, S.rollV, breeze - S.dropV * .012, dt);
        [S.pitch, S.pitchV] = spring(9, 2.4, S.pitch, S.pitchV, (hovering ? -hoverY * .22 : 0) + .04 * Math.sin(clock * .6), dt);
        [S.lift, S.liftV] = spring(40, 9, S.lift, S.liftV, hovering || dragging ? .16 : 0, dt);
        S.flash = Math.max(0, S.flash - dt * 2.2);
        [S.slide, S.slideV] = spring(60, 11, S.slide, S.slideV, 0, dt);
        strapMat.color.lerp(lanTarget, 1 - Math.exp(-dt * 3));
        tabMat.color.copy(strapMat.color);
        {
            const a = moteGeo.attributes.position.array;
            for (let k = 0; k < MOTES; k++) {
                a[k * 3 + 1] += dt * .05;
                a[k * 3] += Math.sin(clock * .4 + moteSeed[k]) * dt * .03;
                if (a[k * 3 + 1] > 1.7)
                    a[k * 3 + 1] = -2.5;
            }
            moteGeo.attributes.position.needsUpdate = true;
            motes.position.x = baseX;
        }
        holoMat.uniforms.uSpotA.value += ((hovering ? 1 : 0) - holoMat.uniforms.uSpotA.value) * Math.min(1, dt * 6);
        frontMat.emissiveIntensity = .42 + .55 * S.flash;
        S.glintT += dt;
        holoMat.uniforms.uGlint.value = -1.6 + S.glintT * 3.6;
        S.rippleT += dt;
        {
            const t = clamp(S.rippleT / .8);
            ripple.scale.setScalar(qrSize * (.35 + 1.1 * (1 - Math.pow(1 - t, 3))));
            rippleMat.opacity = (1 - t) * (S.rippleT < .8 ? 1 : 0);
        }
        halo.material.opacity = document.body.classList.contains('dark') ? .32 + .06 * Math.sin(clock * 1.3) : 0;
        if (phase === 'idle' && nextAuto)
            dotsBox.style.setProperty('--p', clamp(1 - (nextAuto - clock) / 3.4).toFixed(3));
        if (!dragging) {
            [S.turn, S.turnV] = spring(phase === 'enter' ? 3.4 : 2.9, phase === 'enter' ? 2.0 : 2.3, S.turn, S.turnV, S.turnT + (hovering ? hoverX * .3 : 0) + .05 * Math.sin(clock * .5), dt);
        }
        // swap the print while its back is toward us
        if (pendingSwap && Math.cos(S.turn) < -.3) {
            showEvent((current + 1) % EVENTS.length);
            pendingSwap = false;
            S.flash = 1;
            S.slide = .32;
            S.slideV = 0;
        }
        const settled = Math.abs(S.turn - S.turnT) < .12 && Math.abs(S.turnV) < .35 && Math.abs(S.drop) < .03;
        if (fadeStamp) {
            stampMat.opacity = Math.max(0, stampMat.opacity - dt * 5);
            if (!stampMat.opacity)
                fadeStamp = false;
        }
        if ((phase === 'enter' && phaseT > 2.2 && settled) || (phase === 'flip' && !pendingSwap && settled && phaseT > 1.4)) {
            phase = 'scan';
            phaseT = 0;
        }
        if (phase === 'scan') {
            const t = clamp(phaseT / 1.05);
            const y = qrCenter.y + qrSize * .56 - t * qrSize * 1.12;
            scanLine.position.y = scanGlow.position.y = y;
            const o = Math.sin(t * Math.PI);
            scanMat.opacity = o;
            scanGlow.material.opacity = o * .8;
            scanLight.intensity = o * 1.6;
            beamMat.uniforms.uO.value = o;
            if (t >= 1) {
                phase = 'stamp';
                phaseT = 0;
                beamMat.uniforms.uO.value = 0;
                S.rippleT = 0;
                S.glintT = 0;
                S.pitchV -= .9;
                S.rollV += .12;
                title.classList.remove('scanned');
                void title.offsetWidth;
                title.classList.add('scanned');
            }
        }
        if (phase === 'stamp') {
            const t = clamp(phaseT / .22);
            stampMat.opacity = t;
            if (phaseT > .3) {
                phase = 'idle';
                phaseT = 0;
                nextAuto = clock + 3.4;
            }
        }
        if (phase === 'idle' && nextAuto && clock > nextAuto && !dragging) {
            nextAuto = 0;
            flip();
        }
        apply();
        holoMat.uniforms.uShift.value = S.turn * .18 + S.roll * .6 + clock * .015;
    }
    function apply() {
        rig.position.set(baseX, baseY + S.drop, S.lift);
        if (beamMat.uniforms.uO.value > 0) {
            scanLine.updateWorldMatrix(true, false);
            const hw = qrSize * .56;
            beamA.set(-hw, 0, 0);
            beamB.set(hw, 0, 0);
            scanLine.localToWorld(beamA);
            scanLine.localToWorld(beamB);
            beamO.set(baseX + (wideQ.matches ? 2.2 : 1.3), -2.6, 2.4);
            const a = beamGeo.attributes.position.array;
            a.set([beamO.x, beamO.y, beamO.z, beamA.x, beamA.y, beamA.z, beamB.x, beamB.y, beamB.z]);
            beamGeo.attributes.position.needsUpdate = true;
        }
        swing.rotation.set(S.pitch, 0, S.roll);
        twist.rotation.y = S.turn;
        straps.rotation.z = S.roll * .12;
        // shadow: light from upper left → falls right and down on the wall
        const c = Math.abs(Math.cos(S.turn));
        wallShadow.position.set(baseX + .85 + S.roll * -.9 + S.lift * 1.6, baseY + S.drop + BCY - .3 - S.lift * .8, WALL_Z);
        wallShadow.material.opacity = shadowBase * (1 - S.lift * 1.6);
        front.position.y = stamp.position.y = insertY + S.slide;
        seal.position.y = sealY + S.slide;
        wallShadow.scale.set(.18 + .82 * c, 1, 1);
        wallShadow.rotation.z = S.roll;
    }
    function renderOnce() { apply(); renderer.render(scene, camera); }
    function loop(now) {
        if (!running)
            return;
        const dt = Math.min(.033, (now - (last || now)) / 1000);
        last = now;
        step(dt);
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(loop);
    }
    function start() { if (running || paused || !visible || document.hidden)
        return; running = true; last = 0; frameId = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(frameId); frameId = 0; }
    // ---------- Touch & drag ----------
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), spotV = new THREE.Vector3();
    let dragging = false, downX = 0, downY = 0, downT = 0, lastX = 0;
    function hit(ev) { const r = stage.getBoundingClientRect(); ndc.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera); const h = ray.intersectObject(badge, true)[0]; if (h) {
        badge.worldToLocal(spotV.copy(h.point));
        holoMat.uniforms.uSpot.value.set(spotV.x, spotV.y);
    } return !!h; }
    listen(stage, 'pointerdown', ev => { if (paused || !running || !hit(ev))
        return; dragging = true; downX = lastX = ev.clientX; downY = ev.clientY; downT = performance.now(); stage.classList.add('dragging'); stage.setPointerCapture(ev.pointerId); });
    listen(stage, 'pointermove', ev => {
        const r = stage.getBoundingClientRect();
        hoverX = clamp((ev.clientX - r.left) / r.width) * 2 - 1;
        hoverY = clamp((ev.clientY - r.top) / r.height) * 2 - 1;
        if (!dragging && ev.pointerType === 'mouse') {
            hovering = hit(ev);
            stage.style.cursor = hovering ? 'grab' : 'default';
        }
        if (!dragging || paused)
            return;
        const dx = ev.clientX - lastX;
        lastX = ev.clientX;
        S.turn += dx * .012;
        S.turnV = dx * .6;
        S.rollV += dx * .002;
    });
    listen(stage, 'pointerleave', () => { hoverX = hoverY = 0; hovering = false; });
    function release(ev) {
        if (!dragging)
            return;
        dragging = false;
        stage.classList.remove('dragging');
        caption.classList.add('used');
        const moved = Math.hypot(ev.clientX - downX, ev.clientY - downY), quick = performance.now() - downT < 350;
        if (moved < 8 && quick) {
            if (ev.pointerType === 'touch' && navigator.vibrate)
                navigator.vibrate(8);
            if (paused) {
                showEvent((current + 1) % EVENTS.length);
                strapMat.color.copy(lanTarget);
                tabMat.color.copy(lanTarget);
                stampMat.opacity = 1;
                renderOnce();
            }
            else
                flip();
            return;
        }
        // after a spin, settle on the nearest front-facing turn and reprint if it went around
        const k = Math.round((S.turn + S.turnV * .35) / TAU);
        if (k !== Math.round(S.turnT / TAU)) {
            pendingSwap = true;
            fadeStamp = true;
            phase = 'flip';
            phaseT = 0;
        }
        S.turnT = k * TAU;
        if (paused)
            renderOnce();
    }
    listen(stage, 'pointerup', release);
    listen(stage, 'pointercancel', release);
    // ---------- Host lifecycle ----------
    function setTheme(d) {
        scene.environment = d ? envDark : envLight;
        key.intensity = d ? 1.0 : 1.5;
        amb.intensity = d ? .25 : .55;
        rim.intensity = d ? 1.2 : .6;
        rim.color.set(d ? '#7fdcef' : '#dff4ff');
        shadowBase = d ? .3 : .16;
        rimMat.emissive.set(d ? '#16343d' : '#000000');
        moteMat.color.set(d ? '#a8ecff' : '#fff4dc');
        moteMat.opacity = d ? .9 : .75;
        showEventTint();
        wallShadow.material.color.set(d ? '#000000' : '#3a2a18');
        holoMat.uniforms.uI.value = d ? .14 : .09;
        halo.material.opacity = d ? .32 : 0;
    }
    function rest() {
        stop();
        hovering = dragging = false;
        Object.assign(S, { drop: 0, dropV: 0, roll: 0, rollV: 0, pitch: 0, pitchV: 0, turn: 0, turnV: 0, turnT: 0, lift: 0, liftV: 0, slide: 0, slideV: 0, flash: 0, glintT: 9, rippleT: 9 });
        pendingSwap = false;
        fadeStamp = false;
        phase = 'idle';
        phaseT = 0;
        nextAuto = clock + 3.4;
        scanMat.opacity = scanGlow.material.opacity = scanLight.intensity = rippleMat.opacity = beamMat.uniforms.uO.value = 0;
        holoMat.uniforms.uGlint.value = 30;
        holoMat.uniforms.uSpotA.value = 0;
        stampMat.opacity = 1;
        frontMat.emissiveIntensity = .42;
        strapMat.color.copy(lanTarget);
        tabMat.color.copy(lanTarget);
        dotsBox.style.setProperty('--p', 0);
        renderOnce();
    }
    function setState(state) {
        if (disposed)
            return;
        if (state.dark !== currentDark) {
            currentDark = state.dark;
            setTheme(currentDark);
            if (!running)
                renderOnce();
        }
        visible = state.visible && !state.hidden && !state.embeddedHidden;
        const wasPaused = paused;
        paused = state.paused || state.reduced;
        if (paused && !wasPaused) {
            showEvent(0);
            rest();
        }
        if (!visible || paused) {
            stop();
            return;
        }
        if (!entered) {
            entered = true;
            if (options.entered)
                rest();
            else
                enter();
            options.onEnter?.();
        }
        start();
    }
    function dispose() {
        if (disposed)
            return;
        disposed = true;
        stop();
        events.abort();
        resizeObserver.disconnect();
        const textures = new Set([...fronts, ...stamps, strapTex, tabTex, shadowTex, glowTex, backMat.map]);
        releaseTree(scene);
        for (const texture of textures)
            texture?.dispose();
        for (const target of envTargets)
            target.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
    }
    listen(renderer.domElement, 'webglcontextlost', event => { event.preventDefault(); if (!disposed)
        options.onFallback?.(); });
    // re-draw strap print now that Sora is ready
    {
        const c = strapTex.image, x = c.getContext('2d');
        x.save();
        x.translate(64, 0);
        x.rotate(Math.PI / 2);
        x.fillStyle = 'rgba(255,255,255,1)';
        x.font = '600 46px Sora';
        x.textBaseline = 'middle';
        for (let y = 60; y < 1024; y += 512)
            x.fillText('NORDRA  EVENTS', y, 0);
        x.restore();
        strapTex.needsUpdate = true;
    }
    fronts[0] = frontTex(EVENTS[0], 0);
    await yieldSetup();
    stamps[0] = okTex(EVENTS[0], 0);
    await yieldSetup();
    backMat.map = backMat.emissiveMap = makeBack();
    backMat.needsUpdate = true;
    // Flush each canvas and upload it in its own frame, before any visible draw.
    for (const texture of [fronts[0], stamps[0], backMat.map, strapTex, tabTex, shadowTex, glowTex]) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        renderer.initTexture(texture);
    }
    // Prepare later cards individually while the browser is idle. All cards are
    // ready before interaction is enabled, including rapid successive taps.
    for (let index = 1; index < EVENTS.length; index++) {
        for (const [textures, draw] of [[fronts, frontTex], [stamps, okTex]]) {
            await new Promise(resolve => window.requestIdleCallback ? requestIdleCallback(resolve, { timeout: 200 }) : setTimeout(resolve, 0));
            textures[index] = draw(EVENTS[index], index);
            await new Promise(resolve => requestAnimationFrame(resolve));
            renderer.initTexture(textures[index]);
        }
    }
    showEvent(0);
    layout();
    setTheme(currentDark);
    waitOffstage();
    await prepareBadgePrograms(renderer, camera, scene);
    await yieldSetup();
    prepared = true;
    if (options.isCancelled?.()) {
        dispose();
        return { setState() { }, dispose() { } };
    }
    performance.mark('nordra-badge-ready');
    return { setState, dispose };
}
