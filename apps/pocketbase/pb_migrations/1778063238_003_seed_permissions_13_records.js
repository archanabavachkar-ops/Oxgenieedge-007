/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("permissions");

  const record0 = new Record(collection);
    record0.set("code", "user.create");
    record0.set("name", "Create User");
    record0.set("description", "Create new system users");
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
    record1.set("code", "user.edit");
    record1.set("name", "Edit User");
    record1.set("description", "Edit user details and information");
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
    record2.set("code", "user.delete");
    record2.set("name", "Delete User");
    record2.set("description", "Delete system users");
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
    record3.set("code", "user.view");
    record3.set("name", "View User");
    record3.set("description", "View user profiles and details");
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
    record4.set("code", "user.changePassword");
    record4.set("name", "Change Password");
    record4.set("description", "Change user passwords");
    record4.set("category", "user_management");
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
    record5.set("code", "user.changeStatus");
    record5.set("name", "Change User Status");
    record5.set("description", "Activate, deactivate, or suspend users");
    record5.set("category", "user_management");
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
    record6.set("code", "lead.assign");
    record6.set("name", "Assign Lead");
    record6.set("description", "Assign leads to sales agents");
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
    record7.set("code", "lead.reassign");
    record7.set("name", "Reassign Lead");
    record7.set("description", "Reassign leads to different agents");
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
    record8.set("code", "lead.unassign");
    record8.set("name", "Unassign Lead");
    record8.set("description", "Unassign leads from agents");
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
    record9.set("code", "lead.view");
    record9.set("name", "View Lead");
    record9.set("description", "View lead information and details");
    record9.set("category", "lead_management");
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
    record10.set("code", "analytics.view");
    record10.set("name", "View Analytics");
    record10.set("description", "View reports and analytics dashboards");
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
    record11.set("code", "audit.view");
    record11.set("name", "View Audit Logs");
    record11.set("description", "View system audit logs");
    record11.set("category", "reporting");
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
    record12.set("code", "settings.manage");
    record12.set("name", "Manage Settings");
    record12.set("description", "Manage system settings and configurations");
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
