/// <reference path="../pb_data/types.d.ts" />
// CORS and auth handler hook
onRecordCreate((e) => {
  e.next();
}, "users");