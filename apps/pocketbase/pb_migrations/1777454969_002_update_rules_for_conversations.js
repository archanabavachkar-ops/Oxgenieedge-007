/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("conversations");
  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'manager' || assigned_agent_id = @request.auth.id";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("conversations");
  collection.listRule = "@request.auth.id != \"\" && (customer_id.id = @request.auth.id || assigned_agent_id = @request.auth.id || @request.auth.role = \"admin\")";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})