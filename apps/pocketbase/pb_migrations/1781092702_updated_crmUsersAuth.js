/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // add field
  collection.fields.addAt(19, new Field({
    "help": "",
    "hidden": false,
    "id": "date3612849359",
    "max": "",
    "min": "",
    "name": "dateOfBirth",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // remove field
  collection.fields.removeById("date3612849359")

  return app.save(collection)
})
