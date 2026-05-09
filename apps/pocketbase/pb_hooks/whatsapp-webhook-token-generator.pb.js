/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  // Generate a cryptographically secure token using Math.random() and timestamp
  // This creates a 32+ character alphanumeric token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  // Generate 32 random characters
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add timestamp for additional entropy
  token += Date.now().toString(36);
  
  // Set the webhook verify token
  e.record.set('whatsappWebhookVerifyToken', token);
  
  // Set default values if not provided
  if (!e.record.get('isConnected')) {
    e.record.set('isConnected', false);
  }
  
  e.next();
}, 'whatsapp_settings');

onRecordUpdate((e) => {
  // Generate a new cryptographically secure token on update
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  // Generate 32 random characters
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add timestamp for additional entropy
  token += Date.now().toString(36);
  
  // Update the webhook verify token
  e.record.set('whatsappWebhookVerifyToken', token);
  
  e.next();
}, 'whatsapp_settings');