/// <reference path="../pb_data/types.d.ts" />
onRecordAfterUpdateSuccess((e) => {
  const lead = e.record;
  const original = e.record.original();
  
  // Check if assignedTo field was updated
  const assignedTo = lead.get("assignedTo");
  const previousAssignedTo = original.get("assignedTo");
  
  // Only send email if assignedTo was changed and now has a value
  if (!assignedTo || assignedTo === previousAssignedTo) {
    e.next();
    return;
  }

  const leadName = lead.get("name") || "Unknown";
  const leadEmail = lead.get("email") || "";
  const leadMobile = lead.get("mobile") || "";
  const serviceInterest = lead.get("serviceInterest") || "Not specified";
  const productInterest = lead.get("productInterest") || "Not specified";
  const description = lead.get("description") || "No description provided";

  // Try to fetch the assigned team member's details
  let assignedToEmail = assignedTo;
  try {
    const teamMember = $app.findRecordById("users", assignedTo);
    if (teamMember) {
      assignedToEmail = teamMember.get("email") || assignedTo;
    }
  } catch (error) {
    console.error("Could not fetch team member details:", error);
  }

  const htmlBody = `
    <h2>New Lead Assigned to You</h2>
    <p>A new lead has been assigned to you in OxgenieEdge CRM.</p>
    <p><strong>Lead Name:</strong> ${leadName}</p>
    <p><strong>Email:</strong> ${leadEmail}</p>
    <p><strong>Mobile:</strong> ${leadMobile}</p>
    <p><strong>Service Interest:</strong> ${serviceInterest}</p>
    <p><strong>Product Interest:</strong> ${productInterest}</p>
    <p><strong>Description:</strong> ${description}</p>
    <p><strong>Lead ID:</strong> ${lead.id}</p>
    <p><strong>Assigned At:</strong> ${new Date().toLocaleString()}</p>
    <p>Please follow up with this lead as soon as possible.</p>
  `;

  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: assignedToEmail }],
    subject: `New Lead Assigned to You: ${leadName}`,
    html: htmlBody
  });

  try {
    $app.newMailClient().send(message);
  } catch (error) {
    console.error("Failed to send lead assignment email:", error);
  }

  e.next();
}, "leads");