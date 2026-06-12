/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update field
  collection.fields.addAt(12, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation3545646658",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "createdBy",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update field
  collection.fields.addAt(12, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation3545646658",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "createdBy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
