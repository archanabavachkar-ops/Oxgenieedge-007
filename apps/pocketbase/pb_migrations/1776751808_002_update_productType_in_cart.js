/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("cart");
  const field = collection.fields.getByName("productType");
  field.values = ["service", "product", "subscription"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("cart");
  const field = collection.fields.getByName("productType");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["service", "product"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})