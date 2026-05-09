
import React from 'react';
import { 
  Plus, 
  UserPlus, 
  CheckCircle, 
  MessageCircle, 
  Edit, 
  Trash, 
  Activity,
  Mail,
  Phone
} from 'lucide-react';

const ActivityIcon = ({ eventType, className = "" }) => {
  const getIconConfig = (type) => {
    const normalizedType = (type || '').toLowerCase();
    
    if (normalizedType.includes('create') || normalizedType === 'new lead') {
      return { icon: Plus, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    }
    if (normalizedType.includes('assign')) {
      return { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' };
    }
    if (normalizedType.includes('status') || normalizedType.includes('qualif')) {
      return { icon: CheckCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' };
    }
    if (normalizedType.includes('message') || normalizedType.includes('chat')) {
      return { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    }
    if (normalizedType.includes('email')) {
      return { icon: Mail, color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
    }
    if (normalizedType.includes('call') || normalizedType.includes('phone')) {
      return { icon: Phone, color: 'text-teal-500', bg: 'bg-teal-500/10' };
    }
    if (normalizedType.includes('update') || normalizedType.includes('edit')) {
      return { icon: Edit, color: 'text-cyan-500', bg: 'bg-cyan-500/10' };
    }
    if (normalizedType.includes('delete') || normalizedType.includes('remove')) {
      return { icon: Trash, color: 'text-red-500', bg: 'bg-red-500/10' };
    }
    
    // Default fallback
    return { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-500/10' };
  };

  const config = getIconConfig(eventType);
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center justify-center rounded-full p-2 ${config.bg} ${className}`}>
      <IconComponent className={`h-4 w-4 ${config.color}`} />
    </div>
  );
};

export default ActivityIcon;
