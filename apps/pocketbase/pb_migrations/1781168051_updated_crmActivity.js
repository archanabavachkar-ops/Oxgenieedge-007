/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // add field
  collection.fields.addAt(10, new Field({
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
      "High",
      "Medium",
      "Low"
    ]
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 0,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Pending",
      "Completed",
      "Cancelled",
      "Overdue"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // remove field
  collection.fields.removeById("select1655102503")

  // update field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 0,
    "name": "status",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Pending",
      "Completed",
      "Cancelled",
      "Overdue"
    ]
  }))

  return app.save(collection)
})
