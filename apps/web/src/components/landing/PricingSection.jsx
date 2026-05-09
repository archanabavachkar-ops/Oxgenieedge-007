import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

const PricingSection = ({ onOpenModal }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      price: isAnnual ? "49" : "59",
      description: "Perfect for small teams getting started with CRM.",
      features: [
        "Up to 3 Users",
        "Basic Contact Management",
        "Email Integration",
        "Standard Pipeline View",
        "Basic Reporting"
      ]
    },
    {
      name: "Professional",
      price: isAnnual ? "99" : "119",
      description: "Advanced tools for growing sales teams.",
      popular: true,
      features: [
        "Up to 10 Users",
        "AI Lead Scoring",
        "WhatsApp & SMS Automation",
        "Advanced Workflow Builder",
        "Custom Dashboards",
        "Priority Support"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large organizations.",
      features: [
        "Unlimited Users",
        "Custom Integrations",
        "Dedicated Account Manager",
        "SLA Guarantee",
        "On-premise deployment option",
        "24/7 Phone Support"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-card/30 border-t border-white/5">
      <div className="saas-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start small and scale your CRM as your business grows.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-muted-foreground'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle billing period"
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-primary transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-muted-foreground'}`}>
              Annually <span className="text-xs text-green-400 ml-1">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl border ${plan.popular ? 'bg-background border-primary shadow-[0_0_40px_rgba(99,102,241,0.15)] scale-105 z-10' : 'bg-card border-white/5'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-xs font-bold text-white uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground h-10">{plan.description}</p>
              </div>
              
              <div className="mb-6 flex items-baseline">
                {plan.price !== 'Custom' ? (
                  <>
                    <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                    <span className="text-muted-foreground ml-2">/mo</span>
                  </>
                ) : (
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                )}
              </div>
              
              <Button 
                onClick={onOpenModal}
                className={`w-full mb-8 h-12 rounded-xl text-base font-semibold ${plan.popular ? 'bg-gradient-primary text-white border-0 hover:brightness-110' : 'bg-white/5 hover:bg-white/10 text-white'}`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
              </Button>
              
              <div className="space-y-4 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <Check className={`w-5 h-5 mr-3 shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;