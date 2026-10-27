import { useId, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { filterResponses, responsesCsv, summarizeResponses, type GuestResponse } from "../lib/guestResponses";

// The caller supplies the authorized event's responses. This view does not fetch
// another event or grant access; the public example supplies fictional local data.
export function GuestResponsePanel({ rows, english = false, downloadName = "confirmaciones.csv", title, downloadLabel, headingLevel = 4, pageSize = 20, onAdd, onEdit, onDelete }: { rows: GuestResponse[]; english?: boolean; downloadName?: string; title?: string; downloadLabel?: string; headingLevel?: 2 | 4; pageSize?: number; onAdd?: () => void; onEdit?: (row: GuestResponse) => void; onDelete?: (row: GuestResponse) => void }) {
  const Heading = headingLevel === 2 ? "h2" : "h4";
  const id = useId();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [page, setPage] = useState(1);
  const managing = !!onAdd || !!onEdit || !!onDelete;
  const perPage = Math.max(1, Math.floor(pageSize));
  const summary = summarizeResponses(rows);
  const visible = filterResponses(rows, query, filter);
  const pages = Math.max(1, Math.ceil(visible.length / perPage));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * perPage;
  const guestCount = english ? `${visible.length} ${visible.length === 1 ? "guest" : "guests"}` : `${visible.length} ${visible.length === 1 ? "invitado" : "invitados"}`;
  const guestRange = pages > 1 ? `${start + 1}–${Math.min(start + perPage, visible.length)} ${english ? "of" : "de"} ` : "";
  const download = () => {
    const url = URL.createObjectURL(new Blob([responsesCsv(rows, english)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = downloadName; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section className="guest-response-panel" aria-labelledby={id + "-title"}>
    <div className={`guest-panel-heading${managing ? " guest-panel-heading-managed" : ""}`}><Heading id={id + "-title"}>{title ?? (english ? "Your guest panel" : "Tu panel de invitados")}</Heading><button type="button" onClick={download} disabled={!rows.length}><Download size={14} aria-hidden="true" />{downloadLabel ?? (english ? "Download all" : "Descargar todas")}</button>{onAdd && <button type="button" className="guest-panel-add" onClick={onAdd}><Plus size={16} aria-hidden="true" />{english ? "Add guest" : "Agregar invitado"}</button>}</div>
    <div className="guest-panel-stats" aria-live="polite" aria-atomic="true">
      <div><strong>{summary.yes}</strong><span>{english ? "Attending" : "Sí asistirán"}</span></div>
      <div><strong>{summary.no}</strong><span>{english ? "Not attending" : "No podrán ir"}</span></div>
      <div><strong>{summary.total}</strong><span>{managing ? (english ? "Registered guests" : "Invitados registrados") : (english ? "Replies received" : "Respuestas recibidas")}</span></div>
    </div>
    <div className="guest-panel-filters">
      <label htmlFor={id + "-search"}><span>{english ? "Search by name" : "Buscar por nombre"}</span><span className="guest-panel-search"><Search size={14} aria-hidden="true" /><input id={id + "-search"} type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder={managing ? (english ? "Find a guest" : "Encuentra un invitado") : (english ? "Find a reply" : "Encuentra una respuesta")} /></span></label>
      <label htmlFor={id + "-filter"}><span>{english ? "Attendance" : "Asistencia"}</span><select id={id + "-filter"} value={filter} onChange={event => { setFilter(event.target.value as "all" | "yes" | "no"); setPage(1); }}><option value="all">{english ? "All replies" : "Todas"}</option><option value="yes">{english ? "Attending" : "Sí asistirán"}</option><option value="no">{english ? "Not attending" : "No podrán ir"}</option></select></label>
    </div>
    <p className="guest-panel-count" role="status">{managing ? `${guestRange}${guestCount}${visible.length !== rows.length ? ` · ${rows.length} ${english ? "in total" : "en total"}` : ""}` : (english ? `${visible.length} of ${rows.length} replies` : `${visible.length} de ${rows.length} respuestas`)}</p>
    {visible.length ? <ul className="guest-panel-list" aria-label={managing ? (english ? "Guests" : "Invitados") : (english ? "Guest replies" : "Respuestas de invitados")}>
      {visible.slice(start, start + perPage).map(row => <li key={row.id} className={managing ? "guest-panel-row-managed" : undefined}><span>{row.guest_name}</span><span className="guest-panel-attendance" data-attendance={row.attendance}>{row.attendance === "yes" ? (english ? "Attending" : "Sí asistirá") : (english ? "Not attending" : "No podrá ir")}</span>{managing && <div className="guest-panel-row-actions">{onEdit && <button type="button" onClick={() => onEdit(row)} aria-label={`${english ? "Edit" : "Editar a"} ${row.guest_name}`} title={english ? "Edit guest" : "Editar invitado"}><Pencil size={15} strokeWidth={1.5} aria-hidden="true" /></button>}{onDelete && <button type="button" className="guest-panel-delete" onClick={() => onDelete(row)} aria-label={`${english ? "Delete" : "Eliminar a"} ${row.guest_name}`} title={english ? "Delete guest" : "Eliminar invitado"}><Trash2 size={15} strokeWidth={1.5} aria-hidden="true" /></button>}</div>}</li>)}
    </ul> : <p className="guest-panel-empty">{rows.length ? (managing ? (english ? "No guests match this filter" : "No hay invitados con este filtro") : (english ? "No replies match this filter." : "No hay respuestas con este filtro.")) : managing ? (english ? "Your list is ready for the first guest" : "Su lista está lista para el primer invitado") : (english ? "The first reply will appear here." : "La primera respuesta aparecerá aquí.")}</p>}
    {pages > 1 && <nav className="guest-panel-pages" aria-label={english ? "Response pages" : "Páginas de respuestas"}><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{english ? "Previous" : "Anterior"}</button><span>{currentPage} / {pages}</span><button type="button" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>{english ? "Next" : "Siguiente"}</button></nav>}
  </section>;
}
