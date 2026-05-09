/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admin_users");
  const field = collection.fields.getByName("role");
  field.type = "text";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("admin_users");
  const field = collection.fields.getByName("role");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.type = "select";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})
