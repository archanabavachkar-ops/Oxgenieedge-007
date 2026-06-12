/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // add field
  collection.fields.addAt(25, new Field({
    "help": "",
    "hidden": false,
    "id": "select480611375",
    "maxSelect": 0,
    "name": "lostReason",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Price",
      "Competitor",
      "No Response",
      "Budget Issue",
      "No Requirement",
      "Wrong Lead",
      "Other"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // remove field
  collection.fields.removeById("select480611375")

  return app.save(collection)
})
