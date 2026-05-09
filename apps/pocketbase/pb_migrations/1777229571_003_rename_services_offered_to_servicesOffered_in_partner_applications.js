/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("partner_applications");
  const field = collection.fields.getByName("services_offered");
  field.name = "servicesOffered";
  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("partner_applications");
    const field = collection.fields.getByName("servicesOffered");
    if (!field) { console.log("Field not found, skipping revert"); return; }
    field.name = "services_offered";
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})