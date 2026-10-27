export type WeddingEvent = { id:string; couple:string; eventDate:string; city:string; plan:string; invitationPath:string; coverPath:string; replyUntil:string|null; expiresAt:string; archived:boolean; version:number; invitationsCount?:number; peopleCount?:number };
export const weddingMessages: Record<string,string> = {
  invalid_import:'Revisa el archivo y selecciona las invitaciones que deseas importar', guest_limit:'La boda admite hasta 300 personas, incluyendo acompañantes', trash_limit:'La lista de recuperación está llena. Contacta a Nordra antes de eliminar más invitaciones', no_pending_replies:'Esta invitación ya tiene todas sus respuestas',
  boreal_required:'Esta función está incluida en Boreal', invalid_table:'Escribe un nombre de 2 a 50 caracteres y entre 1 y 30 lugares', duplicate_table:'Ya existe una mesa con ese nombre', table_full:'La mesa no tiene suficientes lugares. Revisa su capacidad', table_missing:'Esta mesa ya no está disponible. Actualiza la vista', table_limit:'Puedes organizar hasta 50 mesas',
  invalid_pass:'No pudimos validar este pase. Revisa el QR o busca al invitado por nombre', wrong_wedding:'Este pase pertenece a otra boda', not_confirmed:'Solo pueden ingresar personas con asistencia confirmada', reception_expired:'El acceso de recepción venció o fue desactivado. Solicita un enlace nuevo a los organizadores', arrival_locked:'Esta persona ya registró su entrada. Corrige primero la llegada en Recepción antes de cambiar sus datos',
  signed_out:'Tu sesión terminó. Vuelve a iniciar sesión', invalid_access:'El acceso no es válido o ha vencido. Revisa tus datos o solicita un nuevo enlace a Nordra',
  invalid_password:'Usa una contraseña de al menos 12 caracteres', invalid_email:'Revisa el correo del cliente', invalid_event:'Revisa los nombres y la fecha de la boda', invalid_deadline:'El cierre de confirmaciones debe ser el día de la boda o antes',
  invalid_path:'Usa una ruta de Nordra, por ejemplo /invitaciones/su-boda/', event_missing:'No encontramos una boda disponible para esta cuenta', event_archived:'Esta boda terminó su periodo de disponibilidad',
  response_changed:'Hubo un cambio reciente. Actualiza la vista antes de guardar', limited:'Hay varios intentos recientes. Espera un momento y vuelve a intentarlo',
  account_unavailable:'No pudimos generar el acceso. Revisa el correo e intenta nuevamente', admin_email:'Utiliza el correo del cliente; tu cuenta de administración conserva su acceso independiente',
  link_unavailable:'Este enlace ya no está disponible. Solicita uno nuevo a quien te invitó', replies_closed:'Las confirmaciones de esta boda ya están cerradas',
  companion_name_required:'Escribe el nombre del acompañante para confirmar su asistencia', duplicate_name:'Ese nombre ya está registrado. Agrega los apellidos completos', reply_required:'Indica la respuesta de al menos una persona',
};
export const weddingError = (error:unknown) => weddingMessages[(error as Error)?.message] || 'No pudimos completar la solicitud. Revisa tu conexión e intenta nuevamente';
export async function weddingApi<T=Record<string,unknown>>(body:Record<string,unknown>):Promise<T> {
  const response=await fetch('/api/weddings',{method:'POST',credentials:body.action==='guest-load' || body.action==='guest-reply'?'omit':'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  const data=await response.json(); if(!response.ok)throw new Error(data.code || 'unavailable'); return data;
}
export const weddingDate = (date:string) => new Intl.DateTimeFormat('es-MX',{dateStyle:'long',timeZone:'America/Mexico_City'}).format(new Date(date.length===10?date+'T12:00:00-06:00':date));
export const lastWeddingDay = (expires:string) => weddingDate(new Date(Date.parse(expires)-1).toISOString());
