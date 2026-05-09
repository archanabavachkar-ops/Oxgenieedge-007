/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads");
  const field = collection.fields.getByName("callOutcome");
  field.values = ["Connected", "Not Reachable", "Interested", "Not Interested", "Callback Scheduled"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("leads");
  const field = collection.fields.getByName("callOutcome");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["Connected", "Not Reachable", "Interested", "Not Interested", "Callback Scheduled"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})