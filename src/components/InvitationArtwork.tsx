import type { Occasion } from "../data/invitationOccasions";
import "../styles/invitation-artwork.css";

type ArtworkKind = Occasion | "seasonal";

const cardSizes = "(max-width: 760px) calc((100vw - 54px) / 2), (max-width: 960px) calc((100vw - 58px) / 2), (max-width: 1220px) calc((100vw - 94px) / 4), 282px";
const heroSizes = "(max-width: 760px) calc(100vw - 40px), 550px";

/** Restrained editorial imagery; functional examples live in the invitation demos. */
export function InvitationArtwork({ kind, english, decorative = false }: { kind: ArtworkKind; english: boolean; decorative?: boolean }) {
  const descriptions = english
    ? {
      wedding: "A couple in an intimate embrace, their foreheads touching beneath a soft ivory veil.",
      birthday: "A soft blush balloon with a flowing silk ribbon.",
      gathering: "Two hands gently bring their glasses together for a toast.",
      seasonal: "An ivory folded-paper star against a pale lavender background.",
    }
    : {
      wedding: "Una pareja se abraza con las frentes juntas, bajo un delicado velo color marfil.",
      birthday: "Un globo rosa suave con un delicado lazo de seda.",
      gathering: "Dos manos acercan sus copas en un brindis.",
      seasonal: "Una estrella de papel marfil sobre un fondo lavanda suave.",
    };
  const asset = `/artwork/invitation-editorial/${kind}-v2`;
  return <div className={`invitation-art artwork-${kind}`} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : descriptions[kind]} aria-hidden={decorative || undefined}>
    <img className="editorial-image" src={`${asset}-640.webp`} srcSet={`${asset}-400.webp 400w, ${asset}-640.webp 640w, ${asset}-1200.webp 1200w`} sizes={decorative ? cardSizes : heroSizes} width={1200} height={1200} alt="" decoding="async" fetchPriority={!decorative || kind === "wedding" ? "high" : "auto"} />
  </div>;
}
