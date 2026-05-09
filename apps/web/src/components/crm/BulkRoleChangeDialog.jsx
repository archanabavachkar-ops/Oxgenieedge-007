import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';

const BulkRoleChangeDialog = ({ isOpen, onClose, onSuccess, selectedUsers, allUsers }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState('');

  const handleApply = async () => {
    if (!newRole) {
      toast.error('Please select a new role');
      return;
    }

    // Validation: Prevent changing all admins to non-admin
    if (newRole !== 'admin') {
      const selectedIds = selectedUsers.map(u => u.id);
      const unselectedAdmins = allUsers.filter(u => u.role === 'admin' && !selectedIds.includes(u.id));
      
      if (unselectedAdmins.length === 0) {
        toast.error('Cannot change role: You must leave at least one admin user.');
        return;
      }
    }

    setLoading(true);
    try {
      const promises = selectedUsers.map(user => {
        // Skip if user is trying to demote themselves
        if (user.id === currentUser?.id && user.role === 'admin' && newRole !== 'admin') {
          throw new Error('You cannot remove your own admin privileges in a bulk action.');
        }
        return pb.collection('users').update(user.id, { role: newRole }, { $autoCancel: false });
      });

      await Promise.all(promises);
      
      toast.success(`Role updated for ${selectedUsers.length} users`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error in bulk role change:', error);
      toast.error(error.message || 'Failed to update some users');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedUsers || selectedUsers.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Role for Selected Users</DialogTitle>
          <DialogDescription>
            You are about to change the role for {selectedUsers.length} users. Select the new role below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New Role</Label>
            <Select value={newRole} onValueChange={setNewRole} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                <SelectItem value="manager">Manager (Team Access)</SelectItem>
                <SelectItem value="employee">Employee (Standard Access)</SelectItem>
                <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Affected Users</Label>
            <ScrollArea className="h-[120px] w-full rounded-md border p-2 bg-muted/30">
              <ul className="space-y-1">
                {selectedUsers.map(user => (
                  <li key={user.id} className="text-sm text-muted-foreground flex justify-between">
                    <span className="truncate pr-2">{user.name || user.email}</span>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded capitalize">{user.role}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply} disabled={loading || !newRole}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkRoleChangeDialog;