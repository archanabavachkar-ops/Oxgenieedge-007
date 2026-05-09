/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let usersCollection = app.findCollectionByNameOrId("users")
    let collection = new Collection({
        type: "auth",
        name: "users",
        listRule: "id = @request.auth.id || @request.auth.role = \"Admin\" || @request.auth.role = \"CEO\"",
        viewRule: "id = @request.auth.id || @request.auth.role = \"Admin\" || @request.auth.role = \"CEO\"",
        createRule: "@request.auth.role = \"Admin\" || @request.auth.role = \"CEO\"",
        updateRule: "id = @request.auth.id || @request.auth.role = \"Admin\" || @request.auth.role = \"CEO\"",
        deleteRule: "@request.auth.role = \"CEO\"",
        fields: [
        {
                "hidden": false,
                "id": "text5682331340",
                "name": "fullName",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
        },
        {
                "hidden": false,
                "id": "text8925275763",
                "name": "mobile",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
        },
        {
                "hidden": false,
                "id": "select0004978024",
                "name": "role",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                        "CEO",
                        "Admin",
                        "Sales Manager",
                        "Sales Agent",
                        "Viewer"
                ]
        },
        {
                "hidden": false,
                "id": "text9034152431",
                "name": "department",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
        },
        {
                "hidden": false,
                "id": "file5294245600",
                "name": "profileImage",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "file",
                "maxSelect": 1,
                "maxSize": 20971520,
                "mimeTypes": [],
                "thumbs": []
        },
        {
                "hidden": false,
                "id": "select1738478928",
                "name": "status",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                        "Active",
                        "Inactive",
                        "Suspended"
                ]
        },
        {
                "hidden": false,
                "id": "date0317266932",
                "name": "lastLogin",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "date",
                "max": "",
                "min": ""
        },
        {
                "hidden": false,
                "id": "relation7373509218",
                "name": "createdBy",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "relation",
                "cascadeDelete": false,
                collectionId: usersCollection.id,
                "displayFields": [],
                "maxSelect": 1,
                "minSelect": 0
        },
        {
                "hidden": false,
                "id": "json8688261210",
                "name": "permissions",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "json",
                "maxSize": 0
        }
],
        authAlert: { enabled: false },
    })

    try {
        app.save(collection)
    } catch (e) {
        if (e.message.includes("Collection name must be unique")) {
            console.log("Collection already exists, skipping")
            return
        }
        throw e
    }
}, (app) => {
    try {
        let collection = app.findCollectionByNameOrId("users")
        app.delete(collection)
    } catch (e) {
        if (e.message.includes("no rows in result set")) {
            console.log("Collection not found, skipping revert");
            return;
        }
        throw e;
    }
})
