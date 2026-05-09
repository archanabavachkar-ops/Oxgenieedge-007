import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SetupForm = ({ integration }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [formData, setFormData] = useState({
    apiKey: '',
    webhookUrl: '',
    accountEmail: ''
  });

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsTesting(false);
      if (formData.apiKey.length > 5) {
        setTestResult({ success: true, message: 'Connection successful! Credentials are valid.' });
        toast.success('Connection test passed');
      } else {
        setTestResult({ success: false, message: 'Connection failed. Invalid API Key.' });
        toast.error('Connection test failed');
      }
    }, 1500);
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${integration?.name || 'Integration'} connected successfully!`);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input 
            id="apiKey" 
            type="password" 
            placeholder="Enter your API key" 
            value={formData.apiKey}
            onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
            className="text-foreground"
          />
          <p className="text-xs text-muted-foreground">You can find this in your {integration?.name} developer settings.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountEmail">Account Email</Label>
          <Input 
            id="accountEmail" 
            type="email" 
            placeholder="admin@example.com" 
            value={formData.accountEmail}
            onChange={(e) => setFormData({...formData, accountEmail: e.target.value})}
            className="text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
          <Input 
            id="webhookUrl" 
            type="url" 
            placeholder="https://your-domain.com/webhook" 
            value={formData.webhookUrl}
            onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
            className="text-foreground"
          />
        </div>
      </div>

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"} className={testResult.success ? "border-success text-success bg-success/10" : ""}>
          {testResult.success ? <CheckCircle2 className="h-4 w-4 !text-success" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{testResult.success ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={handleTestConnection} 
          disabled={isTesting || !formData.apiKey}
        >
          {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Connection
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || !formData.apiKey}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Connect
        </Button>
      </div>
    </div>
  );
};

export default SetupForm;