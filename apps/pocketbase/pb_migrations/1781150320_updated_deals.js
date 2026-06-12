/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // add field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "number938369668",
    "max": null,
    "min": null,
    "name": "dealValue",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "select5035740995",
    "maxSelect": 0,
    "name": "stage",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Qualification",
      "Needs Analysis",
      "Proposal Sent",
      "Negotiation",
      "Verbal Commitment",
      "Won",
      "Lost"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // remove field
  collection.fields.removeById("number938369668")

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "select5035740995",
    "maxSelect": 1,
    "name": "stage",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "New",
      "Contacted",
      "Qualified",
      "Proposal",
      "Won"
    ]
  }))

  return app.save(collection)
})
