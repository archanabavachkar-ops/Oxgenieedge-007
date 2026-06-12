/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // update field
  collection.fields.addAt(1, new Field({
    "help": "",
    "hidden": false,
    "id": "select4289517208",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Call",
      "Meeting",
      "Email",
      "WhatsApp",
      "Task",
      "Site Visit",
      "Proposal Follow-up",
      "Demo",
      "Status Change",
      "Note",
      "System"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // update field
  collection.fields.addAt(1, new Field({
    "help": "",
    "hidden": false,
    "id": "select4289517208",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "form_submission",
      "chatbot_chat",
      "status_change",
      "note_added",
      "email_sent",
      "follow_up_scheduled"
    ]
  }))

  return app.save(collection)
})
