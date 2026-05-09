/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admin_users");
  collection.fields.removeByName("createdBy");
  return app.save(collection);
}, (app) => {
  try {

  const pbc_8007800933Collection = app.findCollectionByNameOrId("pbc_8007800933");
  const collection = app.findCollectionByNameOrId("admin_users");
  collection.fields.add(new RelationField({
    name: "createdBy",
    required: false,
    collectionId: pbc_8007800933Collection.id,
    maxSelect: 0,
    cascadeDelete: false
  }));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
