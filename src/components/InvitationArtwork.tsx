import { BirthdayPoster, EventPoster } from "./InvitationDesignPreview";
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
      birthday: "Sofía’s Afterglow birthday invitation with a chrome ribbon and electric blue typography.",
      gathering: "Conexión / 27 event invitation with intersecting prismatic glass rings.",
      seasonal: "An ivory folded-paper star against a pale lavender background.",
    }
    : {
      wedding: "Una pareja se abraza con las frentes juntas, bajo un delicado velo color marfil.",
      birthday: "La invitación Afterglow del cumpleaños de Sofía, con un lazo cromado y azul eléctrico.",
      gathering: "La invitación Conexión / 27, con aros de cristal que se encuentran.",
      seasonal: "Una estrella de papel marfil sobre un fondo lavanda suave.",
    };
  if (kind === "birthday" || kind === "gathering") return <div className={`invitation-art artwork-${kind} invitation-design-art`} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : descriptions[kind]} aria-hidden={decorative || undefined}>
    <div className="hub-design-stage">{kind === "birthday" ? <BirthdayPoster design="afterglow" english={english} compact /> : <EventPoster english={english} />}</div>
    <span className="hub-design-caption">{kind === "birthday" ? "SOFÍA / AFTERGLOW" : "CONEXIÓN / 27"}<span aria-hidden="true">↗</span></span>
  </div>;
  const asset = `/artwork/invitation-editorial/${kind}-v2`;
  return <div className={`invitation-art artwork-${kind}`} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : descriptions[kind]} aria-hidden={decorative || undefined}>
    <img className="editorial-image" src={`${asset}-640.webp`} srcSet={`${asset}-400.webp 400w, ${asset}-640.webp 640w, ${asset}-1200.webp 1200w`} sizes={decorative ? cardSizes : heroSizes} width={1200} height={1200} alt="" decoding="async" fetchPriority={!decorative || kind === "wedding" ? "high" : "auto"} />
  </div>;
}
