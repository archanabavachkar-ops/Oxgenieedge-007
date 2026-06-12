/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update field
  collection.fields.addAt(15, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_6783323688",
    "help": "",
    "hidden": false,
    "id": "relation1421768800",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "reportsTo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update field
  collection.fields.addAt(15, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_6783323688",
    "help": "",
    "hidden": false,
    "id": "relation1421768800",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "managerId",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
