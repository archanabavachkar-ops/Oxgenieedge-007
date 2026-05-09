/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("partner_applications");
  const field = collection.fields.getByName("why_partner");
  field.name = "whyPartner";
  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("partner_applications");
    const field = collection.fields.getByName("whyPartner");
    if (!field) { console.log("Field not found, skipping revert"); return; }
    field.name = "why_partner";
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})