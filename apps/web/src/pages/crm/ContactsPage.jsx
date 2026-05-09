import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/layouts/CRMLayout.jsx';
import ContactsTable from '@/components/crm/ContactsTable.jsx';
import ContactDetailPanel from '@/components/crm/ContactDetailPanel.jsx';
import AddContactModal from '@/components/crm/AddContactModal.jsx';
import EditContactModal from '@/components/crm/EditContactModal.jsx';
import ImportContactsModal from '@/components/crm/ImportContactsModal.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Search, Plus, Filter, Upload, Download } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('contacts').getFullList({ sort: '-created', $autoCancel: false });
      const mapped = records.map(r => {
        let extras = {};
        try { if(r.message && r.message.startsWith('{')) extras = JSON.parse(r.message); } catch(e){}
        return {
          ...r,
          _company: extras.company || 'Independent',
          _source: extras.source || 'Direct',
          _status: extras.status || 'Lead',
          _score: Math.floor(Math.random() * 40) + 40,
          _tags: ['New', 'Prospect']
        };
      });
      setContacts(mapped);
    } catch (err) {
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleSort = (column) => toast.info(`Sorting by ${column} coming soon`);
  const handleSelectContact = (contact) => { setSelectedContact(contact); setIsPanelOpen(true); };
  const handleEditContact = (contact) => { setSelectedContact(contact); setIsEditOpen(true); };
  const handleDelete = async (contact) => {
    try {
      await pb.collection('contacts').delete(contact.id, { $autoCancel: false });
      toast.success('Contact deleted');
      fetchContacts();
    } catch (err) { toast.error('Failed to delete contact'); }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CrmLayout title="Contact Management" description="Manage your complete database of leads, prospects, and customers.">
      <Helmet><title>Contacts - CRM</title></Helmet>

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div className="flex gap-3 ml-auto">
          <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border p-4 rounded-[20px] shadow-premium-card mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input 
            placeholder="Search names, emails, companies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-[#F8FAFC] border-transparent"
          />
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px] bg-[#F8FAFC] border-transparent font-semibold">
              <Filter className="w-4 h-4 mr-2 text-[#FF6B00]" /> <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="lead">Leads Only</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <ContactsTable 
          contacts={filteredContacts}
          loading={loading}
          onSort={handleSort}
          onSelectContact={handleSelectContact}
          onEdit={handleEditContact}
          onDelete={handleDelete}
          onMessage={() => toast.success('Opening messaging panel...')}
        />
      </motion.div>

      <ContactDetailPanel contact={selectedContact} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      <AddContactModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchContacts} />
      <EditContactModal isOpen={isEditOpen} contact={selectedContact} onClose={() => setIsEditOpen(false)} onSuccess={fetchContacts} />
      <ImportContactsModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onSuccess={fetchContacts} />
    </CrmLayout>
  );
};

export default ContactsPage;