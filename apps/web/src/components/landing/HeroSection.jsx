import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = ({ onOpenModal }) => {
  return (
    <section id="home" className="relative min-h-[100dvh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />

      <div className="saas-container relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left: Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start max-w-2xl"
        >
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-white/90">The Next Generation of Sales CRM</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            Grow Your Business with <span className="text-gradient">AI-Powered CRM</span> & Automation
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-[60ch]">
            Stop losing leads to disorganized spreadsheets. Automate your follow-ups, predict deal closures, and scale your revenue with an intelligent system built for modern teams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              onClick={onOpenModal}
              className="h-14 px-8 rounded-xl bg-gradient-primary text-white border-0 text-base font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] btn-hover-effect group"
            >
              Book Free Demo
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={onOpenModal}
              className="h-14 px-8 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white text-base font-semibold transition-all"
            >
              Get Free Consultation
            </Button>
          </div>
        </motion.div>

        {/* Right: Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-[500px] lg:h-[600px] rounded-3xl overflow-hidden card-elevation"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/40 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?q=80&w=2000&auto=format&fit=crop" 
            alt="Modern team analyzing CRM data and growth charts" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Decorative floating UI elements could go here if needed */}
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;