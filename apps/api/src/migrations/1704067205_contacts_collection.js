export default async (app) => {
  // Migration: Create/Update contacts collection with status and assignedTo fields
  // This migration ensures the contacts collection has the required fields
  
  const collections = await app.collections.getFullList();
  const contactsCollection = collections.find(c => c.name === 'contacts');
  
  if (!contactsCollection) {
    // Create contacts collection if it doesn't exist
    const collection = new app.Collection({
      name: 'contacts',
      type: 'base',
      system: false,
      schema: [
        {
          id: 'name_field',
          name: 'name',
          type: 'text',
          required: true,
          presentable: true,
        },
        {
          id: 'email_field',
          name: 'email',
          type: 'email',
          required: true,
          presentable: true,
        },
        {
          id: 'mobile_field',
          name: 'mobile',
          type: 'text',
          presentable: true,
        },
        {
          id: 'company_field',
          name: 'company',
          type: 'text',
          presentable: false,
        },
        {
          id: 'status_field',
          name: 'status',
          type: 'select',
          required: false,
          presentable: true,
          options: {
            maxSelect: 1,
            values: ['New', 'Contacted', 'Qualified', 'Converted', 'Rejected'],
          },
          defaultValue: 'New',
        },
        {
          id: 'assignedTo_field',
          name: 'assignedTo',
          type: 'text',
          required: false,
          presentable: true,
        },
      ],
      listRule: '@request.auth.role = "admin" || @request.auth.role = "manager"',
      viewRule: '@request.auth.role = "admin" || @request.auth.role = "manager"',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.role = "admin" || @request.auth.role = "manager" || @request.auth.id = owner',
      deleteRule: '@request.auth.role = "admin"',
    });
    
    await app.collections.save(collection);
  } else {
    // Update existing contacts collection to add missing fields
    const schema = contactsCollection.schema || [];
    let hasStatusField = schema.some(f => f.name === 'status');
    let hasAssignedToField = schema.some(f => f.name === 'assignedTo');
    
    if (!hasStatusField) {
      schema.push({
        id: 'status_field',
        name: 'status',
        type: 'select',
        required: false,
        presentable: true,
        options: {
          maxSelect: 1,
          values: ['New', 'Contacted', 'Qualified', 'Converted', 'Rejected'],
        },
        defaultValue: 'New',
      });
    }
    
    if (!hasAssignedToField) {
      schema.push({
        id: 'assignedTo_field',
        name: 'assignedTo',
        type: 'text',
        required: false,
        presentable: true,
      });
    }
    
    if (!hasStatusField || !hasAssignedToField) {
      contactsCollection.schema = schema;
      await app.collections.save(contactsCollection);
    }
  }
};