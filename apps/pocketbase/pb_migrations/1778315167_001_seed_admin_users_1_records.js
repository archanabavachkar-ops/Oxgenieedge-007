/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admin_users");

  const record0 = new Record(collection);
    record0.set("email", "admin@oxgenieedge.com");
    record0.setPassword("admin@2026");
    record0.set("fullName", "Admin");
    record0.set("role", "Admin");
    record0.set("status", "Active");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
