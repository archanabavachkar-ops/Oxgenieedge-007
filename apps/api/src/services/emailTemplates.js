
const emailTemplates = {
  leadNotification: (lead) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f7f6; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #007bff; padding: 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">🚀 New Lead Alert</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">You have received a new lead via OxGenie Edge</p>
            </div>
            <div style="padding: 30px 20px;">
              <h2 style="font-size: 18px; color: #007bff; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-top: 0;">Lead Details</h2>
              
              <div style="margin-bottom: 15px;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${lead.name || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${lead.email}" style="color: #007bff; text-decoration: none;">${lead.email || 'N/A'}</a></p>
                <p style="margin: 5px 0;"><strong>Mobile:</strong> <a href="tel:${lead.mobile}" style="color: #007bff; text-decoration: none;">${lead.mobile || 'N/A'}</a></p>
                <p style="margin: 5px 0;"><strong>Source:</strong> <span style="background-color: #e9ecef; padding: 3px 8px; border-radius: 4px; font-size: 12px;">${lead.source || 'N/A'}</span></p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${lead.subject || 'N/A'}</p>
              </div>

              <h3 style="font-size: 16px; color: #333; margin-top: 25px; margin-bottom: 10px;">Message:</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; font-style: italic; color: #555; white-space: pre-wrap;">${lead.message || 'No message provided.'}</p>
              </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #888; font-size: 12px;">This is an automated notification from <strong>OxGenie Edge</strong>.</p>
              <p style="margin: 5px 0 0 0; color: #aaa; font-size: 11px;">Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  whatsappNotification: (senderPhone, messageText, timestamp) => {
    const formattedDate = new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f7f6; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #25d366; padding: 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">💬 New WhatsApp Message</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Via OxGenie Edge WhatsApp Integration</p>
            </div>
            <div style="padding: 30px 20px;">
              <div style="margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
                <p style="margin: 5px 0; color: #555;"><strong>From:</strong> <a href="https://wa.me/${senderPhone.replace(/\D/g, '')}" style="color: #25d366; text-decoration: none;">+${senderPhone}</a></p>
                <p style="margin: 5px 0; color: #555;"><strong>Received At:</strong> ${formattedDate}</p>
              </div>

              <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">Message Content:</h3>
              <div style="background-color: #e8f9ed; padding: 15px; border-left: 4px solid #25d366; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; color: #2d3748; line-height: 1.5; white-space: pre-wrap;">${messageText || 'No text content in this message.'}</p>
              </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #888; font-size: 12px;">This is an automated notification from <strong>OxGenie Edge</strong>.</p>
              <p style="margin: 5px 0 0 0; color: #aaa; font-size: 11px;">Please log in to your CRM dashboard to reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  contactFormNotification: (name, email, message, timestamp) => {
    const formattedDate = new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f7f6; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #ff6b6b; padding: 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">📝 New Contact Form Submission</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">A visitor has submitted the contact form</p>
            </div>
            <div style="padding: 30px 20px;">
              <div style="margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
                <p style="margin: 5px 0; color: #555;"><strong>Name:</strong> ${name || 'N/A'}</p>
                <p style="margin: 5px 0; color: #555;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #ff6b6b; text-decoration: none;">${email || 'N/A'}</a></p>
                <p style="margin: 5px 0; color: #555;"><strong>Submitted At:</strong> ${formattedDate}</p>
              </div>

              <h3 style="font-size: 16px; color: #333; margin-bottom: 10px;">Message:</h3>
              <div style="background-color: #fff5f5; padding: 15px; border-left: 4px solid #ff6b6b; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; color: #4a5568; line-height: 1.5; white-space: pre-wrap; font-style: italic;">${message || 'No message provided.'}</p>
              </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #888; font-size: 12px;">This is an automated notification from <strong>OxGenie Edge</strong>.</p>
              <p style="margin: 5px 0 0 0; color: #aaa; font-size: 11px;">Please follow up with this contact as soon as possible.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
};

export default emailTemplates;
