// A shared CSS floor, resolved by the browser before paint. The original size
// remains the preferred value; desktop and invitation covers opt out via tokens.
export function commercialTypeFloor() {
  const needsFloor = value => {
    const fixed = /^(\d*\.?\d+)(px|em|rem)$/.exec(value);
    if (fixed) return Number(fixed[1]) < ({ px: 13, em: 1, rem: .8125 })[fixed[2]];
    const minimum = /^clamp\(\s*(\d*\.?\d+)px/.exec(value);
    return !minimum || Number(minimum[1]) < 13;
  };
  const floor = value => /^\d*\.?\d+px$/.test(value)
    ? `var(--commercial-min-text, ${value})`
    : `max(var(--commercial-min-text, 0px), ${value})`;
  return {
    postcssPlugin: 'nordra-commercial-type-floor',
    Declaration(decl) {
      const file = decl.source?.input.file?.replaceAll('\\', '/') || '';
      if (!file.includes('/src/site/styles/') || /\/(phone-frame|landscape)\.css/.test(file)) return;
      if (decl.value.includes('--commercial-min-text')) return;
      if (decl.prop === 'font-size' && /^(?:[\d.]|clamp\(|calc\(|min\(|max\()/i.test(decl.value) && needsFloor(decl.value)) {
        decl.value = floor(decl.value);
      } else if (decl.prop === 'font') {
        // Preserve weight, line-height and family in existing font shorthands.
        decl.value = decl.value.replace(/(?<![\w.-])(\d*\.?\d+(?:px|rem|em))(?=\s|\/)/, size => needsFloor(size) ? floor(size) : size);
      }
    },
  };
}
