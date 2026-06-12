/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_6783323688")

  // add field
  collection.fields.addAt(14, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_8142119754",
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_6783323688")

  // remove field
  collection.fields.removeById("relation1421768800")

  return app.save(collection)
})
