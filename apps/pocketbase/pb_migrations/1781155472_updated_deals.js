/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_2vwmllpmlc` ON `deals` (`dealOwner`)",
      "CREATE INDEX `idx_oj3xcbxe3r` ON `deals` (`lead`)",
      "CREATE INDEX `idx_q5c0xspz9o` ON `deals` (`expectedCloseDate`)",
      "CREATE INDEX `idx_99z9q5b94f` ON `deals` (`stage`)",
      "CREATE INDEX `idx_4aioyk1913` ON `deals` (`created`)",
      "CREATE INDEX `idx_fi0t1mac8n` ON `deals` (`actualCloseDate`)",
      "CREATE INDEX `idx_7olrp8ubi8` ON `deals` (`manager`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(14, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation4196672953",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "manager",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_2vwmllpmlc` ON `deals` (`dealOwner`)",
      "CREATE INDEX `idx_oj3xcbxe3r` ON `deals` (`lead`)",
      "CREATE INDEX `idx_q5c0xspz9o` ON `deals` (`expectedCloseDate`)",
      "CREATE INDEX `idx_99z9q5b94f` ON `deals` (`stage`)",
      "CREATE INDEX `idx_4aioyk1913` ON `deals` (`created`)",
      "CREATE INDEX `idx_fi0t1mac8n` ON `deals` (`actualCloseDate`)"
    ]
  }, collection)

  // update field
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
})
