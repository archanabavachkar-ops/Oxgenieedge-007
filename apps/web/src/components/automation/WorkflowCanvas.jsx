import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, GitBranch, Zap, Clock, MessageSquare, Headphones as HeadphonesIcon, Globe, ZoomIn, ZoomOut, Maximize, Plus, Trash2, Settings2 } from 'lucide-react';

const NODE_TYPES = {
  trigger: { icon: Play, label: 'Trigger', color: 'bg-emerald-500' },
  condition: { icon: GitBranch, label: 'Condition', color: 'bg-amber-500' },
  action: { icon: Zap, label: 'Action', color: 'bg-automation-primary' },
  delay: { icon: Clock, label: 'Delay', color: 'bg-slate-500' },
  bot_response: { icon: MessageSquare, label: 'Bot Response', color: 'bg-bot-primary' },
  handoff: { icon: HeadphonesIcon, label: 'Agent Handoff', color: 'bg-rose-500' },
  webhook: { icon: Globe, label: 'Webhook', color: 'bg-indigo-500' }
};

const WorkflowCanvas = ({ initialNodes = [], onSave }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);

  // Initialize with a trigger if empty
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([{
        id: 'node-1',
        type: 'trigger',
        x: 300,
        y: 50,
        data: { name: 'Workflow Start' }
      }]);
    }
  }, []);

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const type = e.dataTransfer.getData('application/reactflow');
    if (!type || !NODE_TYPES[type]) return;

    const reactFlowBounds = canvasRef.current.getBoundingClientRect();
    
    // Adjust for scale
    const x = (e.clientX - reactFlowBounds.left) / scale;
    const y = (e.clientY - reactFlowBounds.top) / scale;

    const newNode = {
      id: `node-${Date.now()}`,
      type,
      x,
      y,
      data: { name: `New ${NODE_TYPES[type].label}` }
    };

    setNodes(nds => [...nds, newNode]);
    setSelectedNode(newNode.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const updateNodePosition = (id, newX, newY) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, x: newX, y: newY } : n));
  };

  const removeNode = (id) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    if (selectedNode === id) setSelectedNode(null);
  };

  // Simple SVG lines drawing sequence based on Y-position sort (mocking a linear flow for visual completeness)
  const sortedNodes = [...nodes].sort((a, b) => a.y - b.y);

  return (
    <div className="flex h-[70vh] border border-border/50 rounded-2xl overflow-hidden bg-background">
      {/* Sidebar / Toolbox */}
      <div className="w-64 bg-card border-r border-border/50 flex flex-col z-10 shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Node Library</h3>
        </div>
        <div className="p-3 space-y-2 overflow-y-auto flex-1">
          {Object.entries(NODE_TYPES).map(([type, info]) => {
            const Icon = info.icon;
            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => handleDragStart(e, type)}
                className="flex items-center gap-3 p-3 bg-muted/20 hover:bg-muted/50 border border-border/50 rounded-xl cursor-grab transition-colors"
              >
                <div className={`p-2 rounded-lg ${info.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{info.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a]"
           style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        
        <div className="absolute top-4 right-4 z-20 flex gap-2 bg-card/80 backdrop-blur-md p-1.5 rounded-lg border shadow-sm">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
          <div className="h-8 flex items-center px-2 text-xs font-medium tabular-nums w-12 justify-center">{Math.round(scale * 100)}%</div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(s => Math.min(2, s + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
          <div className="w-px h-6 bg-border mx-1 my-auto" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(1)}><Maximize className="h-4 w-4" /></Button>
        </div>

        <div 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full transform-origin-top-left"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={(e) => { if(e.target === canvasRef.current) setSelectedNode(null); }}
        >
          <div style={{ transform: `scale(${scale})`, width: '100%', height: '100%', transformOrigin: '0 0' }}>
            
            {/* Draw connections (simplified sequential flow drawing for demonstration) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {sortedNodes.map((node, idx) => {
                if (idx === sortedNodes.length - 1) return null;
                const nextNode = sortedNodes[idx + 1];
                return (
                  <path 
                    key={`edge-${node.id}-${nextNode.id}`}
                    d={`M ${node.x + 120} ${node.y + 60} C ${node.x + 120} ${node.y + 100}, ${nextNode.x + 120} ${nextNode.y - 40}, ${nextNode.x + 120} ${nextNode.y}`}
                    stroke="var(--automation-primary)" 
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 4"
                    className="opacity-50"
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const info = NODE_TYPES[node.type];
              const Icon = info?.icon || Zap;
              const isSelected = selectedNode === node.id;
              
              return (
                <motion.div
                  key={node.id}
                  drag
                  dragMomentum={false}
                  onDrag={(e, info) => updateNodePosition(node.id, node.x + info.delta.x / scale, node.y + info.delta.y / scale)}
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); }}
                  className={`absolute w-[240px] shadow-sm rounded-xl border-2 transition-all cursor-move bg-card z-10 ${isSelected ? 'border-automation-primary ring-4 ring-automation-primary/20 shadow-md' : 'border-border'}`}
                  style={{ x: node.x, y: node.y }}
                >
                  <div className="flex items-center gap-3 p-3 border-b border-border/50">
                    <div className={`p-1.5 rounded-md ${info.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{node.data.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{info.label}</p>
                    </div>
                  </div>
                  
                  {/* Connection points */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-background border-2 border-muted-foreground/30 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-background border-2 border-automation-primary/50 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-automation-primary rounded-full" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 bg-card border-l border-border/50 flex flex-col z-10 shadow-sm animate-in slide-in-from-right-8 duration-200">
          <div className="p-4 border-b flex justify-between items-center bg-muted/10">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-automation-primary" /> Properties
            </h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeNode(selectedNode)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {nodes.filter(n => n.id === selectedNode).map(node => (
              <div key="props" className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Node Name</label>
                  <input 
                    type="text" 
                    value={node.data.name} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(nds => nds.map(n => n.id === node.id ? {...n, data: {...n.data, name: val}} : n));
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border/50">
                  Select a node specific configuration here. In a complete app, this panel maps dynamic fields based on node type.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowCanvas;