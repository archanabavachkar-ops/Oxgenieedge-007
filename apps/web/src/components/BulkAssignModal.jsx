
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { assignLeadToTeamMember } from '@/api/adminApi';
import { toast } from 'sonner';

const BulkAssignModal = ({ isOpen, onClose, selectedLeads, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelectedUserId('');
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const records = await pb.collection('users').getFullList({
        sort: 'name',
        $autoCancel: false
      });
      setUsers(records);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;
    
    try {
      setIsAssigning(true);
      const promises = selectedLeads.map(lead => 
        assignLeadToTeamMember(lead.id, selectedUserId)
      );
      
      await Promise.all(promises);
      toast.success(`Successfully assigned ${selectedLeads.length} leads.`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error in bulk assign:', error);
      toast.error('Failed to assign some leads. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isAssigning && onClose(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Leads to Team Member</DialogTitle>
          <DialogDescription>
            Select a team member to assign the {selectedLeads?.length || 0} selected lead(s) to.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Team Member</label>
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
              disabled={isLoadingUsers || isAssigning}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingUsers ? "Loading members..." : "Select team member..."} />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
            <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Selected Leads</p>
            <ul className="text-sm space-y-1">
              {selectedLeads?.map(lead => (
                <li key={lead.id} className="truncate">
                  • {lead.name || lead.email || lead.mobile || 'Unnamed Lead'}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedUserId || isAssigning}>
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Leads
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAssignModal;
