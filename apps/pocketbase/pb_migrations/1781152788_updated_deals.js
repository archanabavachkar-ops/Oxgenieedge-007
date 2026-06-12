/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // remove field
  collection.fields.removeById("autodate1003199676")

  // remove field
  collection.fields.removeById("autodate0261010299")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "autodate1003199676",
    "name": "created_at",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "autodate0261010299",
    "name": "updated_at",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
})
