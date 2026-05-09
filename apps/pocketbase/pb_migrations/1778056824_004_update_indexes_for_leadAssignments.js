/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leadAssignments");
  collection.indexes.push("CREATE INDEX idx_leadAssignments_lead ON leadAssignments (lead)");
  collection.indexes.push("CREATE INDEX idx_leadAssignments_assignedTo ON leadAssignments (assignedTo)");
  collection.indexes.push("CREATE INDEX idx_leadAssignments_status ON leadAssignments (status)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("leadAssignments");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_leadAssignments_lead"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_leadAssignments_assignedTo"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_leadAssignments_status"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
