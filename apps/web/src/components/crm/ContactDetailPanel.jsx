import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { X, Mail, Phone, Calendar, ArrowUpRight, TrendingUp, User, Building2, MapPin, CheckCircle2, MessageSquare, Plus, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const ContactDetailPanel = ({ contact, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('timeline');

  if (!isOpen || !contact) return null;

  const score = contact._score || 65;
  const isHot = score >= 80;

  const mockActivities = [
    { type: 'email', title: 'Opened pricing email', time: '2 hours ago', icon: Mail, color: 'text-blue-500 bg-blue-100' },
    { type: 'site', title: 'Visited /pricing page', time: '1 day ago', icon: ArrowUpRight, color: 'text-primary bg-primary/10' },
    { type: 'form', title: 'Submitted contact form', time: '3 days ago', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-100' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] md:w-[500px] bg-background shadow-2xl z-50 border-l border-border flex flex-col overflow-hidden"
          >
            {/* Header / Basic Info */}
            <div className="p-6 border-b border-border bg-card relative">
              <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </Button>
              
              <div className="flex items-start gap-4 mt-2">
                <Avatar className="w-16 h-16 border-2 border-border shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {contact.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground leading-none mb-1">{contact.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
                    <Building2 className="w-3.5 h-3.5" /> {contact._company || 'Independent'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted">
                      {contact._status || 'Lead'}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      isHot ? "border-destructive text-destructive bg-destructive/5" : "border-amber-500 text-amber-600 bg-amber-50"
                    )}>
                      {isHot ? '🔥 Hot Lead' : 'Warm Lead'} • Score {score}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</span>
                  <a href={`mailto:${contact.email}`} className="text-sm font-medium text-primary hover:underline truncate">
                    {contact.email}
                  </a>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</span>
                  <a href={`tel:${contact.mobile}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    {contact.mobile || 'Not provided'}
                  </a>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {['timeline', 'conversations', 'intelligence'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors",
                    activeTab === tab 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
              
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Activity Timeline</h3>
                    <Button variant="outline" size="sm" className="h-8"><Plus className="w-3.5 h-3.5 mr-1" /> Add Note</Button>
                  </div>
                  
                  <div className="relative pl-3 border-l-2 border-border/50 space-y-6">
                    {mockActivities.map((act, idx) => {
                      const Icon = act.icon;
                      return (
                        <div key={idx} className="relative pl-6">
                          <div className={cn("absolute -left-[35px] top-0 p-1.5 rounded-full ring-4 ring-background", act.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="bg-card border border-border p-3 rounded-xl shadow-sm">
                            <p className="text-sm font-medium text-foreground mb-1">{act.title}</p>
                            <p className="text-xs text-muted-foreground">{act.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="ghost" className="w-full text-muted-foreground text-sm mt-4">Load more activity</Button>
                </div>
              )}

              {activeTab === 'intelligence' && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-5 text-center shadow-sm">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Predictive Lead Score</h3>
                    <div className={cn(
                      "text-5xl font-extrabold mb-2",
                      isHot ? "text-destructive" : "text-amber-500"
                    )}>
                      {score}
                    </div>
                    <div className="flex items-center justify-center text-sm font-medium text-emerald-600 gap-1">
                      <TrendingUp className="w-4 h-4" /> +12 pts this week
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Score Factors</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> High email open rate (+15)</li>
                      <li className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Matching ideal ICP (+20)</li>
                      <li className="flex items-center gap-2 text-amber-500"><X className="w-4 h-4" /> No phone number (-5)</li>
                    </ul>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <h4 className="font-semibold text-primary flex items-center gap-2 mb-2 text-sm">
                      <Sparkles className="w-4 h-4" /> AI Recommended Action
                    </h4>
                    <p className="text-sm text-primary/80 mb-3 leading-relaxed">
                      This lead shows high intent on the pricing page. Recommend sending a personalized WhatsApp message to offer a quick 5-min demo.
                    </p>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90">Draft Message</Button>
                  </div>
                </div>
              )}

              {activeTab === 'conversations' && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      <h4 className="font-semibold text-foreground text-sm">WhatsApp Chat</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-muted p-2.5 rounded-lg text-sm text-foreground w-11/12">
                        Hi, I'm interested in your services. Can we schedule a call?
                      </div>
                      <div className="bg-primary/10 text-primary p-2.5 rounded-lg text-sm w-11/12 ml-auto">
                        Absolutely! Would tomorrow at 2 PM work for you?
                      </div>
                    </div>
                    <Button variant="link" className="w-full text-xs text-primary mt-2 h-auto py-2"><ExternalLink className="w-3 h-3 mr-1" /> Open full chat</Button>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <h4 className="font-semibold text-foreground text-sm">Last Email Thread</h4>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1 truncate">{contact.subject || 'Welcome to OxgenieEdge'}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {contact.message || 'Thanks for signing up. We are excited to have you on board...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer Actions */}
            <div className="p-4 border-t border-border bg-card grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">Schedule Call</Button>
              <Button className="w-full bg-primary text-white hover:bg-primary/90">Send Email</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactDetailPanel;