
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx';
import { MoreHorizontal, MessageSquare, Edit, Trash2, Globe, Facebook, Mail, MonitorSmartphone, Eye } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const ContactsTable = ({ contacts = [], loading = false, onSort, onSelectContact, onEdit, onDelete, onMessage }) => {

  const getSourceIcon = (source) => {
    switch(source?.toLowerCase()) {
      case 'website': return <Globe className="w-3 h-3 mr-1" />;
      case 'facebook': return <Facebook className="w-3 h-3 mr-1" />;
      case 'email': return <Mail className="w-3 h-3 mr-1" />;
      default: return <MonitorSmartphone className="w-3 h-3 mr-1" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
    if (score >= 50) return 'text-[#FF6B00] bg-[#FF6B00]/10 border-[#FF6B00]/20';
    return 'text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/20';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return '🔥 Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
  };

  return (
    <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border shadow-premium-card rounded-[20px] overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader className="bg-[#0F172A]">
            <TableRow className="hover:bg-[#0F172A] border-none">
              <TableHead className="w-[50px] pl-6 py-4"><Checkbox className="border-white/30 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]" /></TableHead>
              <TableHead className="cursor-pointer text-white font-semibold" onClick={() => onSort('name')}>Name & Company</TableHead>
              <TableHead className="text-white font-semibold">Contact Info</TableHead>
              <TableHead className="cursor-pointer text-white font-semibold" onClick={() => onSort('status')}>Status</TableHead>
              <TableHead className="cursor-pointer text-white font-semibold" onClick={() => onSort('score')}>Lead Score</TableHead>
              <TableHead className="text-right pr-6 text-white font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="border-[#E2E8F0]"><TableCell colSpan={6} className="h-16 pl-6"><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              ))
            ) : contacts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-[#64748B] font-medium">No contacts found.</TableCell></TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id} className="hover:bg-[#F8FAFC] border-b border-[#E2E8F0] transition-colors cursor-pointer group" onClick={() => onSelectContact(contact)}>
                  <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}><Checkbox /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border-2 border-[#E2E8F0]">
                        <AvatarFallback className="bg-gradient-primary text-white font-bold">{contact.name?.substring(0, 2).toUpperCase() || 'CT'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0F172A] group-hover:text-[#FF6B00] transition-colors">{contact.name}</span>
                        <span className="text-xs font-semibold text-[#64748B]">{contact._company || 'Unknown Company'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#0F172A]">{contact.email}</span>
                      <span className="text-xs font-medium text-[#64748B]">{contact.mobile || 'No phone'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border font-bold px-3 py-1 rounded-[8px]", contact._status === 'Customer' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' : 'bg-[#E2E8F0] text-[#64748B] border-transparent')}>
                      {contact._status || 'Lead'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border font-bold px-3 py-1 rounded-[8px]", getScoreColor(contact._score || 0))}>
                      {getScoreLabel(contact._score || 0)} {contact._score || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748B] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-[16px] p-2 border-[#E2E8F0] shadow-premium-hover">
                        <DropdownMenuItem onClick={() => onSelectContact(contact)} className="rounded-[10px] font-medium text-[#0F172A]"><Eye className="w-4 h-4 mr-2 text-[#FF6B00]" /> Quick View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMessage(contact)} className="rounded-[10px] font-medium text-[#0F172A]"><MessageSquare className="w-4 h-4 mr-2 text-[#FF6B00]" /> Message</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(contact)} className="rounded-[10px] font-medium text-[#0F172A]"><Edit className="w-4 h-4 mr-2 text-[#FF6B00]" /> Edit Contact</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(contact)} className="rounded-[10px] font-medium text-[#EF4444] hover:bg-[#EF4444]/10 focus:bg-[#EF4444]/10 focus:text-[#EF4444]"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
        <span className="text-sm font-semibold text-[#64748B]">Showing {contacts.length} entries</span>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled>Previous</Button>
          <Button variant="secondary" size="sm" disabled={contacts.length < 10}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default ContactsTable;
