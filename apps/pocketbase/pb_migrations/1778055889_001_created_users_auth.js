/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let collection = new Collection({
        type: "auth",
        name: "users",
        listRule: "@request.auth.role = \"Super Admin\" || @request.auth.role = \"Admin\"",
        viewRule: "@request.auth.id != \"\" && (id = @request.auth.id || @request.auth.role = \"Super Admin\" || @request.auth.role = \"Admin\")",
        createRule: "@request.auth.role = \"Super Admin\" || @request.auth.role = \"Admin\"",
        updateRule: "@request.auth.role = \"Super Admin\" || @request.auth.role = \"Admin\"",
        deleteRule: "@request.auth.role = \"Super Admin\"",
        fields: [
        {
                "hidden": false,
                "id": "text6015992331",
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
                "id": "text8265797875",
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
                "id": "select7004258937",
                "name": "role",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                        "Super Admin",
                        "Admin",
                        "Sales Manager",
                        "Sales Agent",
                        "Viewer"
                ]
        },
        {
                "hidden": false,
                "id": "text1923746287",
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
                "id": "file4515582026",
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
                "id": "select7057598571",
                "name": "status",
                "presentable": false,
                "primaryKey": false,
                "required": false,
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
                "id": "date4101200533",
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
                "id": "json7813323436",
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
