/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // update field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation1535054327",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "assignedTo",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // update field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation1535054327",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "assignedTo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
