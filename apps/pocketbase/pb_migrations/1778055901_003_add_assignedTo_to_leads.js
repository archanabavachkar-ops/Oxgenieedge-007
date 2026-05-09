/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("users");
  const collection = app.findCollectionByNameOrId("leads");

  const existing = collection.fields.getByName("assignedTo");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    // Field exists with wrong type - need to update rules first before removing
    collection.listRule = "@request.auth.id != ''";
    collection.viewRule = "@request.auth.id != ''";
    collection.updateRule = "@request.auth.id != ''";
    app.save(collection);
    
    collection.fields.removeByName("assignedTo");
  }

  collection.fields.add(new RelationField({
    name: "assignedTo",
    required: false,
    collectionId: usersCollection.id
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("leads");
    
    // Update rules to remove references to assignedTo field BEFORE removing the field
    collection.listRule = "@request.auth.id != ''";
    collection.viewRule = "@request.auth.id != ''";
    collection.updateRule = "@request.auth.id != ''";
    app.save(collection);
    
    // Now safe to remove the field
    collection.fields.removeByName("assignedTo");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
