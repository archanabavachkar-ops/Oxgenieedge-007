
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, UserCircle, LogIn, ShieldAlert, Sun, Moon, LayoutGrid, Zap, Users, Box, Briefcase, Building2, Puzzle, HelpCircle, LifeBuoy, Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import Tooltip from '@/components/Tooltip.jsx';
import Breadcrumb from '@/components/Breadcrumb.jsx';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = currentUser && ['admin', 'manager', 'employee'].includes(currentUser.role);
  const isPartner = currentUser && currentUser.collectionName === 'partners';

  const navStructure = [
    { name: 'Home', path: '/', type: 'link' },
    {
      name: 'Solutions',
      type: 'dropdown',
      items: [
        { name: 'AI Chief of Staff', path: '/solutions/ai-chief-of-staff', icon: Bot, description: 'Automate decisions and operations' },
        { name: 'AI Lead Management', path: '/solutions/ai-lead-management', icon: Zap, description: 'Automated lead capture and routing' },
        { name: 'Products', path: '/products', icon: Box, description: 'Explore our comprehensive product suite' },
        { name: 'Services', path: '/services', icon: Briefcase, description: 'Professional consulting and implementation' },
        { name: 'Industries', path: '/industries', icon: Building2, description: 'Tailored solutions for your sector' },
      ]
    },
    {
      name: 'Platform',
      type: 'dropdown',
      items: [
        { name: 'CRM System', path: '/platform/crm-system', icon: LayoutGrid, description: 'Manage customer relationships effectively' },
        { name: 'AI Assistant', path: '/platform/ai-assistant', icon: Zap, description: 'Intelligent automation and insights' },
        { name: 'Partner Portal', path: '/platform/partner-portal', icon: Users, description: 'Collaborate and grow your business' },
      ]
    },
    {
      name: 'Resources',
      type: 'dropdown',
      items: [
        { name: 'Integrations', path: '/resources/integrations', icon: Puzzle, description: 'Connect with your favorite tools' },
        { name: 'FAQ', path: '/faq', icon: HelpCircle, description: 'Common questions answered' },
        { name: 'Help Center', path: '/resources/help-center', icon: LifeBuoy, description: 'Get support and detailed guides' },
      ]
    },
    { name: 'Pricing', path: '/pricing', type: 'link' },
    { name: 'Contact', path: '/contact', type: 'link' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path) && (path !== '/' || location.pathname === '/');
  };

  const isDropdownActive = (items) => {
    return items.some(item => isActive(item.path));
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const getDashboardLink = () => {
    if (isPartner) return "/partners/dashboard";
    if (isAdmin) return "/admin/crm/dashboard";
    return "/dashboard";
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled 
            ? 'glass-navbar shadow-premium' 
            : 'bg-transparent'
        }`}
        style={{ height: 'var(--header-height)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-smooth">
              <div className="w-10 h-10 bg-gradient-orange rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-orange group-active:scale-95">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">Oxgenie<span className="text-primary">Edge</span></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-8">
              <ul className="flex items-center space-x-1">
                {navStructure.map((item, index) => (
                  <li key={index} className="relative group">
                    {item.type === 'link' ? (
                      <Link
                        to={item.path}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isActive(item.path)
                            ? 'text-primary bg-primary/10 shadow-glow-orange-sm'
                            : 'text-foreground/80 hover:text-primary hover:bg-muted'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <div 
                        className="relative"
                        onMouseEnter={() => setActiveDropdown(item.name)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <button
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            isDropdownActive(item.items) || activeDropdown === item.name
                              ? 'text-primary bg-primary/5'
                              : 'text-foreground/80 hover:text-primary hover:bg-muted'
                          }`}
                          aria-expanded={activeDropdown === item.name}
                          aria-haspopup="true"
                        >
                          {item.name}
                          <ChevronDown className={`w-4 h-4 transition-all duration-300 ${activeDropdown === item.name ? 'rotate-180 text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                        </button>

                        {/* Dropdown Menu */}
                        <div 
                          className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300 ease-out origin-top ${
                            activeDropdown === item.name 
                              ? 'opacity-100 visible translate-y-0 scale-100' 
                              : 'opacity-0 invisible -translate-y-2 scale-95'
                          }`}
                        >
                          <div className="w-[320px] p-2 rounded-2xl glass-card border border-white/10 shadow-premium">
                            <div className="flex flex-col gap-1">
                              {item.items.map((subItem, subIndex) => {
                                const Icon = subItem.icon;
                                return (
                                  <Link
                                    key={subIndex}
                                    to={subItem.path}
                                    className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                      isActive(subItem.path)
                                        ? 'bg-primary/10 text-primary shadow-glow-orange-sm'
                                        : 'text-foreground hover:bg-muted hover:text-primary'
                                    }`}
                                  >
                                    <div className={`mt-0.5 p-2 rounded-lg transition-colors ${isActive(subItem.path) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className={`text-sm font-medium ${isActive(subItem.path) ? 'text-primary' : 'text-foreground'}`}>
                                        {subItem.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                        {subItem.description}
                                      </div>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <Tooltip content="Toggle theme" side="bottom">
                <button
                  onClick={() => toggleTheme()}
                  className="p-2.5 rounded-full bg-white/5 text-foreground/70 hover:bg-primary/10 hover:text-primary transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </Tooltip>

              {currentUser ? (
                <div className="flex items-center space-x-3 glass-effect px-4 py-2 rounded-full border border-white/10 shadow-soft">
                  <UserCircle className="w-5 h-5 text-primary" />
                  <Link
                    to={getDashboardLink()}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    {currentUser.name || 'Dashboard'}
                  </Link>
                  <div className="h-4 w-px bg-border mx-1"></div>
                  <button
                    onClick={() => logout()}
                    className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors duration-200 focus-visible:outline-none focus-visible:underline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 px-2 focus-visible:outline-none focus-visible:underline"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/contact"
                    className="btn-orange px-6 py-2.5 text-sm font-semibold rounded-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Get Started
                  </Link>
                  <Tooltip content="Admin Access" side="bottom">
                    <Link
                      to="/admin/login"
                      className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Admin Login"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </Link>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={() => toggleTheme()}
                className="p-2 rounded-full bg-white/5 text-foreground/70 hover:text-primary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-foreground/80 hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`lg:hidden absolute top-full left-0 w-full glass-navbar border-b border-white/5 shadow-premium transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? 'max-h-[calc(100vh-4.5rem)] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4.5rem)]">
            <nav className="space-y-2">
              {navStructure.map((item, index) => (
                <div key={index} className="space-y-1">
                  {item.type === 'link' ? (
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-primary/10 text-primary shadow-glow-orange-sm'
                          : 'text-foreground/80 hover:bg-muted hover:text-primary'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <div className="space-y-1">
                      <div className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                        {item.name}
                      </div>
                      <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-primary/20 ml-4">
                        {item.items.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                              isActive(subItem.path)
                                ? 'bg-primary/10 text-primary shadow-glow-orange-sm'
                                : 'text-foreground/70 hover:bg-muted hover:text-primary'
                            }`}
                          >
                            <subItem.icon className="w-4 h-4 opacity-70" />
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="h-px w-full bg-white/10"></div>

            <div className="space-y-3 px-2 pb-6">
              {currentUser ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-foreground glass-effect hover:bg-white/10 transition-all"
                  >
                    <UserCircle className="w-5 h-5" />
                    <span>{currentUser.name || 'Dashboard'}</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="block w-full px-4 py-3 text-center rounded-xl text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-foreground glass-effect hover:bg-white/10 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/admin/login"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-foreground glass-effect hover:bg-white/10 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                </div>
              )}
              
              {!currentUser && (
                <Link
                  to="/contact"
                  className="block w-full btn-orange px-4 py-3.5 text-center rounded-xl text-sm font-semibold"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Breadcrumb under Header (only shown if not on home page) */}
      {location.pathname !== '/' && (
        <div className="bg-background border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <Breadcrumb />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
