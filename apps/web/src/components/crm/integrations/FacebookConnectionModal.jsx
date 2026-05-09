import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from 'sonner';
import { Loader2, ExternalLink } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';

const FacebookConnectionModal = ({ isOpen, onClose, onConnected }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    facebookAppId: '',
    facebookAppSecret: '',
    facebookPageId: '',
    facebookAccessToken: ''
  });

  const isFormValid = Object.values(formData).every((val) => val.trim().length > 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const response = await apiServerClient.fetch('/integrations/facebook/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Connection failed');
      }

      toast.success('Facebook Lead Ads connected successfully!');
      if (onConnected) onConnected();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to connect. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Connect Facebook Lead Ads</DialogTitle>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
              Step 1 of 3
            </span>
          </div>
          <DialogDescription>
            Enter your Facebook Developer credentials to authorize CRM access to your Lead Ads.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConnect} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="facebookAppId">App ID</Label>
            <Input 
              id="facebookAppId" 
              name="facebookAppId" 
              value={formData.facebookAppId} 
              onChange={handleInputChange} 
              placeholder="e.g. 123456789012345" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookAppSecret">App Secret</Label>
            <Input 
              id="facebookAppSecret" 
              name="facebookAppSecret" 
              type="password"
              value={formData.facebookAppSecret} 
              onChange={handleInputChange} 
              placeholder="Enter App Secret" 
              required 
              className="text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookPageId">Page ID</Label>
            <Input 
              id="facebookPageId" 
              name="facebookPageId" 
              value={formData.facebookPageId} 
              onChange={handleInputChange} 
              placeholder="e.g. 987654321098765" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookAccessToken">System User Access Token</Label>
            <Input 
              id="facebookAccessToken" 
              name="facebookAccessToken" 
              type="password"
              value={formData.facebookAccessToken} 
              onChange={handleInputChange} 
              placeholder="EAAI... (Long-lived token)" 
              required 
              className="text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="pt-2">
            <a 
              href="https://developers.facebook.com/docs/development/create-an-app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center"
            >
              Get Credentials Guide <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FacebookConnectionModal;