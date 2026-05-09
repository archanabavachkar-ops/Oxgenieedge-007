/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads");

  const record0 = new Record(collection);
    record0.set("name", "Test Lead");
    record0.set("email", "test@example.com");
    record0.set("mobile", "1234567890");
    record0.set("source", "website");
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