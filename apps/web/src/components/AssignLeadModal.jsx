import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { UserCheck, Clock, Users, Loader2 } from 'lucide-react';

export default function AssignLeadModal({ isOpen, onClose, selectedLeads = [], onSuccess }) {
  const [agents, setAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  
  const [assignmentType, setAssignmentType] = useState('selected'); // 'selected', 'evenly', 'least_busy'
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const isBulk = selectedLeads.length > 1;

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
      // Reset state on open
      setAssignmentType('selected');
      setSelectedAgentId('');
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    setIsLoadingAgents(true);
    try {
      // Fetch available agents
      const agentsList = await pb.collection('agents').getFullList({
        filter: 'status="available"',
        $autoCancel: false
      });

      // Fetch lead counts for each agent
      const agentsWithStats = await Promise.all(
        agentsList.map(async (agent) => {
          try {
            const leadsRes = await pb.collection('leads').getList(1, 1, {
              filter: `assignedTo="${agent.id}"`,
              $autoCancel: false
            });
            return { 
              ...agent, 
              leadCount: leadsRes.totalItems,
              // Mocking response time as requested (normally fetched from performance table)
              avgResponseTime: Math.floor(Math.random() * 45) + 5 
            };
          } catch (e) {
            return { ...agent, leadCount: 0, avgResponseTime: 0 };
          }
        })
      );

      // Sort alphabetically by name
      agentsWithStats.sort((a, b) => a.name.localeCompare(b.name));
      setAgents(agentsWithStats);
      
      if (agentsWithStats.length > 0) {
        setSelectedAgentId(agentsWithStats[0].id);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load available agents.');
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleAssign = async () => {
    if (assignmentType === 'selected' && !selectedAgentId) {
      toast.error('Please select an agent.');
      return;
    }
    
    if (agents.length === 0) {
      toast.error('No available agents to assign to.');
      return;
    }

    setIsAssigning(true);
    try {
      const updates = [];
      let assignedAgentName = '';

      if (assignmentType === 'selected') {
        const agent = agents.find(a => a.id === selectedAgentId);
        assignedAgentName = agent?.name || 'Agent';
        for (const lead of selectedLeads) {
          updates.push(pb.collection('leads').update(lead.id, { assignedTo: selectedAgentId }, { $autoCancel: false }));
        }
      } 
      else if (assignmentType === 'evenly') {
        assignedAgentName = 'multiple agents';
        let agentIndex = 0;
        for (const lead of selectedLeads) {
          const targetAgent = agents[agentIndex % agents.length];
          updates.push(pb.collection('leads').update(lead.id, { assignedTo: targetAgent.id }, { $autoCancel: false }));
          agentIndex++;
        }
      } 
      else if (assignmentType === 'least_busy') {
        const leastBusyAgent = [...agents].sort((a, b) => a.leadCount - b.leadCount)[0];
        assignedAgentName = leastBusyAgent.name;
        for (const lead of selectedLeads) {
          updates.push(pb.collection('leads').update(lead.id, { assignedTo: leastBusyAgent.id }, { $autoCancel: false }));
        }
      }

      await Promise.all(updates);
      
      toast.success(`${selectedLeads.length} lead(s) assigned to ${assignedAgentName}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error assigning leads:', error);
      toast.error('Failed to assign leads. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'busy': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'offline': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const title = isBulk ? `Assign ${selectedLeads.length} leads to Agent` : `Assign Lead to Agent`;
  const description = isBulk 
    ? `Select how you want to distribute these ${selectedLeads.length} leads among your available agents.`
    : `Select an agent to handle ${selectedLeads[0]?.name || 'this lead'}.`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isAssigning && !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isBulk && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignment Method</label>
              <Select value={assignmentType} onValueChange={setAssignmentType} disabled={isAssigning}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="selected">Assign all to specific agent</SelectItem>
                  <SelectItem value="evenly">Distribute evenly (Round-robin)</SelectItem>
                  <SelectItem value="least_busy">Assign all to least busy agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(!isBulk || assignmentType === 'selected') && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Agent</label>
              
              {isLoadingAgents ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : agents.length === 0 ? (
                <div className="p-4 text-center border rounded-lg bg-muted/50 text-muted-foreground text-sm">
                  No available agents found. Please ensure agents have their status set to 'available'.
                </div>
              ) : (
                <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {agents.map((agent) => (
                    <div 
                      key={agent.id}
                      onClick={() => !isAssigning && setSelectedAgentId(agent.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedAgentId === agent.id 
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary' 
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {agent.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {agent.name}
                            <Badge variant="outline" className={`text-[10px] px-1.5 h-4 border ${getStatusColor(agent.status)}`}>
                              {agent.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {agent.leadCount} active</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{agent.avgResponseTime}m avg</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedAgentId === agent.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                        {selectedAgentId === agent.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={isAssigning || isLoadingAgents || agents.length === 0 || (assignmentType === 'selected' && !selectedAgentId)}
          >
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign {selectedLeads.length} Lead{selectedLeads.length !== 1 && 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}