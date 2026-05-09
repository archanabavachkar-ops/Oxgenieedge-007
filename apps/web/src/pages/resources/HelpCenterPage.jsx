
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Book, Video, FileText, LifeBuoy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const HelpCenterPage = () => {
  const categories = [
    { title: 'Getting Started', icon: Book, desc: 'Basic setup, account configuration, and quick start guides.', link: '/faq' },
    { title: 'Video Tutorials', icon: Video, desc: 'Step-by-step visual guides for complex workflows.', link: '/faq' },
    { title: 'API Documentation', icon: FileText, desc: 'Technical references for developers and integrators.', link: '/faq' },
    { title: 'Troubleshooting', icon: LifeBuoy, desc: 'Solutions to common issues and error codes.', link: '/faq' },
  ];

  return (
    <>
      <Helmet>
        <title>Help Center | Resources | OxgenieEdge</title>
        <meta name="description" content="Get support and detailed guides for OxgenieEdge." />
      </Helmet>
      <Header />
      
      <main className="bg-[#0a0a0a] min-h-screen text-white">
        {/* Hero with Search */}
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-slate-950 border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                How can we help you today?
              </h1>
              
              <div className="relative max-w-2xl mx-auto mt-10">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-4 bg-card border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
                  placeholder="Search for articles, guides, or topics..."
                />
                <button className="absolute inset-y-2 right-2 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                  Search
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card rounded-2xl p-8 border border-border/50 hover:bg-secondary/10 transition-colors flex items-start gap-6"
                >
                  <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center">
                    <cat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                    <p className="text-muted-foreground mb-4">{cat.desc}</p>
                    <Link to={cat.link} className="text-sm font-medium text-primary hover:underline inline-flex items-center">
                      Browse articles <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="py-20 bg-primary/5 border-t border-primary/10">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-8">Our support team is available 24/7 to assist you with any technical or billing inquiries.</p>
            <Link to="/contact" className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
              Contact Support
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default HelpCenterPage;
