/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admin_users");
  collection.indexes.push("CREATE UNIQUE INDEX idx_admin_users_email ON admin_users (email)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("admin_users");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_admin_users_email"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
