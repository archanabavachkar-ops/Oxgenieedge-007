/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("activityLogs");
  collection.indexes.push("CREATE INDEX idx_activityLogs_userId ON activityLogs (userId)");
  collection.indexes.push("CREATE INDEX idx_activityLogs_timestamp ON activityLogs (timestamp)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("activityLogs");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_activityLogs_userId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_activityLogs_timestamp"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
