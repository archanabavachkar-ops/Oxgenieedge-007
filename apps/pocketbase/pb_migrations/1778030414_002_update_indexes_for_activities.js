/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("activities");
  collection.indexes.push("CREATE INDEX idx_activities_leadId ON activities (lead_id)");
  collection.indexes.push("CREATE INDEX idx_activities_created ON activities (created)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("activities");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_activities_leadId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_activities_created"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
