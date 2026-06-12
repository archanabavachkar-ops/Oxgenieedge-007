/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_8617894975")

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_6783323688",
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_8617894975")

  // remove field
  collection.fields.removeById("relation1535054327")

  return app.save(collection)
})
