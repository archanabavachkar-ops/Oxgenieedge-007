import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils.js';

export default function PricingCard({ serviceName, plan, isRecommended }) {
  const navigate = useNavigate();

  const handleSelect = () => {
    navigate(`/contact?service=${encodeURIComponent(serviceName)}&plan=${encodeURIComponent(plan.name)}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative flex flex-col h-full rounded-3xl p-8 transition-all duration-300 ${
        isRecommended
          ? 'bg-card text-card-foreground shadow-xl ring-2 ring-primary ring-offset-2 ring-offset-background lg:scale-105 z-10'
          : 'bg-card text-card-foreground border border-accent shadow-sm hover:shadow-md hover:border-primary hover:shadow-accent/20'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-none px-4 py-1 text-sm font-bold flex items-center gap-1.5 uppercase tracking-wide">
            <Star className="w-3.5 h-3.5 fill-current" />
            Recommended
          </Badge>
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-xl font-bold mb-2 ${isRecommended ? 'text-primary' : 'text-foreground'}`}>
          {plan.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {plan.description}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight text-primary">
            ₹{plan.price.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            /project
          </span>
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-grow">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-1 shrink-0 text-primary">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm text-foreground/90">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Button
          onClick={handleSelect}
          className={cn(
            "w-full h-12 text-base font-semibold transition-all",
            isRecommended 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          )}
        >
          Select {plan.name}
        </Button>
      </div>
    </motion.div>
  );
}