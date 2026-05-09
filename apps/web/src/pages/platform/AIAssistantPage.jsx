
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Image as ImageIcon, History, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AIAssistantPage = () => {
  return (
    <>
      <Helmet>
        <title>AI Assistant | Platform | OxgenieEdge</title>
        <meta name="description" content="Intelligent automation and insights with our integrated AI Assistant." />
      </Helmet>
      <Header />
      
      <main className="bg-[#0a0a0a] min-h-screen text-white">
        {/* Spotlight Hero */}
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-8" />
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance mb-8">
                Intelligence embedded in <br className="hidden md:block" /> every workflow
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-12 text-balance max-w-2xl mx-auto">
                Not just a chatbot. A context-aware assistant that understands your business data, generates assets, and helps you work smarter.
              </p>
              <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all active:scale-[0.98]">
                See it in action
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature List */}
        <section className="py-24 bg-slate-950 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="w-16 h-16 shrink-0 bg-card border border-border/50 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
                  01
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-primary" /> Contextual Chat
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Engage in multi-turn conversations. The AI remembers previous interactions and references your CRM data to provide highly relevant, accurate answers without hallucinating.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="w-16 h-16 shrink-0 bg-card border border-border/50 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
                  02
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                    <ImageIcon className="w-6 h-6 text-primary" /> Asset Generation
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Need a quick mockup or marketing graphic? Use the built-in image generation tool directly within the chat interface to create visual assets on the fly.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="w-16 h-16 shrink-0 bg-card border border-border/50 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
                  03
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                    <History className="w-6 h-6 text-primary" /> Persistent Memory
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Every conversation is securely saved to your profile. Pick up exactly where you left off, across any device, at any time.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AIAssistantPage;
