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
      "CREATE UNIQUE INDEX `idx_mx1l7iqu2f` ON `leads` (`leadOwner`)"
    ],
    "listRule": "@request.auth.role = \"Admin\"\n||\nleadOwner = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\"\n||\nleadOwner = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\"\n||\nleadOwner = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX idx_leads_email ON leads (email)",
      "CREATE INDEX idx_leads_mobile ON leads (mobile)",
      "CREATE INDEX idx_leads_status ON leads (status)",
      "CREATE INDEX idx_leads_assignedTo ON leads (assignedTo)",
      "CREATE INDEX idx_leads_created ON leads (created)"
    ],
    "listRule": "@request.auth.role = \"Admin\"\n||\nassignedTo = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\"\n||\nassignedTo = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\"\n||\nassignedTo = @request.auth.id"
  }, collection)

  return app.save(collection)
})
