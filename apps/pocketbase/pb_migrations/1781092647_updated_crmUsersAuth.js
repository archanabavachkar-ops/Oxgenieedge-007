/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update field
  collection.fields.addAt(18, new Field({
    "help": "",
    "hidden": false,
    "id": "select2463739863",
    "maxSelect": 0,
    "name": "employmentStatus",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Active",
      "Probation",
      "Resigned",
      "Terminated",
      "On Leave"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update field
  collection.fields.addAt(18, new Field({
    "help": "",
    "hidden": false,
    "id": "select2463739863",
    "maxSelect": 0,
    "name": "employmentStatus",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Active",
      "Probation",
      "Resigned",
      "Terminated",
      "On Leave"
    ]
  }))

  return app.save(collection)
})
