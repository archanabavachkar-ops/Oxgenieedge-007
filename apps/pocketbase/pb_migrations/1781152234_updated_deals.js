/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"Admin\"",
    "deleteRule": "@request.auth.role = \"Admin\"",
    "listRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ncreatedBy = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\" ||\ndealOwner = @request.auth.id ||\ncreatedBy = @request.auth.id"
  }, collection)

  // remove field
  collection.fields.removeById("relation1535054327")

  // remove field
  collection.fields.removeById("relation1421768800")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id",
    "deleteRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id",
    "listRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id",
    "updateRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id",
    "viewRule": "@request.auth.role = \"Admin\" ||\nassignedTo = @request.auth.id ||\nmanagerId = @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_6783323688",
    "help": "",
    "hidden": false,
    "id": "relation1535054327",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "assignedTo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_6783323688",
    "help": "",
    "hidden": false,
    "id": "relation1421768800",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "managerId",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
