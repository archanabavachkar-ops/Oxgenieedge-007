/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads");
  collection.indexes.push("CREATE INDEX idx_leads_email ON leads (email)");
  collection.indexes.push("CREATE INDEX idx_leads_mobile ON leads (mobile)");
  collection.indexes.push("CREATE INDEX idx_leads_status ON leads (status)");
  collection.indexes.push("CREATE INDEX idx_leads_assignedTo ON leads (assignedTo)");
  collection.indexes.push("CREATE INDEX idx_leads_created ON leads (created)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("leads");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_leads_email"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_leads_mobile"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_leads_status"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_leads_assignedTo"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_leads_created"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
