/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // add field
  collection.fields.addAt(14, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation4196672953",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "manager",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // remove field
  collection.fields.removeById("relation4196672953")

  return app.save(collection)
})
