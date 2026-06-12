/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_6783323688")

  // update collection data
  unmarshal({
    "deleteRule": "",
    "updateRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_6783323688")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = \"Admin\"",
    "updateRule": "@request.auth.role = \"Admin\" ||\nid = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\" ||\nid = @request.auth.id ||\nmanagerId = @request.auth.id"
  }, collection)

  return app.save(collection)
})
