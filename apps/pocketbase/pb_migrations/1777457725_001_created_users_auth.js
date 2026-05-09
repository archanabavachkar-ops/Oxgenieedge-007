/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let organizationsCollection = app.findCollectionByNameOrId("organizations")
    let collection = new Collection({
        type: "auth",
        name: "users",
        listRule: "@request.auth.id != \"\"",
        viewRule: "@request.auth.id = id",
        createRule: null,
        updateRule: "@request.auth.id = id",
        deleteRule: "@request.auth.role = 'admin'",
        authRule: "",
        fields: [
        {
                "hidden": false,
                "id": "select6284316119",
                "name": "role",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                        "user",
                        "manager",
                        "admin"
                ]
        },
        {
                "hidden": false,
                "id": "relation7443607945",
                "name": "organization_id",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "relation",
                "cascadeDelete": false,
                collectionId: organizationsCollection.id,
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