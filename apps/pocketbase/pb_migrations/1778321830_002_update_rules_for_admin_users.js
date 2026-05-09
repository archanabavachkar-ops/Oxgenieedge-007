/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admin_users");
  collection.listRule = "";
  collection.viewRule = "";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "@request.auth.id != \"\"";
  collection.deleteRule = "@request.auth.id != \"\"";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("admin_users");
  collection.listRule = "id = @request.auth.id || @request.auth.role = 'CEO' || @request.auth.role = 'Admin'";
  collection.viewRule = "id = @request.auth.id || @request.auth.role = 'CEO' || @request.auth.role = 'Admin'";
  collection.createRule = "@request.auth.id = null || @request.auth.role = \"CEO\" || @request.auth.role = \"Admin\"";
  collection.updateRule = "id = @request.auth.id || @request.auth.role = 'CEO' || @request.auth.role = 'Admin'";
  collection.deleteRule = "@request.auth.role = 'CEO'";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
