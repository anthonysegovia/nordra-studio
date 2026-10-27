const photographs = {
  story: { file: "quiet-laughter", widths: [480, 800, 1440], width: 1536, height: 1024, es: "La pareja comparte una sonrisa junto al velo y las cortinas de color marfil", en: "The couple shares a smile beside an ivory veil and soft curtains" },
  day: { file: "walking-together", widths: [480, 800, 1440], width: 1536, height: 1024, es: "La misma pareja camina de la mano por una galería luminosa en tonos crema", en: "The same couple walks hand in hand through a sunlit cream gallery" },
  portrait: { file: "tender-portrait", widths: [320, 640, 1120], width: 1122, height: 1402, es: "Retrato de la pareja abrazada, con velo marfil y traje de lino beige", en: "A portrait of the couple embracing, with an ivory veil and beige linen suit" },
} as const;

export function WeddingEditorialPhoto({ shot, english, className, sizes = "(max-width:760px) 90vw, 550px", eager = false }: {
  shot: keyof typeof photographs; english: boolean; className?: string; sizes?: string; eager?: boolean;
}) {
  const photo = photographs[shot];
  const base = `/artwork/wedding-marfil/${photo.file}-v1`;
  return <img className={className} src={`${base}-${photo.widths[1]}.webp`} srcSet={photo.widths.map(width => `${base}-${width}.webp ${width}w`).join(", ")} sizes={sizes} width={photo.width} height={photo.height} loading={eager ? "eager" : "lazy"} decoding="async" alt={english ? photo.en : photo.es} />;
}
