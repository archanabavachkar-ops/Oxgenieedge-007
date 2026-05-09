
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  RefreshCw
} from 'lucide-react';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  subDays
} from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { fetchActivitiesWithFilters } from '@/api/adminApi';
import ActivityTimeline from '@/components/ActivityTimeline';

const ActivitiesTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters State
  const [page, setPage] = useState(1);
  const limit = 20;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  
  // Date Range State
  const [dateRangePreset, setDateRangePreset] = useState('All Time');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle Date Preset Changes
  useEffect(() => {
    const today = new Date();
    switch (dateRangePreset) {
      case 'Today':
        setDateRange({ from: startOfDay(today), to: endOfDay(today) });
        break;
      case 'Yesterday':
        const yesterday = subDays(today, 1);
        setDateRange({ from: startOfDay(yesterday), to: endOfDay(yesterday) });
        break;
      case 'This Week':
        setDateRange({ from: startOfWeek(today), to: endOfWeek(today) });
        break;
      case 'This Month':
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case 'All Time':
        setDateRange({ from: null, to: null });
        break;
      case 'Custom':
        // Keep existing custom dates if any
        break;
      default:
        setDateRange({ from: null, to: null });
    }
  }, [dateRangePreset]);

  // Fetch Data
  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchActivitiesWithFilters(page, limit, {
        search: debouncedSearch,
        eventType: eventTypeFilter,
        source: sourceFilter,
        startDate: dateRange.from,
        endDate: dateRange.to || dateRange.from // If only 'from' is selected, use it for 'to' as well
      });
      setActivities(data.activities);
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
      toast.error('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, eventTypeFilter, sourceFilter, dateRange]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleRefresh = () => {
    setPage(1);
    loadActivities();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities Timeline</h1>
          <p className="text-muted-foreground mt-1">Track all events, interactions, and updates across your CRM.</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
          Refresh
        </Button>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by lead name, email, or description..." 
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-full sm:w-[160px] bg-background">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Events</SelectItem>
                  <SelectItem value="Lead Created">Lead Created</SelectItem>
                  <SelectItem value="Lead Assigned">Lead Assigned</SelectItem>
                  <SelectItem value="Status Changed">Status Changed</SelectItem>
                  <SelectItem value="Message Received">Message Received</SelectItem>
                  <SelectItem value="Email Sent">Email Sent</SelectItem>
                  <SelectItem value="Call Logged">Call Logged</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-[140px] bg-background">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Sources</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Contact Form">Contact Form</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={dateRangePreset} onValueChange={setDateRangePreset}>
                  <SelectTrigger className="w-full sm:w-[140px] bg-background">
                    <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Time">All Time</SelectItem>
                    <SelectItem value="Today">Today</SelectItem>
                    <SelectItem value="Yesterday">Yesterday</SelectItem>
                    <SelectItem value="This Week">This Week</SelectItem>
                    <SelectItem value="This Month">This Month</SelectItem>
                    <SelectItem value="Custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {dateRangePreset === 'Custom' && (
                  <Popover open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-[240px] justify-start text-left font-normal bg-background">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="py-4">
        <ActivityTimeline activities={activities} isLoading={isLoading} />
      </div>

      {/* Pagination */}
      {!isLoading && activities.length > 0 && (
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} activities
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page >= pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesTimeline;
