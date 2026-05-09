/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const leadsCollection = app.findCollectionByNameOrId("leads");
  const collection = app.findCollectionByNameOrId("lead_assignments");

  const existing = collection.fields.getByName("lead");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("lead"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "lead",
    required: true,
    collectionId: leadsCollection.id
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("lead_assignments");
    collection.fields.removeByName("lead");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
