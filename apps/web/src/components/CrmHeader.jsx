
import React from 'react';
import { Menu, Search, ChevronDown, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '@/components/crm/NotificationCenter.jsx';

const CrmHeader = ({ onMenuClick }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/admin/login');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD';
  };

  return (
    <header className="h-20 glass-panel border-b border-[#E2E8F0] dark:border-border flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden text-[#0F172A] dark:text-foreground" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="hidden md:flex relative w-full max-w-md group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#FF6B00] transition-colors" />
          <Input 
            type="text" 
            placeholder="Search leads, tasks, campaigns..." 
            className="pl-11 bg-[#F8FAFC] dark:bg-background border-transparent hover:border-[#E2E8F0] focus-visible:bg-white transition-all duration-300 rounded-[16px] h-12"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="relative">
          <NotificationCenter />
        </div>

        <div className="h-8 w-px bg-[#E2E8F0] dark:bg-border mx-1 hidden sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 p-1.5 pr-3 hover:bg-[#F8FAFC] dark:hover:bg-muted rounded-[16px] transition-all border border-transparent hover:border-[#E2E8F0] dark:hover:border-border">
              <Avatar className="w-10 h-10 border-2 border-white dark:border-card shadow-sm">
                <AvatarImage src={currentUser?.avatar ? pb.files.getUrl(currentUser, currentUser.avatar) : ''} />
                <AvatarFallback className="bg-gradient-primary text-white text-sm font-bold">
                  {getInitials(currentUser?.name || currentUser?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-sm font-bold leading-none text-[#0F172A] dark:text-foreground font-heading">{currentUser?.name || 'Admin User'}</span>
                <span className="text-xs text-[#FF6B00] capitalize leading-none mt-1.5 font-medium">{currentUser?.role || 'Admin'}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#64748B] hidden sm:block ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 bg-white dark:bg-card rounded-[16px] p-2 border-[#E2E8F0] dark:border-border shadow-premium-hover">
            <DropdownMenuLabel className="font-heading text-[#0F172A] dark:text-foreground">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#E2E8F0] dark:bg-border" />
            <DropdownMenuItem onClick={() => navigate('/admin/crm/settings')} className="rounded-[10px] cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-muted focus:bg-[#F8FAFC]">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#E2E8F0] dark:bg-border" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-[10px] cursor-pointer text-[#EF4444] hover:bg-[#EF4444]/10 focus:bg-[#EF4444]/10 focus:text-[#EF4444] font-medium">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default CrmHeader;
