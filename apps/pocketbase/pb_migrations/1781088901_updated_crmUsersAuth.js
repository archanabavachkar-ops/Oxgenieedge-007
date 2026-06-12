/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // remove field
  collection.fields.removeById("relation1421768800")

  // add field
  collection.fields.addAt(18, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation2277476978",
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

  // add field
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

  // remove field
  collection.fields.removeById("relation2277476978")

  return app.save(collection)
})
