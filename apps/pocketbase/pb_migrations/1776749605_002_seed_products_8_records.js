/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const record0 = new Record(collection);
    record0.set("name", "CRM Implementation");
    record0.set("type", "service");
    record0.set("price", 5000);
    record0.set("description", "Complete CRM system setup and customization");
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
    record1.set("name", "Cloud Migration");
    record1.set("type", "service");
    record1.set("price", 8000);
    record1.set("description", "Migrate your infrastructure to cloud");
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
    record2.set("name", "API Integration");
    record2.set("type", "service");
    record2.set("price", 3000);
    record2.set("description", "Custom API integration and development");
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
    record3.set("name", "Premium Support");
    record3.set("type", "service");
    record3.set("price", 2000);
    record3.set("description", "24/7 dedicated support package");
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
    record4.set("name", "Custom Development");
    record4.set("type", "service");
    record4.set("price", 10000);
    record4.set("description", "Bespoke software development");
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
    record5.set("name", "Data Analytics");
    record5.set("type", "service");
    record5.set("price", 4500);
    record5.set("description", "Advanced analytics and reporting setup");
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
    record6.set("name", "Security Audit");
    record6.set("type", "service");
    record6.set("price", 3500);
    record6.set("description", "Comprehensive security assessment");
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
    record7.set("name", "Training Program");
    record7.set("type", "service");
    record7.set("price", 2500);
    record7.set("description", "Team training and onboarding");
  try {
    app.save(record7);
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