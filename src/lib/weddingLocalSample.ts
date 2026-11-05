import { emptyManagement } from './weddingManagement';
import { sampleOccasions } from '../../server/sample-occasions.js';
import { weddingInvitationSamples, type WeddingInvitation, type WeddingInvitationKind, type WeddingAttendance } from './weddingInvitations';
import { emptyBoreal, type BorealState } from './weddingBoreal';

// Fictional records only: no personal links, QR capabilities or server writes.
export function weddingLocalSample(occasion: string) {
  const seed=sampleOccasions[occasion] ?? sampleOccasions.wedding;
  const invitations: WeddingInvitation[]=seed.guests ? seed.guests.map(([kind,name,attendance,companion,reply],index)=>({
    id:`local-${index}`,kind:kind as WeddingInvitationKind,updated_at:'2026-10-25T18:00:00Z',
    people:[{id:`local-${index}-0`,name,attendance:attendance as WeddingAttendance},...(kind==='individual'?[]:[{id:`local-${index}-1`,name:companion ?? '',attendance:(reply ?? 'pending') as WeddingAttendance}])],
  })) : structuredClone(weddingInvitationSamples);
  const boreal:BorealState={...structuredClone(emptyBoreal),tables:(seed.tables ?? ['Jazmín','Olivo','Azahar']).map((name,index)=>({id:`local-table-${index}`,name,capacity:index===2?6:8}))};
  if(occasion==='wedding'){
    for(const invitation of invitations){
      const people=invitation.people.filter(p=>p.attendance!=='no');
      if(Object.keys(boreal.seats).length+people.length>12)break;
      const table=boreal.tables.find(t=>t.capacity-Object.values(boreal.seats).filter(id=>id===t.id).length>=people.length);
      if(table)for(const person of people)boreal.seats[person.id]=table.id;
    }
  }else boreal.seats[invitations[1].people[0].id]=boreal.tables[0].id;
  const management=structuredClone(emptyManagement);
  if(occasion!=='wedding')for(const invitation of invitations.slice(0,5))management.delivery[invitation.id]={sentAt:invitation.updated_at,updatedAt:invitation.updated_at};
  return {invitations,boreal,management};
}
