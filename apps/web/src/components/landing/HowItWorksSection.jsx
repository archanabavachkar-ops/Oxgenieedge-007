import React from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, Zap, BarChart3 } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: "Understand Your Business",
      description: "We analyze your current lead flow, bottlenecks, and sales processes to design the perfect architecture."
    },
    {
      icon: Settings,
      title: "Setup AI-Powered System",
      description: "We deploy and customize the CRM, connecting all your lead sources (Website, Ads, Social) directly into the platform."
    },
    {
      icon: Zap,
      title: "Automate Workflows",
      description: "We build custom follow-up sequences via WhatsApp, Email, and SMS so no lead ever falls through the cracks."
    },
    {
      icon: BarChart3,
      title: "Track & Scale Growth",
      description: "Watch your conversion rates climb through live dashboards while the AI helps you focus on high-intent prospects."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background border-t border-white/5">
      <div className="saas-container">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">How We Transform Your Business</h2>
          <p className="text-lg text-muted-foreground">
            A proven, four-step methodology to digitize your operations and accelerate revenue growth.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="flex flex-col items-center text-center relative"
                >
                  <div className="w-20 h-20 rounded-full bg-card border-4 border-background shadow-xl flex items-center justify-center mb-6 relative z-10">
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </span>
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;