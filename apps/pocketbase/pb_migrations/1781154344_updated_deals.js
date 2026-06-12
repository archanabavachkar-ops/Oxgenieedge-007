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
      "CREATE INDEX `idx_fi0t1mac8n` ON `deals` (`actualCloseDate`)"
    ],
    "listRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ndealOwner.reportsTo = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ndealOwner.reportsTo = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ndealOwner.reportsTo = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_2vwmllpmlc` ON `deals` (`dealOwner`)",
      "CREATE INDEX `idx_oj3xcbxe3r` ON `deals` (`lead`)",
      "CREATE INDEX `idx_q5c0xspz9o` ON `deals` (`expectedCloseDate`)",
      "CREATE INDEX `idx_99z9q5b94f` ON `deals` (`stage`)"
    ],
    "listRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ncreatedBy = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ncreatedBy = @request.auth.id"
  }, collection)

  return app.save(collection)
})
