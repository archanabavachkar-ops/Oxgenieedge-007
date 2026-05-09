/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("crm_users");
  collection.indexes.push("CREATE UNIQUE INDEX idx_crm_users_userId ON crm_users (userId)");
  collection.indexes.push("CREATE UNIQUE INDEX idx_crm_users_email ON crm_users (email)");
  collection.indexes.push("CREATE UNIQUE INDEX idx_crm_users_loginUsername ON crm_users (loginUsername)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("crm_users");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_crm_users_userId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_crm_users_email"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_crm_users_loginUsername"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})