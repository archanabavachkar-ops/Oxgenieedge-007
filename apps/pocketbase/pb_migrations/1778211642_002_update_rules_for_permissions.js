/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("permissions");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id != \"\"";
  collection.createRule = "@request.auth.role = \"CEO\" || @request.auth.role = \"Admin\"";
  collection.updateRule = "@request.auth.role = \"CEO\" || @request.auth.role = \"Admin\"";
  collection.deleteRule = "@request.auth.role = \"CEO\"";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("permissions");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id != \"\"";
  collection.createRule = "@request.auth.role = \"Super Admin\"";
  collection.updateRule = "@request.auth.role = \"Super Admin\"";
  collection.deleteRule = "@request.auth.role = \"Super Admin\"";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
