/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "select5035740995",
    "maxSelect": 0,
    "name": "stage",
    "presentable": false,
    "required": true,
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

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "number4598199065",
    "max": null,
    "min": null,
    "name": "value",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(13, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_9397138959",
    "help": "",
    "hidden": false,
    "id": "relation680616395",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "lead",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "number938369668",
    "max": null,
    "min": null,
    "name": "dealValue",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

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

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "number4598199065",
    "max": null,
    "min": null,
    "name": "value",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(13, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_9397138959",
    "help": "",
    "hidden": false,
    "id": "relation680616395",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "lead",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
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

  return app.save(collection)
})
