// Aurora and Boreal have no guest limit. These ceilings only protect the service
// from oversized or abusive requests; keep src/lib/weddingCapacity.ts in sync.
export const maxEventPeople = 5000;
export const maxImportRows = 1000;
export const maxImportBytes = 1048576;
export const maxTrash = 1000;
// 250 tables of up to 30 places seat the whole technical ceiling.
export const maxTables = 250;
