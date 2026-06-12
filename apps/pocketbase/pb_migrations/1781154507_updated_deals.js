/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ndealOwner.reportsTo = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ndealOwner.reportsTo = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ndealOwner.reportsTo = @request.auth.id"
  }, collection)

  return app.save(collection)
})
