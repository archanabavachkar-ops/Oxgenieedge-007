/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const partnerName = e.record.get("name");
  const partnerEmail = e.record.get("email");
  const partnerId = e.record.id;
  const referralCode = e.record.get("referralCode");
  
  // Get account manager details (you may need to adjust based on your setup)
  const accountManagerName = "Support Team";
  const accountManagerEmail = "support@company.com";
  const accountManagerPhone = "+1-800-000-0000";
  
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: partnerEmail }],
    subject: "Welcome to Our Platform - Your Partner Account is Ready!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${partnerName}!</h2>
        
        <p>Congratulations on becoming a valued partner with us! We're excited to have you on board.</p>
        
        <h3>Your Account Details</h3>
        <p>
          <strong>Partner ID:</strong> ${partnerId}<br>
          <strong>Login Username:</strong> ${partnerEmail}<br>
          <strong>Login Password:</strong> [Password sent separately for security]
        </p>
        
        <h3>Getting Started</h3>
        <p>
          Access your partner dashboard here: <a href="/partners/login">Partner Dashboard Login</a>
        </p>
        
        <h3>Your Account Manager</h3>
        <p>
          <strong>Name:</strong> ${accountManagerName}<br>
          <strong>Email:</strong> ${accountManagerEmail}<br>
          <strong>Phone:</strong> ${accountManagerPhone}
        </p>
        
        <h3>Important Security Note</h3>
        <p>
          For your account security, please change your password immediately after your first login. 
          This will ensure that only you have access to your partner account.
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
  e.next();
}, "partners");