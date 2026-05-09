/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads");
  collection.listRule = "@request.auth.id != '' && (assignedTo = @request.auth.id || @request.auth.role = 'admin')";
  collection.viewRule = "@request.auth.id != '' && (assignedTo = @request.auth.id || @request.auth.role = 'admin')";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("leads");
  collection.listRule = "assignedTo = @request.auth.id || @request.auth.role = 'admin'";
  collection.viewRule = "assignedTo = @request.auth.id || @request.auth.role = 'admin'";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})