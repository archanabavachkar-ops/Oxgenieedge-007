/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  console.log('HOOK TRIGGERED: lead-capture-email - Record ID: ' + e.record.id);
  
  try {
    // Log lead data
    console.log('Lead data: {name: ' + e.record.get("name") + ', email: ' + e.record.get("email") + ', mobile: ' + e.record.get("mobile") + ', source: ' + (e.record.get("source") || "N/A") + '}');
    
    console.log('Preparing to send email to hello@oxgenieedge.com');
    
    const emailSubject = "New Lead Captured: " + e.record.get("name");
    console.log('Email subject: ' + emailSubject);
    
    const emailBody = "<h2>New Lead Submission</h2>" +
          "<p><strong>Name:</strong> " + e.record.get("name") + "</p>" +
          "<p><strong>Email:</strong> " + e.record.get("email") + "</p>" +
          "<p><strong>Mobile:</strong> " + e.record.get("mobile") + "</p>" +
          "<p><strong>Description:</strong> " + (e.record.get("description") || "N/A") + "</p>" +
          "<p><strong>Source:</strong> " + (e.record.get("source") || "N/A") + "</p>" +
          "<p><strong>Status:</strong> " + (e.record.get("status") || "New Order") + "</p>" +
          "<p><em>Lead ID: " + e.record.id + "</em></p>";
    
    console.log('Email body length: ' + emailBody.length);
    
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: "hello@oxgenieedge.com" }],
      subject: emailSubject,
      html: emailBody
    });
    
    $app.newMailClient().send(message);
    console.log('Email sent successfully for lead: ' + e.record.id);
    
  } catch (error) {
    console.log('Email sending error: ' + error.message);
  }
  
  e.next();
}, "leads");