import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";

const LandingPageHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-lg border-white/10 shadow-sm py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="saas-container flex items-center justify-between">
        {/* Logo */}
        <Link to="/landing-page" className="flex items-center space-x-2 z-50">
          <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">OxgenieEdge</span>
        </Link>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <a href="tel:+919922008201">
            <Button className="bg-gradient-primary hover:brightness-110 text-white border-0 font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
          </a>
          <Link to="/login">
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 font-medium">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden z-50 p-2 text-white/80 hover:text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Drawer */}
        <div className={`fixed inset-0 bg-background/95 backdrop-blur-xl z-40 transition-transform duration-300 lg:hidden flex flex-col pt-24 px-6 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col space-y-4">
            <a href="tel:+919922008201" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center h-12 text-base bg-gradient-primary text-white border-0 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call Now
              </Button>
            </a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center h-12 text-base text-white border-white/20 hover:bg-white/10">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingPageHeader;