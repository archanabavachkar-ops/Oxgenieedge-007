/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("permissions");

  const record0 = new Record(collection);
    record0.set("code", "user_create");
    record0.set("name", "Create Users");
    record0.set("description", "Can create new user accounts");
    record0.set("category", "user_management");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("code", "user_read");
    record1.set("name", "View Users");
    record1.set("description", "Can view user information");
    record1.set("category", "user_management");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("code", "user_update");
    record2.set("name", "Update Users");
    record2.set("description", "Can update user information");
    record2.set("category", "user_management");
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("code", "user_delete");
    record3.set("name", "Delete Users");
    record3.set("description", "Can delete user accounts");
    record3.set("category", "user_management");
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("code", "lead_create");
    record4.set("name", "Create Leads");
    record4.set("description", "Can create new leads");
    record4.set("category", "lead_management");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("code", "lead_read");
    record5.set("name", "View Leads");
    record5.set("description", "Can view lead information");
    record5.set("category", "lead_management");
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("code", "lead_update");
    record6.set("name", "Update Leads");
    record6.set("description", "Can update lead information");
    record6.set("category", "lead_management");
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("code", "lead_delete");
    record7.set("name", "Delete Leads");
    record7.set("description", "Can delete leads");
    record7.set("category", "lead_management");
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    record8.set("code", "lead_assign");
    record8.set("name", "Assign Leads");
    record8.set("description", "Can assign leads to users");
    record8.set("category", "lead_management");
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    record9.set("code", "report_view");
    record9.set("name", "View Reports");
    record9.set("description", "Can view system reports");
    record9.set("category", "reporting");
  try {
    app.save(record9);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record10 = new Record(collection);
    record10.set("code", "report_export");
    record10.set("name", "Export Reports");
    record10.set("description", "Can export reports");
    record10.set("category", "reporting");
  try {
    app.save(record10);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record11 = new Record(collection);
    record11.set("code", "settings_manage");
    record11.set("name", "Manage Settings");
    record11.set("description", "Can manage system settings");
    record11.set("category", "settings");
  try {
    app.save(record11);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record12 = new Record(collection);
    record12.set("code", "audit_view");
    record12.set("name", "View Audit Logs");
    record12.set("description", "Can view audit logs");
    record12.set("category", "settings");
  try {
    app.save(record12);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
