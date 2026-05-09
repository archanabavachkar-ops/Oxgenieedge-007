/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads");
  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'manager'";
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'manager'";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'manager'";
  collection.deleteRule = "@request.auth.role = 'admin'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("leads");
  collection.listRule = null;
  collection.viewRule = null;
  collection.createRule = null;
  collection.updateRule = null;
  collection.deleteRule = null;
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})