import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { MessageSquare, Phone, MessageCircle, Mail, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import CallCentreHeader from '@/components/call-centre/CallCentreHeader';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const CreditsPage = () => {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(null);

  // Mock chart data
  const chartData = [
    { name: 'Mon', sms: 40, calls: 24, whatsapp: 24 },
    { name: 'Tue', sms: 30, calls: 13, whatsapp: 22 },
    { name: 'Wed', sms: 20, calls: 48, whatsapp: 22 },
    { name: 'Thu', sms: 27, calls: 39, whatsapp: 20 },
    { name: 'Fri', sms: 18, calls: 48, whatsapp: 21 },
    { name: 'Sat', sms: 23, calls: 38, whatsapp: 25 },
    { name: 'Sun', sms: 34, calls: 43, whatsapp: 21 },
  ];

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await apiServerClient.fetch('/call-centre/credits');
        const data = await response.json();
        
        if (data.success) {
          setCredits(data.credits);
        } else {
          throw new Error(data.error || 'Failed to fetch credits');
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
        toast.error('Could not load credit usage');
        // Fallback mock data for UI demonstration
        setCredits({
          sms_used: 850, sms_limit: 1000,
          calls_used: 420, calls_limit: 500,
          whatsapp_used: 120, whatsapp_limit: 1000,
          email_used: 4500, email_limit: 10000,
          reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

  const calculatePercentage = (used, limit) => {
    if (!limit) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Helmet>
        <title>Credits & Usage - OmniCenter</title>
      </Helmet>
      <CallCentreHeader />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Credits & Usage</h1>
            <p className="text-muted-foreground">Monitor your monthly omnichannel communication limits.</p>
          </div>
          <Button className="gap-2">
            <Zap className="h-4 w-4" /> Upgrade Plan
          </Button>
        </div>

        {/* Alerts */}
        {!loading && credits && calculatePercentage(credits.sms_used, credits.sms_limit) >= 80 && (
          <div className="bg-warning/10 border border-warning/20 text-warning-foreground p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-warning">SMS Limit Approaching</h4>
              <p className="text-sm opacity-90">You have used {calculatePercentage(credits.sms_used, credits.sms_limit)}% of your monthly SMS limit. Upgrade your plan to avoid service interruption.</p>
            </div>
          </div>
        )}

        {/* Credit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* SMS */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                SMS Credits
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-16 w-full" /> : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold">{credits?.sms_used || 0}</span>
                    <span className="text-sm text-muted-foreground">/ {credits?.sms_limit || 0}</span>
                  </div>
                  <Progress 
                    value={calculatePercentage(credits?.sms_used, credits?.sms_limit)} 
                    className="h-2"
                    indicatorClassName={getProgressColor(calculatePercentage(credits?.sms_used, credits?.sms_limit))}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {calculatePercentage(credits?.sms_used, credits?.sms_limit)}% used
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Calls */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Voice Minutes
                <Phone className="h-4 w-4 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-16 w-full" /> : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold">{credits?.calls_used || 0}</span>
                    <span className="text-sm text-muted-foreground">/ {credits?.calls_limit || 0}</span>
                  </div>
                  <Progress 
                    value={calculatePercentage(credits?.calls_used, credits?.calls_limit)} 
                    className="h-2"
                    indicatorClassName={getProgressColor(calculatePercentage(credits?.calls_used, credits?.calls_limit))}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {calculatePercentage(credits?.calls_used, credits?.calls_limit)}% used
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                WhatsApp Messages
                <MessageCircle className="h-4 w-4 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-16 w-full" /> : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold">{credits?.whatsapp_used || 0}</span>
                    <span className="text-sm text-muted-foreground">/ {credits?.whatsapp_limit || 0}</span>
                  </div>
                  <Progress 
                    value={calculatePercentage(credits?.whatsapp_used, credits?.whatsapp_limit)} 
                    className="h-2"
                    indicatorClassName={getProgressColor(calculatePercentage(credits?.whatsapp_used, credits?.whatsapp_limit))}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {calculatePercentage(credits?.whatsapp_used, credits?.whatsapp_limit)}% used
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Email Sends
                <Mail className="h-4 w-4 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-16 w-full" /> : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold">{credits?.email_used || 0}</span>
                    <span className="text-sm text-muted-foreground">/ {credits?.email_limit || 0}</span>
                  </div>
                  <Progress 
                    value={calculatePercentage(credits?.email_used, credits?.email_limit)} 
                    className="h-2"
                    indicatorClassName={getProgressColor(calculatePercentage(credits?.email_used, credits?.email_limit))}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {calculatePercentage(credits?.email_used, credits?.email_limit)}% used
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>Daily communication volume for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="calls" name="Voice Calls" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="sms" name="SMS" stackId="a" fill="hsl(var(--primary)/0.6)" />
                    <Bar dataKey="whatsapp" name="WhatsApp" stackId="a" fill="hsl(var(--primary)/0.3)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Cycle</CardTitle>
              <CardDescription>Your current plan details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Plan</p>
                <p className="text-xl font-bold">Professional Tier</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Next Reset Date</p>
                <p className="text-lg font-medium">
                  {loading ? <Skeleton className="h-6 w-32" /> : credits?.reset_date ? new Date(credits.reset_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '1st of next month'}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">Need more capacity? Upgrade your plan to increase limits across all channels.</p>
                <Button className="w-full">View Upgrade Options</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreditsPage;