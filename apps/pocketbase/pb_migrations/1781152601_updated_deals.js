/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"Admin\""
  }, collection)

  return app.save(collection)
})
