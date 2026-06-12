/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // add field
  collection.fields.addAt(16, new Field({
    "help": "",
    "hidden": false,
    "id": "bool2323052248",
    "name": "isActive",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "help": "",
    "hidden": false,
    "id": "date3768266434",
    "max": "",
    "min": "",
    "name": "joiningDate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "help": "",
    "hidden": false,
    "id": "json3762918058",
    "maxSize": 0,
    "name": "permission",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1984289701")

  // remove field
  collection.fields.removeById("bool2323052248")

  // remove field
  collection.fields.removeById("date3768266434")

  // remove field
  collection.fields.removeById("json3762918058")

  return app.save(collection)
})
