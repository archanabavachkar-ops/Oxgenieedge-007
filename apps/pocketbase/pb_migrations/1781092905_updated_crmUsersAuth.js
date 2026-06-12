/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "select3441287562",
    "maxSelect": 0,
    "name": "department",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Sales",
      "Marketing",
      "Support",
      "Operations",
      "Accounts",
      "HR"
    ]
  }))

  // update field
  collection.fields.addAt(15, new Field({
    "help": "",
    "hidden": false,
    "id": "select3303056927",
    "maxSelect": 0,
    "name": "team",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Inside Sales",
      "Field Sales",
      "Enterprise Sales",
      "Channel Partners"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "select3441287562",
    "maxSelect": 0,
    "name": "department",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Sales",
      "Marketing",
      "Support",
      "Operations",
      "Accounts",
      "HR"
    ]
  }))

  // update field
  collection.fields.addAt(15, new Field({
    "help": "",
    "hidden": false,
    "id": "select3303056927",
    "maxSelect": 0,
    "name": "team",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Inside Sales",
      "Field Sales",
      "Enterprise Sales",
      "Channel Partners"
    ]
  }))

  return app.save(collection)
})
