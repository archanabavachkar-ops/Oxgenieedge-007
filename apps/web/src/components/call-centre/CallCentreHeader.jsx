import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, Headphones as Headset, ChevronRight, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const CallCentreHeader = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-6">
          <Link to="/call-centre" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Headset className="h-6 w-6" />
            <span>OmniCenter</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link 
              to="/call-centre" 
              className={`transition-colors ${location.pathname === '/call-centre' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/call-centre/unified-inbox" 
              className={`flex items-center gap-1.5 transition-colors ${location.pathname.includes('/unified-inbox') || location.pathname.includes('/conversations') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Inbox className="h-4 w-4" />
              Unified Inbox
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 text-[10px] bg-primary/10 text-primary">2</Badge>
            </Link>
            <Link 
              to="/call-centre/calls" 
              className={`transition-colors ${location.pathname.includes('/calls') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Calls
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-muted-foreground">Available</span>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground rounded-full">3</Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'Agent'} />
                  <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Agent Name'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || 'agent@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/call-centre/credits">Credits & Usage</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default CallCentreHeader;