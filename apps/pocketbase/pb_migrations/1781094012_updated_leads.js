/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update field
  collection.fields.addAt(12, new Field({
    "help": "",
    "hidden": false,
    "id": "select1655102503",
    "maxSelect": 0,
    "name": "priority",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Hot",
      "Warm",
      "Cold"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update field
  collection.fields.addAt(12, new Field({
    "help": "",
    "hidden": false,
    "id": "select1655102503",
    "maxSelect": 0,
    "name": "priority",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Hot",
      "Medium",
      "Cold"
    ]
  }))

  return app.save(collection)
})
