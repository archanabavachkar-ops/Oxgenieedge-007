import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Workflow, Globe, Code2 } from 'lucide-react';

const SolutionsSection = () => {
  const features = [
    {
      icon: BrainCircuit,
      title: "AI CRM System",
      description: "Automatically track leads, score prospects based on engagement, and predict deal closures with machine learning.",
      colSpan: "md:col-span-2 lg:col-span-2"
    },
    {
      icon: Workflow,
      title: "Intelligent Automation",
      description: "Set up auto follow-ups, task assignments, and multi-channel drip campaigns.",
      colSpan: "md:col-span-1 lg:col-span-1"
    },
    {
      icon: Globe,
      title: "SME Digitization",
      description: "Connect your website, CRM, payments, and WhatsApp into one unified ecosystem.",
      colSpan: "md:col-span-1 lg:col-span-1"
    },
    {
      icon: Code2,
      title: "Web Development",
      description: "Launch high-converting websites and landing pages optimized specifically for lead generation.",
      colSpan: "md:col-span-2 lg:col-span-2"
    }
  ];

  return (
    <section id="solutions" className="py-24 bg-card/30 relative">
      <div className="saas-container">
        <div className="mb-16">
          <span className="text-primary font-semibold tracking-wider uppercase text-sm mb-2 block">Platform Capabilities</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 max-w-2xl">Our Solutions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Everything you need to capture, nurture, and close leads on autopilot in one unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 auto-rows-fr">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-background rounded-3xl p-8 card-elevation-hover relative overflow-hidden group ${feature.colSpan}`}
              >
                {/* Subtle gradient accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] group-hover:bg-primary/20 transition-all duration-500" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary p-[1px] mb-6 inline-block">
                    <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;