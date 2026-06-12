/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // remove field
  collection.fields.removeById("select4279744467")

  // remove field
  collection.fields.removeById("select3262944105")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // add field
  collection.fields.addAt(11, new Field({
    "help": "",
    "hidden": false,
    "id": "select4279744467",
    "maxSelect": 0,
    "name": "statusField",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "New Lead",
      "Attempted Contact",
      "Connected",
      "Qualified",
      "Follow-up Scheduled",
      "Proposal Sent",
      "Negotiation",
      "Won",
      "Lost"
    ]
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "help": "",
    "hidden": false,
    "id": "select3262944105",
    "maxSelect": 0,
    "name": "stage",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "New Lead",
      "Attempted Contact",
      "Connected",
      "Qualified",
      "Follow-up Scheduled",
      "Proposal Sent",
      "Negotiation",
      "Won",
      "Lost"
    ]
  }))

  return app.save(collection)
})
