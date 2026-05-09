/// <reference path="../pb_data/types.d.ts" />
// Handle CORS headers for auth requests
onRecordAuthWithPasswordRequest((e) => {
  // Set CORS headers for the preview URL
  e.requestInfo.response.header().set("Access-Control-Allow-Origin", "https://c71b66b6-c637-4126-9ae4-6ed5ac94d4e5.app-preview.com");
  e.requestInfo.response.header().set("Access-Control-Allow-Methods", "POST, OPTIONS");
  e.requestInfo.response.header().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  e.requestInfo.response.header().set("Access-Control-Allow-Credentials", "true");
  
  e.next();
}, "users");