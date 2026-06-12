/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // add field
  collection.fields.addAt(22, new Field({
    "help": "",
    "hidden": false,
    "id": "number3310006673",
    "max": null,
    "min": null,
    "name": "estimatedValue",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(23, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3079228586",
    "max": 0,
    "min": 0,
    "name": "companyName",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(24, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text760939060",
    "max": 0,
    "min": 0,
    "name": "city",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // remove field
  collection.fields.removeById("number3310006673")

  // remove field
  collection.fields.removeById("text3079228586")

  // remove field
  collection.fields.removeById("text760939060")

  return app.save(collection)
})
