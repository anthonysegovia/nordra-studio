import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldInterceptWhatsApp } from '../src/site/whatsapp-dialog.mjs';
const base = { href: 'https://wa.me/528129022231?text=Hola%0A%0ADesde%20nordrastudio.mx/negocios', pathname: '/negocios', desktop: true };
test('commercial desktop links including English and HTML routes', () => {
 for (const pathname of ['/', '/en', '/en/', '/index.html', '/en/index.html', '/estudio', '/negocios/', '/invitaciones.html', '/en/bodas', '/cumpleanos', '/eventos', '/temporada']) assert.equal(shouldInterceptWhatsApp({ ...base, pathname }), true, pathname);
});
test('private invitations, demos, panels and management stay untouched', () => {
 for (const pathname of ['/demos/posada/', '/invitaciones/camila-30/', '/invitaciones/valentina-y-sebastian/', '/panel-boda.html', '/gestion.html', '/mi-boda', '/aviso-de-privacidad', '/en/unknown']) assert.equal(shouldInterceptWhatsApp({ ...base, pathname }), false, pathname);
});
test('touch, narrow screens and native modified click behaviors stay untouched', () => {
 for (const change of [{ desktop: false }, { button: 1 }, { button: 2 }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { download: true }, { bypass: true }]) assert.equal(shouldInterceptWhatsApp({ ...base, ...change }), false);
});
test('only exact secure wa.me hosts, preserving the supplied message', () => {
 for (const href of ['https://wa.me.evil.test/123', 'https://example.com/wa.me', 'mailto:hola@nordrastudio.mx', '#contacto', 'http://wa.me/123', 'https://user@wa.me/123', 'https://wa.me:8080/123']) assert.equal(shouldInterceptWhatsApp({ ...base, href }), false, href);
 const href = base.href; assert.equal(shouldInterceptWhatsApp(base), true); assert.equal(base.href, href);
});
