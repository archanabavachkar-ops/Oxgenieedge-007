import pb from '@/lib/pocketbaseClient';

export const createLeadFromSource = async ({ name, email, mobile, source, description, serviceInterest }) => {
  try {
    if (!email) return null;
    
    // Check if lead already exists
    const existing = await pb.collection('leads').getList(1, 1, {
      filter: `email="${email}"`,
      $autoCancel: false
    });

    if (existing.items.length === 0) {
      return await pb.collection('leads').create({
        name: name || 'Unknown',
        email,
        mobile: mobile || 'N/A',
        source,
        status: 'New Order', // Matches the schema values: 'New Order', 'Contacted', etc.
        description: description || '',
        serviceInterest: serviceInterest || ''
      }, { $autoCancel: false });
    }
    
    return existing.items[0];
  } catch (error) {
    console.error('Error creating lead:', error);
    return null;
  }
};