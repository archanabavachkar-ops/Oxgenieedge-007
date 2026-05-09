export default async (app) => {
  // Migration: Create activities collection with proper schema and access rules
  // This migration ensures the activities collection exists with all required fields
  
  const collections = await app.collections.getFullList();
  const activitiesCollection = collections.find(c => c.name === 'activities');
  
  if (!activitiesCollection) {
    // Create activities collection
    const collection = new app.Collection({
      name: 'activities',
      type: 'base',
      system: false,
      schema: [
        {
          id: 'lead_id_field',
          name: 'lead_id',
          type: 'text',
          required: false,
          presentable: true,
        },
        {
          id: 'type_field',
          name: 'type',
          type: 'select',
          required: true,
          presentable: true,
          options: {
            maxSelect: 1,
            values: ['status_change', 'assignment', 'conversion', 'deletion', 'email_sent', 'whatsapp_message', 'phone_call', 'note', 'other'],
          },
        },
        {
          id: 'description_field',
          name: 'description',
          type: 'text',
          required: false,
          presentable: true,
        },
        {
          id: 'created_by_field',
          name: 'created_by',
          type: 'text',
          required: false,
          presentable: true,
        },
        {
          id: 'timestamp_field',
          name: 'timestamp',
          type: 'autodate',
          required: false,
          presentable: true,
          onCreate: true,
          onUpdate: false,
        },
        {
          id: 'content_field',
          name: 'content',
          type: 'text',
          required: false,
          presentable: false,
        },
        {
          id: 'related_record_id_field',
          name: 'related_record_id',
          type: 'text',
          required: false,
          presentable: false,
        },
        {
          id: 'related_record_type_field',
          name: 'related_record_type',
          type: 'text',
          required: false,
          presentable: false,
        },
        {
          id: 'metadata_field',
          name: 'metadata',
          type: 'text',
          required: false,
          presentable: false,
        },
      ],
      listRule: '@request.auth.role = "admin" || @request.auth.role = "manager"',
      viewRule: '@request.auth.role = "admin" || @request.auth.role = "manager"',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"',
    });
    
    await app.collections.save(collection);
  } else {
    // Update existing activities collection to ensure all fields exist
    const schema = activitiesCollection.schema || [];
    const requiredFields = [
      { name: 'lead_id', type: 'text' },
      { name: 'type', type: 'select' },
      { name: 'description', type: 'text' },
      { name: 'created_by', type: 'text' },
      { name: 'timestamp', type: 'autodate' },
    ];
    
    let needsUpdate = false;
    
    requiredFields.forEach(field => {
      const exists = schema.some(f => f.name === field.name);
      if (!exists) {
        needsUpdate = true;
        if (field.name === 'type') {
          schema.push({
            id: `${field.name}_field`,
            name: field.name,
            type: field.type,
            required: true,
            presentable: true,
            options: {
              maxSelect: 1,
              values: ['status_change', 'assignment', 'conversion', 'deletion', 'email_sent', 'whatsapp_message', 'phone_call', 'note', 'other'],
            },
          });
        } else if (field.name === 'timestamp') {
          schema.push({
            id: `${field.name}_field`,
            name: field.name,
            type: field.type,
            required: false,
            presentable: true,
            onCreate: true,
            onUpdate: false,
          });
        } else {
          schema.push({
            id: `${field.name}_field`,
            name: field.name,
            type: field.type,
            required: false,
            presentable: field.name !== 'metadata',
          });
        }
      }
    });
    
    if (needsUpdate) {
      activitiesCollection.schema = schema;
      // Update access rules if needed
      if (!activitiesCollection.listRule) {
        activitiesCollection.listRule = '@request.auth.role = "admin" || @request.auth.role = "manager"';
      }
      if (!activitiesCollection.viewRule) {
        activitiesCollection.viewRule = '@request.auth.role = "admin" || @request.auth.role = "manager"';
      }
      if (!activitiesCollection.createRule) {
        activitiesCollection.createRule = '@request.auth.id != ""';
      }
      if (!activitiesCollection.updateRule) {
        activitiesCollection.updateRule = '@request.auth.role = "admin"';
      }
      if (!activitiesCollection.deleteRule) {
        activitiesCollection.deleteRule = '@request.auth.role = "admin"';
      }
      await app.collections.save(activitiesCollection);
    }
  }
};