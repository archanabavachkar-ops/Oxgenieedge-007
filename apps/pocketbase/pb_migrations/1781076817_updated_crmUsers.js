/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_6783323688")

  // remove field
  collection.fields.removeById("text1451455481")

  // add field
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
      "Sales, Marketing, Support, Operations, Accounts, Management"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_6783323688")

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text1451455481",
    "max": 0,
    "min": 0,
    "name": "department",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("select3441287562")

  return app.save(collection)
})
