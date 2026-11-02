// A shared CSS floor, resolved by the browser before paint. The original size
// remains the preferred value; desktop and invitation covers opt out via tokens.
export function commercialTypeFloor() {
  return {
    postcssPlugin: 'nordra-commercial-type-floor',
    Declaration(decl) {
      const file = decl.source?.input.file?.replaceAll('\\', '/') || '';
      if (!file.includes('/src/site/styles/') || /\/(phone-frame|landscape)\.css/.test(file)) return;
      if (decl.value.includes('--commercial-min-text')) return;
      if (decl.prop === 'font-size' && /^(?:[\d.]|clamp\(|calc\(|min\(|max\()/i.test(decl.value)) {
        decl.value = `max(var(--commercial-min-text, 0px), ${decl.value})`;
      } else if (decl.prop === 'font') {
        // Preserve weight, line-height and family in existing font shorthands.
        decl.value = decl.value.replace(/(?<![\w.-])(\d*\.?\d+(?:px|rem|em))(?=\s|\/)/, 'max(var(--commercial-min-text, 0px), $1)');
      }
    },
  };
}
