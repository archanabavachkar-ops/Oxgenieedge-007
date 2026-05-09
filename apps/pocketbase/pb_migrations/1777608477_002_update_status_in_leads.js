/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads");
  const field = collection.fields.getByName("status");
  field.values = ["New Lead", "Attempted Contact", "Connected", "Qualified", "Follow-up Scheduled", "Proposal Sent", "Negotiation", "Won", "Lost"];
  field.required = true;
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("leads");
  const field = collection.fields.getByName("status");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["New Order", "Contacted", "Qualified", "Converted", "Lost"];
  field.required = false;
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})