/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_1ipjz56eht` ON `crmActivity` (`assignedTo`)",
      "CREATE INDEX `idx_lztz4exins` ON `crmActivity` (`manager`)",
      "CREATE INDEX `idx_kdu8zc7099` ON `crmActivity` (`status`)",
      "CREATE INDEX `idx_cgxewfmkpc` ON `crmActivity` (`dueDate`)",
      "CREATE INDEX `idx_3p51gapxrl` ON `crmActivity` (`lead`)",
      "CREATE INDEX `idx_srk83fgki8` ON `crmActivity` (`deal`)",
      "CREATE INDEX `idx_mwz6okc33z` ON `crmActivity` (`created`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_1ipjz56eht` ON `crmActivity` (`assignedTo`)",
      "CREATE INDEX `idx_lztz4exins` ON `crmActivity` (`manager`)",
      "CREATE INDEX `idx_kdu8zc7099` ON `crmActivity` (`status`)",
      "CREATE INDEX `idx_cgxewfmkpc` ON `crmActivity` (`dueDate`)",
      "CREATE INDEX `idx_3p51gapxrl` ON `crmActivity` (`lead`)",
      "CREATE INDEX `idx_srk83fgki8` ON `crmActivity` (`deal`)"
    ]
  }, collection)

  return app.save(collection)
})
