import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

const FinalCTASection = ({ onOpenModal }) => {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="saas-container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto py-16 px-6 sm:px-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Stop Managing Leads.<br />Start Closing Them.</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join hundreds of forward-thinking businesses using our AI CRM to automate their growth engine. Setup takes less than 24 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              onClick={onOpenModal}
              className="h-14 px-10 rounded-xl bg-white text-background hover:bg-white/90 text-base font-bold shadow-lg"
            >
              Get Free Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={onOpenModal}
              className="h-14 px-10 rounded-xl bg-transparent border-white/20 hover:bg-white/10 text-white text-base font-semibold"
            >
              Talk to an Expert
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;