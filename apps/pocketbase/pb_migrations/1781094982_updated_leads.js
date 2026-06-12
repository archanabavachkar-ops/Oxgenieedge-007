/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX idx_leads_email ON leads (email)",
      "CREATE INDEX idx_leads_mobile ON leads (mobile)",
      "CREATE INDEX idx_leads_status ON leads (status)",
      "CREATE INDEX idx_leads_created ON leads (created)",
      "CREATE INDEX idx_leads_leadOwner\nON leads (leadOwner)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(25, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation2993880249",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "leadOwner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX idx_leads_email ON leads (email)",
      "CREATE INDEX idx_leads_mobile ON leads (mobile)",
      "CREATE INDEX idx_leads_status ON leads (status)",
      "CREATE INDEX idx_leads_created ON leads (created)",
      "CREATE UNIQUE INDEX `idx_mx1l7iqu2f` ON `leads` (`leadOwner`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(25, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation2993880249",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "leadOwner",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
