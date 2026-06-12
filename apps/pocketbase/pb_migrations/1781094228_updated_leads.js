/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = \"Admin\"",
    "listRule": "@request.auth.role = \"Admin\"\n||\nassignedTo = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\"\n||\nassignedTo = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\"\n||\nassignedTo = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_9397138959")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = 'admin'",
    "listRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''"
  }, collection)

  return app.save(collection)
})
