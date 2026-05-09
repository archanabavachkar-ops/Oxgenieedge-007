/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("contacts");
  collection.indexes.push("CREATE INDEX idx_contacts_email ON contacts (email)");
  collection.indexes.push("CREATE INDEX idx_contacts_created ON contacts (created)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("contacts");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_contacts_email"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_contacts_created"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
