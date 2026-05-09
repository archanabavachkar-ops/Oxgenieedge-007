/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const resetToken = e.record.get("resetToken");
  if (!resetToken) {
    e.next();
    return;
  }

  const baseUrl = "https://yourapp.com";
  const resetUrl = baseUrl + "/partners/reset-password?token=" + resetToken;
  const partnerName = e.record.get("name");
  const partnerEmail = e.record.get("email");

  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: partnerEmail }],
    subject: "Reset Your Partner Account Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${partnerName},</h2>
        <p>We received a request to reset your password. Click the link below to create a new password.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p><strong>Or copy this link:</strong><br><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #999; font-size: 12px;">
          <strong>Company Name</strong><br>
          Contact: support@yourcompany.com<br>
          Phone: +1 (555) 123-4567
        </p>
      </div>
    `
  });

  $app.newMailClient().send(message);
  e.next();
}, "partners");

onRecordAfterUpdateSuccess((e) => {
  const resetToken = e.record.get("resetToken");
  if (!resetToken) {
    e.next();
    return;
  }

  const baseUrl = "https://yourapp.com";
  const resetUrl = baseUrl + "/partners/reset-password?token=" + resetToken;
  const partnerName = e.record.get("name");
  const partnerEmail = e.record.get("email");

  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: partnerEmail }],
    subject: "Reset Your Partner Account Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${partnerName},</h2>
        <p>We received a request to reset your password. Click the link below to create a new password.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p><strong>Or copy this link:</strong><br><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #999; font-size: 12px;">
          <strong>Company Name</strong><br>
          Contact: support@yourcompany.com<br>
          Phone: +1 (555) 123-4567
        </p>
      </div>
    `
  });

  $app.newMailClient().send(message);
  e.next();
}, "partners");