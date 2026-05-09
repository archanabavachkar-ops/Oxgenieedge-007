/// <reference path="../pb_data/types.d.ts" />
onRecordAfterUpdateSuccess((e) => {
  const lead = e.record;
  const original = e.record.original();
  
  // Check if followUpDate field was updated
  const followUpDate = lead.get("followUpDate");
  const previousFollowUpDate = original.get("followUpDate");
  
  // Only send email if followUpDate was changed and now has a value
  if (!followUpDate || followUpDate === previousFollowUpDate) {
    e.next();
    return;
  }

  const leadName = lead.get("name") || "Unknown";
  const leadEmail = lead.get("email") || "";
  const leadMobile = lead.get("mobile") || "";
  const assignedTo = lead.get("assignedTo");

  // Try to fetch the assigned team member's email
  let assignedToEmail = assignedTo;
  try {
    if (assignedTo) {
      const teamMember = $app.findRecordById("users", assignedTo);
      if (teamMember) {
        assignedToEmail = teamMember.get("email") || assignedTo;
      }
    }
  } catch (error) {
    console.error("Could not fetch team member details:", error);
  }

  // Only send if we have a valid email address
  if (!assignedToEmail || !assignedToEmail.includes("@")) {
    e.next();
    return;
  }

  const htmlBody = `
    <h2>Follow-up Reminder</h2>
    <p>You have a scheduled follow-up for the following lead:</p>
    <p><strong>Lead Name:</strong> ${leadName}</p>
    <p><strong>Email:</strong> ${leadEmail}</p>
    <p><strong>Mobile:</strong> ${leadMobile}</p>
    <p><strong>Follow-up Date:</strong> ${followUpDate}</p>
    <p><strong>Lead ID:</strong> ${lead.id}</p>
    <h3>Follow-up Instructions:</h3>
    <ul>
      <li>Contact the lead via email or phone</li>
      <li>Discuss their service/product interests</li>
      <li>Provide relevant information and next steps</li>
      <li>Update the lead status in the CRM</li>
    </ul>
    <p>Please ensure timely follow-up to maximize conversion opportunities.</p>
  `;

  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: assignedToEmail }],
    subject: `Follow-up Reminder: ${leadName}`,
    html: htmlBody
  });

  try {
    $app.newMailClient().send(message);
  } catch (error) {
    console.error("Failed to send follow-up reminder email:", error);
  }

  e.next();
}, "leads");