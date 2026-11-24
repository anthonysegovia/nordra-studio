import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderOccasionPrices } from './occasion-content.mjs';

export function renderInvitationTerms(html) {
  return renderOccasionPrices(html.replace(/\{\{offer:(esencial|aurora|boreal):delivery-en\}\}/g, (_, id) =>
    renderOccasionPrices(`{{offer:${id}:delivery}}`).replace('días hábiles', 'business days')));
}

// Public legal documents are copied by Vite; resolve the same source tokens in dev and build.
export function invitationTermsPlugin() {
  return {
    name: 'nordra-invitation-terms',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (!['/terminos-del-servicio.html', '/en/terminos-del-servicio.html'].includes(pathname)) return next();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(renderInvitationTerms(readFileSync(resolve(server.config.root, 'public' + pathname), 'utf8')));
      });
    },
    writeBundle(options) {
      for (const file of ['terminos-del-servicio.html', 'en/terminos-del-servicio.html']) {
        writeFileSync(resolve(options.dir, file), renderInvitationTerms(readFileSync(new URL('../public/' + file, import.meta.url), 'utf8')));
      }
    },
  };
}
