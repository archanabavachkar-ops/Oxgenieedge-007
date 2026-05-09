import React from 'react';
import { motion } from 'framer-motion';
import { Building, Rocket, Wrench, Users, Briefcase, ShoppingBag } from 'lucide-react';

const IndustriesSection = () => {
  const industries = [
    { name: "Real Estate", icon: Building, desc: "Manage property inquiries, site visits, and automated follow-ups." },
    { name: "SMEs & Startups", icon: Rocket, desc: "Scale your sales process without hiring huge teams." },
    { name: "Service Businesses", icon: Wrench, desc: "Track estimates, appointments, and client communications." },
    { name: "Sales Teams", icon: Users, desc: "Empower reps with AI deal scoring and pipeline management." },
    { name: "Agencies", icon: Briefcase, desc: "Manage client leads and prove ROI with transparent reporting." },
    { name: "E-commerce", icon: ShoppingBag, desc: "Recover abandoned carts and nurture repeat buyers via WhatsApp." }
  ];

  return (
    <section className="py-24 bg-background border-y border-white/5">
      <div className="saas-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Built for Your Industry</h2>
          <p className="text-lg text-muted-foreground">
            Customizable workflows tailored to your specific business model.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {industries.map((ind, index) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-colors group cursor-default text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-white/70 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{ind.name}</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">{ind.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;