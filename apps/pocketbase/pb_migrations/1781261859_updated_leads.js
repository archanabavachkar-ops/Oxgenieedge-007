/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update field
  collection.fields.addAt(25, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation2993880249",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "leadOwner",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update field
  collection.fields.addAt(25, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation2993880249",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "leadOwner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
