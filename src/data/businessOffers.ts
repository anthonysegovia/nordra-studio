export const businessOffers = [
  { id: 'landing-essential', article: 'la', name: 'Landing Esencial', cents: 179900, maxCents: 299900, openEnded: false, card: 'landing', features: ['Una página personalizada', 'Diseño para celular y computadora', 'Botón de WhatsApp', 'Mapa, horarios y redes sociales'], scope: 'Una landing reúne tu información en una sola página. Acordamos el contenido y el alcance según tu negocio.' },
  { id: 'landing-professional', article: 'la', name: 'Landing Profesional', cents: 299900, maxCents: 599900, openEnded: false, card: 'landing', features: ['Una página con hasta 3 secciones', 'Diseño personalizado y adaptable', 'Formulario de contacto y WhatsApp', 'Optimización básica para buscadores', '2 rondas de cambios'], scope: 'Las secciones son bloques de una misma página, como inicio, servicios y contacto. También incluye mapa, horarios y redes sociales.' },
  { id: 'business-site', article: 'el', name: 'Sitio de Negocio', cents: 499900, maxCents: 999900, openEnded: false, card: 'business', features: ['De 4 a 6 apartados de contenido', 'Diseño personalizado y adaptable', 'Galería de fotos', 'Formulario, WhatsApp y redes', 'SEO básico y 2 rondas de cambios'], scope: 'Definimos en la cotización si los apartados se organizan en una página o en páginas independientes. Incluye mapa y horarios.' },
  { id: 'custom-web', article: 'una', name: 'Web a medida', cents: 799900, maxCents: 1499900, openEnded: true, card: 'custom', features: ['Diseño personalizado y adaptable', 'Formularios avanzados', 'Catálogo de productos o servicios', 'Integraciones según el alcance', 'WhatsApp, mapa y redes sociales', 'SEO y 2 rondas de cambios'], scope: 'Reservas, pagos y otras integraciones se definen en la propuesta. Los servicios externos se cotizan según tu proyecto.' },
  { id: 'shop', article: 'una', name: 'Tienda en línea', cents: 1199900, maxCents: 2999900, openEnded: true, card: 'custom', features: ['Diseño personalizado y adaptable', 'Catálogo según el plan', 'Integración de pagos y opciones de envío', 'Panel de administración', 'Capacitación básica', 'SEO y 2 a 3 rondas de cambios'], scope: 'Productos, envíos, pagos y funciones se acuerdan en la cotización. Las comisiones y servicios externos se especifican por separado.' },
] as const;
export const businessHosting = [
  { id: 'info', name: 'Página informativa', catalogName: 'Informativa', startingAt: false, terms: [{ id: 'month', label: 'mensual', months: 1, cents: 29900 }, { id: 'six', label: 'por 6 meses', months: 6, cents: 149500 }, { id: 'year', label: 'anual', months: 12, cents: 299000 }] },
  { id: 'panel', name: 'Aplicación con panel o registros', catalogName: 'Panel o registros', startingAt: true, terms: [{ id: 'month', label: 'mensual', months: 1, cents: 59900 }, { id: 'six', label: 'por 6 meses', months: 6, cents: 299500 }, { id: 'year', label: 'anual', months: 12, cents: 599000 }] },
] as const;
export function businessMoney(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(cents / 100);
}
export const businessPriceNote = 'Precios desde, en MXN con IVA incluido. Confirmamos alcance y precio final en tu cotización.';
export function businessWhatsApp(offer: { article?: string; name: string; cents: number }) {
  return 'https://wa.me/528129022231?text=' + encodeURIComponent(`Hola, me interesa ${offer.article ? `${offer.article} ` : ''}${offer.name} (desde ${businessMoney(offer.cents)} MXN, IVA incluido). Mi negocio es…`);
}
