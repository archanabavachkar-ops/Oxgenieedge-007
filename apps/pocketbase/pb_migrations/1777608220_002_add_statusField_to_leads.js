/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads");

  const existing = collection.fields.getByName("statusField");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("statusField"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "statusField",
    required: false,
    values: ["New Lead", "Attempted Contact", "Connected", "Qualified", "Follow-up Scheduled", "Proposal Sent", "Negotiation", "Won", "Lost"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("leads");
    collection.fields.removeByName("statusField");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})