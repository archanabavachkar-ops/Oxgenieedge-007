/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  try {
    // Extract data from webhook log record
    const fromNumber = e.record.get("from_number");
    const messageText = e.record.get("message_text");
    const messageType = e.record.get("message_type");
    const status = e.record.get("status");

    // Only process if conditions are met
    if (!fromNumber || messageType !== "text" || status !== "received") {
      console.log("Skipping lead creation: conditions not met", {
        fromNumber,
        messageType,
        status
      });
      e.next();
      return;
    }

    console.log("Processing WhatsApp message for lead creation", {
      fromNumber,
      messageText,
      messageType
    });

    // Check if lead already exists
    let existingLead = null;
    try {
      existingLead = $app.findFirstRecordByData("leads", "mobile", fromNumber);
    } catch (err) {
      // Lead doesn't exist, which is expected
      console.log("No existing lead found for number: " + fromNumber);
    }

    if (existingLead) {
      // Update existing lead
      console.log("Updating existing lead: " + existingLead.id);
      
      const messageCount = existingLead.get("message_count") || 0;
      existingLead.set("message_count", messageCount + 1);
      existingLead.set("last_message", messageText);
      existingLead.set("last_message_at", new Date().toISOString());
      
      $app.save(existingLead);
      console.log("Lead updated successfully: " + existingLead.id);
    } else {
      // Create new lead
      console.log("Creating new lead for number: " + fromNumber);
      
      const newLead = new Record();
      newLead.collection = "leads";
      
      // Set required fields
      newLead.set("mobile", fromNumber);
      newLead.set("name", "");
      newLead.set("email", "");
      newLead.set("source", "whatsapp");
      newLead.set("status", "New Lead");
      newLead.set("notes", "");
      newLead.set("description", "");
      newLead.set("productInterest", "");
      newLead.set("serviceInterest", "");
      newLead.set("priority", "Medium");
      
      // Set dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      newLead.set("nextFollowUpDate", today.toISOString().split('T')[0]);
      newLead.set("lastContactDate", null);
      newLead.set("callOutcome", null);
      
      // Optional fields
      newLead.set("message_count", 1);
      newLead.set("last_message", messageText);
      newLead.set("last_message_at", new Date().toISOString());
      
      $app.save(newLead);
      console.log("New lead created successfully: " + newLead.id);
    }

    e.next();
  } catch (error) {
    console.log("Error in auto-lead-creation hook: " + error.message);
    console.log("Stack: " + error.stack);
    // Don't throw - allow webhook to complete successfully
    e.next();
  }
}, "whatsapp_webhook_logs");