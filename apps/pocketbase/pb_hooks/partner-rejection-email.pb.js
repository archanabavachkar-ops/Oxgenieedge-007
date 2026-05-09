/// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  const status = e.record.get("status");
  const originalStatus = e.record.original().get("status");
  
  // Only send email if status changed to "Rejected"
  if (status === "Rejected" && originalStatus !== "Rejected") {
    const applicantName = e.record.get("fullName");
    const applicantEmail = e.record.get("email");
    const rejectionReason = e.record.get("rejectionReason") || "Your application did not meet our current partnership criteria.";
    
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: applicantEmail }],
      subject: "Your Partner Application Status",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${applicantName},</h2>
          
          <p>Thank you for your interest in becoming a partner with us. We appreciate the time and effort you invested in submitting your application.</p>
          
          <h3>Application Status</h3>
          <p>
            After careful review, we regret to inform you that your partner application has not been approved at this time.
          </p>
          
          <h3>Reason for Decision</h3>
          <p>
            ${rejectionReason}
          </p>
          
          <h3>Next Steps</h3>
          <p>
            We encourage you to reapply after 30 days. During this time, you may consider:
          </p>
          <ul>
            <li>Strengthening your business credentials</li>
            <li>Expanding your service offerings</li>
            <li>Building additional case studies or portfolio items</li>
            <li>Addressing any feedback from our review team</li>
          </ul>
          
          <p>
            If you have any questions or would like feedback on your application, please don't hesitate to reach out to our partnership team.
          </p>
          
          <hr style="margin: 30px 0;">
          <footer style="font-size: 12px; color: #666;">
            <p>&copy; 2024 Our Company. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </footer>
        </div>
      `
    });
    
    $app.newMailClient().send(message);
  }
  
  e.next();
}, "partner_applications");