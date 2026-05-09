import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';

const TestLeadModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: 'Simulated from Integration Hub',
    campaignName: 'Test Campaign',
    adSetName: 'Test Ad Set',
    adName: 'Test Ad'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.phone) {
      toast.error('First Name and Phone are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate by calling the webhook endpoint
      const response = await apiServerClient.fetch('/integrations/facebook/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: `test_lead_${Date.now()}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          campaignName: formData.campaignName,
          adSetName: formData.adSetName,
          adName: formData.adName,
          createdTime: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      toast.success('Test lead created successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to simulate test lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Simulate Facebook Lead</DialogTitle>
          <DialogDescription>
            Send a test payload to verify your integration is capturing leads correctly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSimulate} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleInputChange} 
                placeholder="Maya" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleInputChange} 
                placeholder="Chen" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                placeholder="+1234567890" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="maya@example.com" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input 
              id="campaignName" 
              name="campaignName" 
              value={formData.campaignName} 
              onChange={handleInputChange} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adSetName">Ad Set Name</Label>
              <Input 
                id="adSetName" 
                name="adSetName" 
                value={formData.adSetName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adName">Ad Name</Label>
              <Input 
                id="adName" 
                name="adName" 
                value={formData.adName} 
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simulate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TestLeadModal;