/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("auditLogs");
  collection.indexes.push("CREATE INDEX idx_auditLogs_userId ON auditLogs (userId)");
  collection.indexes.push("CREATE INDEX idx_auditLogs_timestamp ON auditLogs (timestamp)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("auditLogs");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_auditLogs_userId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_auditLogs_timestamp"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
