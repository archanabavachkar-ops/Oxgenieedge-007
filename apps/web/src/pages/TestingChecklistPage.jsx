
import React, { useState } from 'react';
import { Printer, Check, X, CheckSquare, Square, AlertCircle, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';

const TEST_DATA = [
  {
    id: 1,
    title: 'TEST 1: HEALTH CHECK',
    test: 'GET /api/health',
    expected: '{ "status": "ok" }',
    instructions: "Open console (F12), run: fetch('/api/health').then(r => r.json()).then(d => console.log(d))",
    criteria: 'Status 200, response shows "ok"',
  },
  {
    id: 2,
    title: 'TEST 2: CORS CONFIGURATION',
    test: 'Frontend can call backend API',
    expected: 'No CORS errors in console',
    instructions: 'Check browser console (F12) for CORS errors when interacting with app',
    criteria: 'API calls succeed without CORS errors',
  },
  {
    id: 3,
    title: 'TEST 3: RATE LIMITER',
    test: 'Make 200+ requests in 15 minutes',
    expected: 'After 200 requests, get rate limit response',
    instructions: 'Monitor Network tab, count requests, verify rate limit headers',
    criteria: 'Rate limit kicks in at 200 requests',
  },
  {
    id: 4,
    title: 'TEST 4: CONTACTS ENDPOINT',
    test: 'POST /api/contacts with form data',
    expected: '{ "success": true, "id": "..." }',
    instructions: 'Submit contact form, check Data tab for new record',
    criteria: 'Contact saved to database',
  },
  {
    id: 5,
    title: 'TEST 5: ERROR HANDLING',
    test: 'Trigger an error (invalid request)',
    expected: '{ "success": false, "error": "..." }',
    instructions: 'Send malformed request, verify error response',
    criteria: 'Error message is safe (no stack trace)',
  },
  {
    id: 6,
    title: 'TEST 6: DATABASE CONNECTION',
    test: 'Verify PocketBase is connected',
    expected: 'Can read/write records',
    instructions: 'Add record in Data tab, reload page, verify record still exists',
    criteria: 'Data persists after page reload',
  },
  {
    id: 7,
    title: 'TEST 7: ENVIRONMENT VARIABLES',
    test: 'Verify all env vars are set correctly',
    expected: 'NODE_ENV=production, PORT=3001, POCKETBASE_URL, CORS_ORIGIN',
    instructions: 'Check .env file matches .env.example',
    criteria: 'All required variables are configured',
  }
];

export default function TestingChecklistPage() {
  const [testStates, setTestStates] = useState(
    TEST_DATA.reduce((acc, test) => {
      acc[test.id] = { completed: false, status: null, notes: '' };
      return acc;
    }, {})
  );

  const handleToggleComplete = (id) => {
    setTestStates(prev => ({
      ...prev,
      [id]: { ...prev[id], completed: !prev[id].completed }
    }));
  };

  const handleSetStatus = (id, status) => {
    setTestStates(prev => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        status: prev[id].status === status ? null : status,
        // Auto-complete if they mark pass/fail and it wasn't completed
        completed: prev[id].status !== status ? true : prev[id].completed
      }
    }));
  };

  const handleNotesChange = (id, notes) => {
    setTestStates(prev => ({
      ...prev,
      [id]: { ...prev[id], notes }
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const completedCount = Object.values(testStates).filter(t => t.completed).length;
  const progressPercentage = Math.round((completedCount / TEST_DATA.length) * 100);

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-8 rounded-2xl border shadow-sm print:border-none print:shadow-none print:p-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Phase 4: Final Testing Checklist</h1>
            <p className="text-lg text-muted-foreground mt-2">Backend API Endpoint Testing Before Deployment</p>
          </div>
          <Button onClick={handlePrint} className="print:hidden">
            <Printer className="w-4 h-4 mr-2" />
            Print Checklist
          </Button>
        </header>

        {/* Progress Tracker */}
        <section className="bg-card p-6 rounded-2xl border shadow-sm print:hidden">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Testing Progress</h2>
              <p className="text-2xl font-bold text-foreground mt-1">{completedCount} of {TEST_DATA.length} Completed</p>
            </div>
            <span className="text-3xl font-extrabold text-primary">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </section>

        {/* Test Sections */}
        <div className="space-y-6 print:space-y-4">
          {TEST_DATA.map((test) => {
            const state = testStates[test.id];
            const isPass = state.status === 'pass';
            const isFail = state.status === 'fail';

            return (
              <Card 
                key={test.id} 
                className={`transition-colors duration-200 overflow-hidden break-inside-avoid print:shadow-none print:border-gray-300 ${
                  state.completed ? 'bg-card' : 'bg-card/50'
                }`}
              >
                {/* Visual Status Indicator Top Bar */}
                <div className={`h-1.5 w-full ${isPass ? 'bg-green-500' : isFail ? 'bg-red-500' : 'bg-muted'}`} />
                
                <CardHeader className="pb-4 border-b bg-muted/10 print:bg-transparent print:border-b-gray-200">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id={`complete-${test.id}`} 
                        checked={state.completed} 
                        onCheckedChange={() => handleToggleComplete(test.id)}
                        className="w-6 h-6 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground print:hidden"
                      />
                      <div className="hidden print:block font-mono font-bold text-lg">
                        [{state.completed ? 'X' : ' '}]
                      </div>
                      <div>
                        <label htmlFor={`complete-${test.id}`} className="text-sm font-bold tracking-wider text-muted-foreground uppercase cursor-pointer">
                          {test.title}
                        </label>
                        <CardTitle className="text-xl mt-1 text-foreground">{test.test}</CardTitle>
                      </div>
                    </div>

                    <div className="flex gap-2 print:hidden w-full md:w-auto">
                      <Button
                        variant={isPass ? "default" : "outline"}
                        className={`flex-1 md:flex-none transition-colors ${
                          isPass ? 'bg-green-600 text-white hover:bg-green-700 border-green-600' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400'
                        }`}
                        onClick={() => handleSetStatus(test.id, 'pass')}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Pass
                      </Button>
                      <Button
                        variant={isFail ? "default" : "outline"}
                        className={`flex-1 md:flex-none transition-colors ${
                          isFail ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' : 'hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                        }`}
                        onClick={() => handleSetStatus(test.id, 'fail')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Fail
                      </Button>
                    </div>

                    {/* Print Status */}
                    <div className="hidden print:flex gap-4 font-bold text-sm">
                      <span>Status: {isPass ? 'PASS' : isFail ? 'FAIL' : 'PENDING'}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-5 text-sm">
                    <div>
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-primary" /> Expected Result
                      </span>
                      <p className="mt-1.5 font-mono text-xs bg-muted p-2.5 rounded-md border text-muted-foreground break-all">
                        {test.expected}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary" /> Instructions
                      </span>
                      <p className="mt-1.5 text-muted-foreground leading-relaxed">
                        {test.instructions}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-primary" /> Pass Criteria
                      </span>
                      <p className="mt-1.5 text-muted-foreground leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/10">
                        {test.criteria}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col h-full">
                    <label htmlFor={`notes-${test.id}`} className="font-semibold text-sm mb-2 text-foreground">
                      Testing Notes & Observations
                    </label>
                    <Textarea
                      id={`notes-${test.id}`}
                      placeholder="Record any findings, error messages, or anomalies here..."
                      className="flex-1 min-h-[150px] resize-none print:border-gray-400 print:min-h-[100px]"
                      value={state.notes}
                      onChange={(e) => handleNotesChange(test.id, e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Troubleshooting Guide */}
        <section className="bg-card rounded-2xl border shadow-sm overflow-hidden break-inside-avoid mt-8 print:shadow-none print:border-gray-300">
          <div className="bg-muted/30 p-6 border-b print:bg-transparent">
            <h2 className="text-xl font-bold text-foreground">Troubleshooting Guide</h2>
            <p className="text-sm text-muted-foreground mt-1">Common solutions for failing tests</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 font-semibold mb-1">CORS Errors</Badge>
              <h3 className="font-medium text-foreground">How to fix</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ensure <code className="text-xs bg-muted px-1 py-0.5 rounded">CORS_ORIGIN</code> in your backend <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file exactly matches your frontend URL without a trailing slash (e.g., <code className="text-xs bg-muted px-1 py-0.5 rounded">https://your-frontend.vercel.app</code>). Restart the backend server after changing.
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 font-semibold mb-1">Rate Limit Issues</Badge>
              <h3 className="font-medium text-foreground">How to verify</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If behind a proxy like Railway/Nginx, ensure <code className="text-xs bg-muted px-1 py-0.5 rounded">app.set('trust proxy', 1)</code> is enabled in Express, otherwise all users share the same IP limit. Check for <code className="text-xs bg-muted px-1 py-0.5 rounded">429 Too Many Requests</code> status in the Network tab.
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 font-semibold mb-1">Database Connection</Badge>
              <h3 className="font-medium text-foreground">How to check</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Verify the <code className="text-xs bg-muted px-1 py-0.5 rounded">POCKETBASE_URL</code> is accessible. Test connection by manually visiting the PocketBase admin dashboard <code className="text-xs bg-muted px-1 py-0.5 rounded">/_/</code> URL in your browser to confirm it's online.
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 font-semibold mb-1">Environment Variables</Badge>
              <h3 className="font-medium text-foreground">How to verify</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare your active deployment environment variables against <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.example</code>. Missing keys often cause silent failures or 500 errors. Ensure <code className="text-xs bg-muted px-1 py-0.5 rounded">NODE_ENV=production</code> to hide stack traces.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
