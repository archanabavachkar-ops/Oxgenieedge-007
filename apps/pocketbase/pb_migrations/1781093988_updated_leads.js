/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update field
  collection.fields.addAt(17, new Field({
    "help": "",
    "hidden": false,
    "id": "select1602912115",
    "maxSelect": 0,
    "name": "source",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Website",
      "Google Ads",
      "Facebook Ads",
      "LinkedIn",
      "WhatsApp",
      "Phone Call",
      "Email",
      "Referral",
      "Trade Show",
      "Walk-in",
      "Existing Customer",
      "Other"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update field
  collection.fields.addAt(17, new Field({
    "help": "",
    "hidden": false,
    "id": "select1602912115",
    "maxSelect": 0,
    "name": "source",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Website",
      "Phone Call",
      "Email",
      "Referral",
      "Social Media",
      "Trade Show",
      "Other",
      "home"
    ]
  }))

  return app.save(collection)
})
