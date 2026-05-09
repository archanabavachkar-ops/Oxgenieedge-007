import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Loader2 } from 'lucide-react';

export default function BulkStatusChangeDialog({ isOpen, onClose, selectedLeadIds, onSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses = ['New Lead', 'Attempted Contact', 'Connected', 'Qualified', 'Follow-up Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

  const handleUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    if (!selectedLeadIds || selectedLeadIds.length === 0) {
      toast.error('No leads selected');
      return;
    }

    setIsUpdating(true);
    try {
      let updatedCount = 0;
      // Process in batches or sequentially
      for (const leadId of selectedLeadIds) {
        await pb.collection('leads').update(leadId, { status: selectedStatus }, { $autoCancel: false });
        updatedCount++;
      }
      
      toast.success(`${updatedCount} lead(s) updated to ${selectedStatus}`);
      onSuccess();
      onClose();
      setSelectedStatus(''); // Reset for next time
    } catch (error) {
      console.error('Failed to update lead statuses:', error);
      toast.error('Failed to update lead statuses');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
          <DialogDescription>
            Update the status for {selectedLeadIds?.length || 0} selected lead(s).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isUpdating}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={!selectedStatus || isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}