import { useEffect, useState } from "react";
import { decodeInvitations, encodeInvitations, removeWeddingInvitation, saveWeddingInvitation, setWeddingAttendance, weddingInvitationKey, weddingInvitationSamples, type WeddingAttendance, type WeddingInvitation } from "./weddingInvitations";

// Public sample data stays in this tab for two hours; it never reaches an event API.
function readPreview(): WeddingInvitation[] {
  try {
    const current = sessionStorage.getItem(weddingInvitationKey) ?? sessionStorage.getItem("nordra-wedding-preview-v2") ?? sessionStorage.getItem("nordra-wedding-preview-v1");
    return decodeInvitations(current) ?? weddingInvitationSamples;
  } catch { return weddingInvitationSamples; }
}

export function useWeddingPreview() {
  const [invitations, setInvitations] = useState(readPreview);
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    const restore = () => setInvitations(readPreview());
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);
  function commit(next: WeddingInvitation[]) {
    try { sessionStorage.setItem(weddingInvitationKey, encodeInvitations(next)); }
    catch { throw new Error("preview_unavailable"); }
    setInvitations(next);
  }
  function saveInvitation(invitation: WeddingInvitation, mode: "add" | "edit") {
    commit(saveWeddingInvitation(invitations, { ...invitation, updated_at: new Date().toISOString() }, mode));
  }
  function deleteInvitation(id: string) { commit(removeWeddingInvitation(invitations, id)); }
  function setAttendance(invitationId: string, personId: string, attendance: WeddingAttendance) { commit(setWeddingAttendance(invitations, invitationId, personId, attendance)); }
  function recordReply(name: string, attendance: "yes" | "no") {
    const id = "wedding-preview-reply";
    const existing = invitations.find(invitation => invitation.id === id);
    const people = existing ? existing.people.map((person, index) => index === 0 ? { ...person, name, attendance } : person) : [{ id: "wedding-preview-reply-person", name, attendance }];
    commit(saveWeddingInvitation(invitations, { id, kind: existing?.kind ?? "individual", people, updated_at: new Date().toISOString() }, existing ? "edit" : "add"));
  }
  function reset() {
    commit(weddingInvitationSamples);
    setResetKey(value => value + 1);
  }
  return { invitations, recordReply, saveInvitation, deleteInvitation, setAttendance, reset, resetKey };
}
