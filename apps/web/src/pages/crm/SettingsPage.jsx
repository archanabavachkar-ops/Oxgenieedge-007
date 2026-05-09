import React, { useState } from 'react';
import CRMLayout from '@/layouts/CRMLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { toast } from 'sonner';
import { Save, Building2, Mail, Globe, Clock } from 'lucide-react';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'Acme Corp',
    email: 'admin@acmecorp.com',
    timezone: 'UTC',
    language: 'English'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Settings saved:', formData);
      toast.success('Settings saved successfully.');
      setIsSaving(false);
    }, 800);
  };

  return (
    <CRMLayout
      title="Settings"
      description="Manage your organization preferences and system configurations."
      breadcrumbs={[
        { label: 'CRM', path: '/admin/crm/dashboard' },
        { label: 'Settings' }
      ]}
    >
      <div className="max-w-3xl">
        <form onSubmit={handleSave}>
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update your company details and localization settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> Company Name
                  </Label>
                  <Input 
                    id="companyName" 
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    required
                    className="max-w-md"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" /> Contact Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    className="max-w-md"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" /> Timezone
                  </Label>
                  <div className="max-w-md">
                    <Select value={formData.timezone} onValueChange={(val) => handleChange('timezone', val)}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                        <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                        <SelectItem value="MST">MST (Mountain Standard Time)</SelectItem>
                        <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="language" className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" /> System Language
                  </Label>
                  <div className="max-w-md">
                    <Select value={formData.language} onValueChange={(val) => handleChange('language', val)}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Settings
                </Button>
              </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </CRMLayout>
  );
}