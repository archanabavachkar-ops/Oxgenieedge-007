/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let usersCollection = app.findCollectionByNameOrId("users")
    let collection = new Collection({
        type: "auth",
        name: "users",
        listRule: "id = @request.auth.id || @request.auth.role = \"CEO\" || @request.auth.role = \"Admin\"",
        viewRule: "id = @request.auth.id || @request.auth.role = \"CEO\" || @request.auth.role = \"Admin\"",
        createRule: "@request.auth.role = \"CEO\" || @request.auth.role = \"Admin\"",
        updateRule: "id = @request.auth.id || @request.auth.role = \"CEO\" || @request.auth.role = \"Admin\"",
        deleteRule: "@request.auth.role = \"CEO\"",
        fields: [
        {
                "hidden": false,
                "id": "text3609974933",
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
                "id": "text2519685996",
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
                "id": "select6840600396",
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
                "id": "text5019411663",
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
                "id": "file9619614961",
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
                "id": "select9727775192",
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
                "id": "date9239103338",
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
                "id": "relation2358645934",
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
