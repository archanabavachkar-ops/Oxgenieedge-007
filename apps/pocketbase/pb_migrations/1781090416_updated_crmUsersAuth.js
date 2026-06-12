/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // add field
  collection.fields.addAt(19, new Field({
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // remove field
  collection.fields.removeById("select3303056927")

  return app.save(collection)
})
