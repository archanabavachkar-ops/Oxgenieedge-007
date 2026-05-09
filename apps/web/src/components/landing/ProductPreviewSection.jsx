import React from 'react';
import { motion } from 'framer-motion';

const ProductPreviewSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="saas-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">See It In Action</h2>
          <p className="text-lg text-muted-foreground">
            A beautiful, intuitive interface that your team will actually want to use.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl lg:rounded-3xl p-2 bg-white/5 border border-white/10 backdrop-blur-sm card-elevation"
        >
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <img 
            src="https://images.unsplash.com/photo-1686061592689-312bbfb5c055?q=80&w=2000&auto=format&fit=crop" 
            alt="Modern CRM dashboard showing pipeline visualization and analytics" 
            className="w-full h-auto rounded-xl lg:rounded-2xl block border border-white/5"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default ProductPreviewSection;