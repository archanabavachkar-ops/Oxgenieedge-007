
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CrmLayout from '@/layouts/CRMLayout.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Label } from '@/components/ui/label.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Search, Plus, MoreHorizontal, Loader2, Edit, Trash2, Mail, Phone, Users, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils.js';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'Active' });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('customers').getFullList({ sort: '-created', $autoCancel: false });
      setCustomers(records);
    } catch (err) { toast.error("Failed to load customers."); } finally { setLoading(false); }
  };

  const handleOpenForm = (customer = null) => {
    if (customer) {
      setSelectedCustomer(customer); setFormData({ name: customer.name, email: customer.email, phone: customer.phone, status: customer.status });
    } else {
      setSelectedCustomer(null); setFormData({ name: '', email: '', phone: '', status: 'Active' });
    }
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (selectedCustomer) await pb.collection('customers').update(selectedCustomer.id, formData, { $autoCancel: false });
      else await pb.collection('customers').create(formData, { $autoCancel: false });
      toast.success("Saved successfully.");
      setIsFormOpen(false); fetchCustomers();
    } catch (err) { toast.error("Failed to save."); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await pb.collection('customers').delete(selectedCustomer.id, { $autoCancel: false });
      toast.success("Deleted successfully.");
      setIsDeleteOpen(false); fetchCustomers();
    } catch (err) { toast.error("Failed to delete."); } finally { setIsSubmitting(false); }
  };

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <CrmLayout title="Customers Directory" description="Manage your customer database, contact information, and account statuses in one place.">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Button onClick={() => handleOpenForm()} className="ml-auto hover-lift">
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-card rounded-[20px] shadow-premium-card border border-[#E2E8F0] dark:border-border overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <Input placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 bg-white border-transparent" />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader className="bg-[#0F172A]">
              <TableRow className="border-none hover:bg-[#0F172A]">
                <TableHead className="w-[250px] pl-6 text-white font-semibold">Customer</TableHead>
                <TableHead className="text-white font-semibold">Contact</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Total Spent</TableHead>
                <TableHead className="text-white font-semibold">Added Date</TableHead>
                <TableHead className="text-right pr-6 text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#FF6B00] mx-auto" /></TableCell></TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-[#64748B] font-medium">No customers found.</TableCell></TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-[#F8FAFC] border-b border-[#E2E8F0] transition-colors">
                    <TableCell className="pl-6 font-bold text-[#0F172A]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[12px] bg-gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-glow-orange">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]"><Mail className="w-4 h-4 text-[#FF6B00]" /> {customer.email}</div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]"><Phone className="w-4 h-4 text-[#94A3B8]" /> {customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border font-bold px-3 py-1 rounded-[8px]", customer.status === 'Active' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 'bg-[#E2E8F0] text-[#64748B] border-transparent')}>{customer.status}</Badge>
                    </TableCell>
                    <TableCell className="font-bold font-numbers text-[#0F172A]">${customer.totalSpent ? customer.totalSpent.toFixed(2) : '0.00'}</TableCell>
                    <TableCell className="text-sm font-medium text-[#64748B]">{format(new Date(customer.created), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-[16px] border-[#E2E8F0] shadow-premium-hover">
                          <DropdownMenuItem onClick={() => handleOpenForm(customer)} className="rounded-[10px] font-medium text-[#0F172A]"><Edit className="w-4 h-4 mr-2 text-[#FF6B00]" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {setSelectedCustomer(customer); setIsDeleteOpen(true);}} className="rounded-[10px] font-medium text-[#EF4444] hover:bg-[#EF4444]/10 focus:bg-[#EF4444]/10 focus:text-[#EF4444]"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px] border-[#E2E8F0] bg-white shadow-premium-hover">
          <DialogHeader className="border-b border-[#E2E8F0] pb-4">
            <DialogTitle className="text-2xl font-heading font-bold text-[#0F172A]">{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="grid gap-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="grid gap-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="border-t border-[#E2E8F0] pt-4">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-[24px] border-[#E2E8F0] shadow-premium-hover">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-[#0F172A]">Delete Customer</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-[#64748B]">Are you sure you want to permanently delete {selectedCustomer?.name}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting} className="rounded-[12px] font-bold text-[#0F172A]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-[#EF4444] text-white hover:bg-[#EF4444]/90 rounded-[12px] font-bold border-transparent">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </CrmLayout>
  );
};

export default CustomersPage;
