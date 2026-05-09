import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient';

export default function CallOutcomeModal({ isOpen, onClose, lead, onOutcomeSaved }) {
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [callbackDate, setCallbackDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens for a new lead
  useEffect(() => {
    if (isOpen) {
      setOutcome('');
      setNotes('');
      setCallbackDate('');
    }
  }, [isOpen, lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!outcome) {
      toast.error('Please select a call outcome.');
      return;
    }

    if (outcome === 'Callback Scheduled' && !callbackDate) {
      toast.error('Please select a callback date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        callOutcome: outcome,
        notes: notes || undefined,
      };

      if (outcome === 'Callback Scheduled') {
        payload.nextFollowUpDate = new Date(callbackDate).toISOString();
      }

      const response = await apiServerClient.fetch(`/leads/${lead.id}/call-outcome`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save call outcome');
      }

      const updatedLead = await response.json();
      toast.success('Call outcome logged successfully.');
      onOutcomeSaved(updatedLead);
      onClose();
    } catch (error) {
      console.error('Error saving call outcome:', error);
      toast.error(error.message || 'Failed to log call outcome.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Call Outcome</DialogTitle>
          <DialogDescription>
            Record the result of your call with {lead?.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome <span className="text-destructive">*</span></Label>
            <Select value={outcome} onValueChange={setOutcome} required>
              <SelectTrigger id="outcome" className="w-full">
                <SelectValue placeholder="Select call result..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Connected">Connected</SelectItem>
                <SelectItem value="Not Reachable">Not Reachable</SelectItem>
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Not Interested">Not Interested</SelectItem>
                <SelectItem value="Callback Scheduled">Callback Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {outcome === 'Callback Scheduled' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label htmlFor="callbackDate">Callback Date & Time <span className="text-destructive">*</span></Label>
              <Input
                id="callbackDate"
                type="datetime-local"
                value={callbackDate}
                onChange={(e) => setCallbackDate(e.target.value)}
                required
                className="w-full text-foreground"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Call Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summarize the conversation..."
              rows={4}
              className="w-full resize-none text-foreground"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !outcome}>
              {isSubmitting ? 'Saving...' : 'Save Outcome'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}