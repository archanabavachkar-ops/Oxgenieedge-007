/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // remove field
  collection.fields.removeById("autodate4486535697")

  // add field
  collection.fields.addAt(13, new Field({
    "help": "",
    "hidden": false,
    "id": "number3735973451",
    "max": null,
    "min": null,
    "name": "probability",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "date1797306842",
    "max": "",
    "min": "",
    "name": "expectedCloseDate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "help": "",
    "hidden": false,
    "id": "date2863008990",
    "max": "",
    "min": "",
    "name": "actualCloseDate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation3858357452",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "dealOwner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text3253625724",
    "max": 0,
    "min": 0,
    "name": "organization",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text18589324",
    "max": 0,
    "min": 0,
    "name": "notes",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1984289701",
    "help": "",
    "hidden": false,
    "id": "relation3545646658",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "createdBy",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "help": "",
    "hidden": false,
    "id": "select480611375",
    "maxSelect": 0,
    "name": "lostReason",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Price",
      "Competitor",
      "Budget Constraints",
      "No Decision",
      "Requirement Changed",
      "Timeline Issue",
      "Other"
    ]
  }))

  // add field
  collection.fields.addAt(21, new Field({
    "hidden": false,
    "id": "autodate2990389176",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "autodate1307432820",
    "name": "updated",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2873327947")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "autodate4486535697",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // remove field
  collection.fields.removeById("number3735973451")

  // remove field
  collection.fields.removeById("date1797306842")

  // remove field
  collection.fields.removeById("date2863008990")

  // remove field
  collection.fields.removeById("relation3858357452")

  // remove field
  collection.fields.removeById("text3253625724")

  // remove field
  collection.fields.removeById("text18589324")

  // remove field
  collection.fields.removeById("relation3545646658")

  // remove field
  collection.fields.removeById("select480611375")

  // remove field
  collection.fields.removeById("autodate2990389176")

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "autodate1307432820",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
})
