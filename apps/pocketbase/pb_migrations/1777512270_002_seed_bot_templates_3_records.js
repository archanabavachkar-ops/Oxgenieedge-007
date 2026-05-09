/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("bot_templates");

  const record0 = new Record(collection);
    record0.set("intent", "pricing");
    record0.set("response", "I can help you with pricing information. Please visit our pricing page or contact our sales team.");
    record0.set("keywords", ["price", "cost", "fees", "rate", "charge", "pricing", "expensive", "affordable"]);
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
    record1.set("intent", "demo");
    record1.set("response", "We'd love to show you a demo! Please schedule a demo session with our team.");
    record1.set("keywords", ["demo", "trial", "test", "try", "sample", "preview", "showcase"]);
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
    record2.set("intent", "support");
    record2.set("response", "I'm here to help! Please describe your issue and our support team will assist you shortly.");
    record2.set("keywords", ["help", "issue", "problem", "error", "bug", "broken", "not working", "support", "assist"]);
  try {
    app.save(record2);
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