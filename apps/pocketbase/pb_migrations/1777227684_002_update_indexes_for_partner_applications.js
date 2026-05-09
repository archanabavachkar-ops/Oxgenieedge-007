/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("partner_applications");
  collection.indexes.push("CREATE UNIQUE INDEX idx_partner_applications_application_id ON partner_applications (application_id)");
  collection.indexes.push("CREATE UNIQUE INDEX idx_partner_applications_email ON partner_applications (email)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("partner_applications");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_partner_applications_application_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_partner_applications_email"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})