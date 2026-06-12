/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id",
    "deleteRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id",
    "listRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "owner = @request.auth.id || @request.auth.role = \"admin\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "owner = @request.auth.id || @request.auth.role = \"admin\"",
    "viewRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
})
