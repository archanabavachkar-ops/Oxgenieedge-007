/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2873327947",
    "help": "",
    "hidden": false,
    "id": "relation3825123606",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "deal",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // remove field
  collection.fields.removeById("relation3825123606")

  return app.save(collection)
})
