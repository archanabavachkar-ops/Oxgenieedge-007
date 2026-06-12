/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_l2y21oqln4` ON `crmUsersAuth` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_l2y21oqln4` ON `crmUsersAuth` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX `idx_wod9mijj60` ON `crmUsersAuth` (`employeeCode`)",
      "CREATE UNIQUE INDEX `idx_ctpo6u5m3c` ON `crmUsersAuth` (`mobile`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey_l2y21oqln4` ON `crmUsersAuth` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email_l2y21oqln4` ON `crmUsersAuth` (`email`) WHERE `email` != ''"
    ]
  }, collection)

  return app.save(collection)
})
