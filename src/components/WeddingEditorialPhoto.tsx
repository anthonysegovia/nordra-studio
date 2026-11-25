const photographs = {
  'nervous-groom': { file: 'nervous-groom', widths: [320, 640, 1120], width: 1122, height: 1402, es: 'Él se acomoda el saco con media sonrisa mientras ella lo mira divertida al fondo', en: 'He adjusts his jacket with a half smile while she watches with amusement in the background' },
  'before-call': { file: 'before-call', widths: [480, 800, 1440], width: 1536, height: 1024, es: 'Los dos esperan sentados junto a una ventana con cortinas translúcidas, hablando en voz baja', en: 'The couple waits seated beside a window with sheer curtains, speaking softly' },
  'heavy-veil': { file: 'heavy-veil', widths: [320, 640, 1120], width: 1122, height: 1402, es: 'Ella mira sobre el hombro mientras él sostiene discretamente el borde de su velo largo', en: 'She looks over her shoulder while he gently holds the edge of her long veil' },
  'sore-smiles': { file: 'sore-smiles', widths: [480, 800, 1440], width: 1536, height: 1024, es: 'La pareja ríe con los ojos entrecerrados y las frentes casi juntas', en: 'The couple laughs with narrowed eyes and their foreheads almost touching' },
  'both-camera': { file: 'both-camera', widths: [320, 640, 1120], width: 1122, height: 1402, es: 'Los dos miran directamente a cámara, uno junto al otro, con una sonrisa tranquila', en: 'Both look directly at the camera, standing side by side with peaceful smiles' },
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
