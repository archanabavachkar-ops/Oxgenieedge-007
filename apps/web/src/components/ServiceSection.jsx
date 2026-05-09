import React from 'react';
import { motion } from 'framer-motion';
import PricingCard from './PricingCard.jsx';

export default function ServiceSection({ title, description, icon: Icon, plans }) {
  return (
    <div className="py-16 md:py-24 border-b border-border/50 last:border-0">
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
          >
            <PricingCard
              serviceName={title}
              plan={plan}
              isRecommended={plan.name === 'Growth'}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}