/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("leads");

  const existing = collection.fields.getByName("callOutcome");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("callOutcome"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "callOutcome",
    required: false,
    values: ["Connected", "Not Reachable", "Interested", "Not Interested", "Callback Scheduled"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("leads");
    collection.fields.removeByName("callOutcome");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})