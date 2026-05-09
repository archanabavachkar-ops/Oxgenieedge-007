/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("agent_tasks");
  collection.listRule = "user_id = @request.auth.id || @request.auth.role = 'admin'";
  collection.viewRule = "user_id = @request.auth.id || @request.auth.role = 'admin'";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "user_id = @request.auth.id || @request.auth.role = 'admin'";
  collection.deleteRule = "user_id = @request.auth.id || @request.auth.role = 'admin'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("agent_tasks");
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