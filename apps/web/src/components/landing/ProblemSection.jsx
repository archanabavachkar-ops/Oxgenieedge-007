import React from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Clock, TrendingDown, EyeOff } from 'lucide-react';

const ProblemSection = () => {
  const problems = [
    {
      icon: FileSpreadsheet,
      title: "Manual lead tracking",
      description: "Losing precious opportunities because leads are scattered across WhatsApp, Excel, and sticky notes."
    },
    {
      icon: Clock,
      title: "No systematic follow-ups",
      description: "Sales reps forget to follow up, letting warm prospects go completely cold and run to competitors."
    },
    {
      icon: TrendingDown,
      title: "Low conversion rates",
      description: "Without intelligent scoring, your team wastes hours on unqualified leads instead of high-value prospects."
    },
    {
      icon: EyeOff,
      title: "No revenue visibility",
      description: "Founders fly blind with no clear forecasting or pipeline visibility to make strategic growth decisions."
    }
  ];

  return (
    <section id="problems" className="py-24 bg-background relative border-t border-white/5">
      <div className="saas-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The Challenge SMEs Face</h2>
          <p className="text-lg text-muted-foreground">
            Operating a modern business with outdated tools is costing you revenue every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 border-t-2 border-border hover:border-primary/50 transition-colors duration-300 flex flex-col items-start group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                  <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;