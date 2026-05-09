import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Loader2 } from 'lucide-react';

export default function BulkPriorityChangeDialog({ isOpen, onClose, selectedLeadIds, onSuccess }) {
  const [selectedPriority, setSelectedPriority] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const handleUpdate = async () => {
    if (!selectedPriority) {
      toast.error('Please select a priority');
      return;
    }

    if (!selectedLeadIds || selectedLeadIds.length === 0) {
      toast.error('No leads selected');
      return;
    }

    setIsUpdating(true);
    try {
      let updatedCount = 0;
      for (const leadId of selectedLeadIds) {
        await pb.collection('leads').update(leadId, { priority: selectedPriority }, { $autoCancel: false });
        updatedCount++;
      }
      
      toast.success(`${updatedCount} lead(s) priority updated to ${selectedPriority}`);
      onSuccess();
      onClose();
      setSelectedPriority(''); // Reset for next time
    } catch (error) {
      console.error('Failed to update lead priorities:', error);
      toast.error('Failed to update lead priorities');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Priority</DialogTitle>
          <DialogDescription>
            Update the priority for {selectedLeadIds?.length || 0} selected lead(s).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select value={selectedPriority} onValueChange={setSelectedPriority} disabled={isUpdating}>
              <SelectTrigger>
                <SelectValue placeholder="Select new priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
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
          <Button onClick={handleUpdate} disabled={!selectedPriority || isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Priority'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}