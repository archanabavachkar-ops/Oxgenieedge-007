/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update field
  collection.fields.addAt(17, new Field({
    "help": "",
    "hidden": false,
    "id": "json3762918058",
    "maxSize": 0,
    "name": "permissions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update field
  collection.fields.addAt(17, new Field({
    "help": "",
    "hidden": false,
    "id": "json3762918058",
    "maxSize": 0,
    "name": "permission",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
