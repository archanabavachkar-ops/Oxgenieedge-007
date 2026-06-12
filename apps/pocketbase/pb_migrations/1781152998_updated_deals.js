/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_2vwmllpmlc` ON `deals` (`dealOwner`)",
      "CREATE INDEX `idx_oj3xcbxe3r` ON `deals` (`lead`)",
      "CREATE INDEX `idx_q5c0xspz9o` ON `deals` (`expectedCloseDate`)",
      "CREATE INDEX `idx_99z9q5b94f` ON `deals` (`stage`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "number3735973451",
    "max": 100,
    "min": 0,
    "name": "probability",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  // update field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "number3735973451",
    "max": null,
    "min": null,
    "name": "probability",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
