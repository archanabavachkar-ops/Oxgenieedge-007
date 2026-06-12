/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.role = \"Admin\"",
    "listRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanager = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanager = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanager = @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text817655234",
    "max": 0,
    "min": 0,
    "name": "outcome",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4292334077")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != '' && @request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'",
    "listRule": "@request.auth.id != '' && @request.auth.role = 'admin'",
    "updateRule": "@request.auth.role = 'admin'",
    "viewRule": "@request.auth.id != '' && @request.auth.role = 'admin'"
  }, collection)

  // remove field
  collection.fields.removeById("text817655234")

  return app.save(collection)
})
