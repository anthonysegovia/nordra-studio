import assert from 'node:assert/strict';
import sharp from 'sharp';

// Computed color alone misses a later section painting over the text.
// Check actual foreground pixels separately on every rendered line.
export async function checkSubtitleInk(page) {
  const text = await page.locator('.scene-intro > p').evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const style = getComputedStyle(element);
    return {
      color: style.color
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number),
      fontSize: parseFloat(style.fontSize),
      lines: [...range.getClientRects()].map((box) => ({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      })),
    };
  });
  const { data, info } = await sharp(await page.screenshot())
    .raw()
    .toBuffer({ resolveWithObject: true });
  const distances = text.lines.map((line) => {
    let closest = 255;
    for (
      let y = Math.max(0, Math.ceil(line.y));
      y < Math.min(info.height, line.y + line.height);
      y++
    ) {
      for (
        let x = Math.max(0, Math.ceil(line.x));
        x < Math.min(info.width, line.x + line.width);
        x++
      ) {
        const offset = (y * info.width + x) * info.channels;
        closest = Math.min(
          closest,
          Math.max(
            ...text.color.map((value, channel) =>
              Math.abs(data[offset + channel] - value),
            ),
          ),
        );
      }
    }
    return closest;
  });
  assert.ok(text.fontSize >= (page.viewportSize().width === 390 ? 17 : 20));
  assert.ok(
    distances.every((distance) => distance <= 18),
    `Light paints over subtitle: ${distances}`,
  );
  return {
    fontSize: text.fontSize,
    color: text.color,
    lineInkDistances: distances,
  };
}

// This helper never sets loading, decodes images or reveals CSS classes.
// It uses the same wheel input as a visitor and inspects what was rendered.
export async function walkGafete(page) {
  await page.mouse.move(190, 400);
  await page.mouse.wheel(0, -100000);
  await page.waitForTimeout(400);
  const seen = new Set();
  for (let step = 0; step < 24; step++) {
    await page.waitForFunction(
      () => {
        const visible = [
          ...document.querySelectorAll('.celebration-content img'),
        ].filter((image) => {
          const box = image.getBoundingClientRect();
          return (
            image.getClientRects().length &&
            box.bottom > 0 &&
            box.top < innerHeight &&
            box.right > 0 &&
            box.left < innerWidth
          );
        });
        return visible.every(
          (image) =>
            image.naturalWidth > 0 &&
            image.getBoundingClientRect().width > 0 &&
            image.getBoundingClientRect().height > 0,
        );
      },
      null,
      { timeout: 10000 },
    );
    const visible = await page
      .locator('.celebration-content img')
      .evaluateAll((images) =>
        images
          .filter((image) => {
            const box = image.getBoundingClientRect();
            return (
              box.bottom > 0 &&
              box.top < innerHeight &&
              box.right > 0 &&
              box.left < innerWidth
            );
          })
          .map((image) => new URL(image.currentSrc || image.src).pathname),
      );
    visible.forEach((source) => seen.add(source));
    const bottom = await page.evaluate(
      () => scrollY + innerHeight >= document.documentElement.scrollHeight - 2,
    );
    if (bottom) break;
    await page.mouse.wheel(0, 480);
    await page.waitForTimeout(350);
  }
  const materials = await page
    .locator('.register-paper>img,.woven')
    .evaluateAll((images) =>
      images.map((image) => ({
        className: image.className,
        source: new URL(image.currentSrc).pathname,
        naturalWidth: image.naturalWidth,
        width: image.getBoundingClientRect().width,
        height: image.getBoundingClientRect().height,
        revealed:
          !image.classList.contains('woven') ||
          image.classList.contains('arrived'),
      })),
    );
  assert.equal(materials.length, 5);
  assert.ok(
    materials.every(
      (image) =>
        image.naturalWidth > 0 &&
        image.width > 0 &&
        image.height > 0 &&
        image.revealed,
    ),
    JSON.stringify(materials),
  );
  await page.mouse.wheel(0, -100000);
  await page.waitForTimeout(800);
  return { visibleImages: seen.size, materials };
}
