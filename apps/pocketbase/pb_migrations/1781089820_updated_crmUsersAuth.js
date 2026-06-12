/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // remove field
  collection.fields.removeById("bool2323052248")

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // add field
  collection.fields.addAt(15, new Field({
    "help": "",
    "hidden": false,
    "id": "bool2323052248",
    "name": "isActive",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "bool"
  }))

  // remove field
  collection.fields.removeById("select2463739863")

  return app.save(collection)
})
