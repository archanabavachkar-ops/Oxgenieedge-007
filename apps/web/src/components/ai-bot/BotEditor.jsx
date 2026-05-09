import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

const BotEditor = ({ formData, setFormData }) => {

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">General Profile</CardTitle>
          <CardDescription>Basic information and identity for this bot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="e.g., Support Assistant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Primary Language</Label>
              <Select value={formData.language} onValueChange={(v) => handleChange('language', v)}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Internal)</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="What is this bot designed to do?"
              className="resize-none h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Personality Type</Label>
            <Select value={formData.personality} onValueChange={(v) => handleChange('personality', v)}>
              <SelectTrigger id="personality">
                <SelectValue placeholder="Select personality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional & Formal</SelectItem>
                <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                <SelectItem value="technical">Technical & Precise</SelectItem>
                <SelectItem value="casual">Casual & Conversational</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Behavior Settings</CardTitle>
          <CardDescription>Configure how the bot evaluates and responds to input.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Confidence Threshold</Label>
              <span className="text-sm text-muted-foreground font-medium tabular-nums">{formData.confidenceThreshold}%</span>
            </div>
            <Slider 
              value={[formData.confidenceThreshold]} 
              min={0} 
              max={100} 
              step={1}
              onValueChange={([val]) => handleChange('confidenceThreshold', val)}
              className="[&_[role=slider]]:bg-bot-primary [&_[role=slider]]:border-bot-primary"
            />
            <p className="text-xs text-muted-foreground">
              If the bot's confidence falls below this threshold, it will trigger the fallback behavior.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Response Timeout (seconds)</Label>
              <Input 
                id="timeout" 
                type="number"
                min={1}
                max={60}
                value={formData.timeout} 
                onChange={(e) => handleChange('timeout', parseInt(e.target.value, 10))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handoff">Handoff Trigger</Label>
              <Select value={formData.handoff} onValueChange={(v) => handleChange('handoff', v)}>
                <SelectTrigger id="handoff">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low_confidence">Low Confidence</SelectItem>
                  <SelectItem value="customer_request">Customer Request ("Talk to human")</SelectItem>
                  <SelectItem value="escalation">Sentiment Escalation</SelectItem>
                  <SelectItem value="never">Never (Fully Automated)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-4 border-t flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active-status" className="text-base">Bot Status</Label>
              <p className="text-sm text-muted-foreground">Enable or disable this bot globally.</p>
            </div>
            <Switch 
              id="active-status" 
              checked={formData.isActive}
              onCheckedChange={(v) => handleChange('isActive', v)}
              className="data-[state=checked]:bg-bot-primary"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotEditor;