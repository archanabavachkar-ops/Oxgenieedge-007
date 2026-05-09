import React from 'react';
import { motion } from 'framer-motion';
import { Target, Timer, LineChart, HeartHandshake as Handshake } from 'lucide-react';

const ResultsSection = () => {
  const results = [
    {
      metric: "2-5x",
      title: "Lead Conversions",
      description: "Increase win rates with AI scoring and automated nurturing.",
      icon: Target
    },
    {
      metric: "70%",
      title: "Less Manual Work",
      description: "Free your sales team from data entry and manual follow-ups.",
      icon: Timer
    },
    {
      metric: "100%",
      title: "Revenue Visibility",
      description: "Real-time dashboards showing exactly where your money is.",
      icon: LineChart
    },
    {
      metric: "3x",
      title: "Faster Deal Closures",
      description: "Accelerate your sales cycle with immediate automated responses.",
      icon: Handshake
    }
  ];

  return (
    <section className="py-24 bg-card/50 relative overflow-hidden">
      <div className="saas-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Results You Can Expect</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((result, index) => {
            const Icon = result.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background rounded-3xl p-8 border border-white/5 hover:border-primary/40 transition-colors text-center group"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">{result.metric}</div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">{result.title}</h3>
                <p className="text-sm text-muted-foreground">{result.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;