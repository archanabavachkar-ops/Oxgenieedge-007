/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admin_users");
  collection.fields.removeByName("permissions");
  return app.save(collection);
}, (app) => {
  try {

  const collection = app.findCollectionByNameOrId("admin_users");
  collection.fields.add(new JSONField({
    name: "permissions",
    required: false
  }));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
