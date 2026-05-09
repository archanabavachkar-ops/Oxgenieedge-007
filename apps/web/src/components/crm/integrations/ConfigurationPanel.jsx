import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ConfigurationPanel = ({ integration }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    autoSync: true,
    syncFrequency: 'hourly',
    syncContacts: true,
    syncDeals: false,
    createLeads: true
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Configuration saved successfully');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Sync Settings</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Auto Sync</Label>
            <p className="text-sm text-muted-foreground">Automatically sync data in the background</p>
          </div>
          <Switch 
            checked={config.autoSync} 
            onCheckedChange={(checked) => setConfig({...config, autoSync: checked})} 
          />
        </div>

        <div className="space-y-2">
          <Label>Sync Frequency</Label>
          <Select 
            value={config.syncFrequency} 
            onValueChange={(val) => setConfig({...config, syncFrequency: val})}
            disabled={!config.autoSync}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time (Webhooks)</SelectItem>
              <SelectItem value="hourly">Every Hour</SelectItem>
              <SelectItem value="daily">Once a Day</SelectItem>
              <SelectItem value="weekly">Once a Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold border-b pb-2">Feature Toggles</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Sync Contacts</Label>
            <p className="text-sm text-muted-foreground">Import and update contacts automatically</p>
          </div>
          <Switch 
            checked={config.syncContacts} 
            onCheckedChange={(checked) => setConfig({...config, syncContacts: checked})} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Sync Deals/Orders</Label>
            <p className="text-sm text-muted-foreground">Import transaction data into pipeline</p>
          </div>
          <Switch 
            checked={config.syncDeals} 
            onCheckedChange={(checked) => setConfig({...config, syncDeals: checked})} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Create Leads</Label>
            <p className="text-sm text-muted-foreground">Create new leads from incoming events</p>
          </div>
          <Switch 
            checked={config.createLeads} 
            onCheckedChange={(checked) => setConfig({...config, createLeads: checked})} 
          />
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationPanel;