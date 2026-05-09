
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Sparkles, Building2, ShoppingBag, BarChart3, 
  CreditCard, Bot, Users, Database, MessagesSquare 
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LeadCaptureForm from '@/components/landing/LeadCaptureForm.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const HomePage = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser && ['admin', 'manager', 'employee'].includes(currentUser?.role);
  const isPartner = currentUser?.collectionName === 'partners';

  const features = [
    { title: 'Integrated AI Assistant', icon: Bot, desc: 'Automate tasks and generate insights instantly.', link: '/ai-assistant' },
    { title: 'Robust CRM System', icon: Database, desc: 'Track leads, manage users, and boost sales.', link: '/crm-system' },
    { title: 'Partner Portal', icon: Users, desc: 'Dedicated space for affiliates and partners.', link: '/partner-portal' },
    { title: 'Online Store', icon: ShoppingBag, desc: 'Seamless e-commerce integration built-in.', link: '/products' },
    { title: 'Advanced Analytics', icon: BarChart3, desc: 'Data-driven insights to grow your business.', link: '/integrations' },
    { title: 'Payment Processing', icon: CreditCard, desc: 'Accept payments securely worldwide.', link: '/integrations' },
  ];

  return (
    <>
      <Helmet>
        <title>OxgenieEdge | The All-in-One Growth Platform</title>
      </Helmet>
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90dvh] flex items-center bg-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-semibold rounded-full mb-6 border border-primary/20">
              AI-Powered Business OS
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 tracking-tight text-balance">
              Scale Your Operations <br className="hidden md:block"/> With Intelligent Automation
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed text-balance">
              From CRM and Partner Management to AI capabilities and Payments. Everything you need to run your business efficiently, in one unified platform.
            </p>
            
            <div className="max-w-md mx-auto mb-8">
              <LeadCaptureForm source="home" buttonText="Start Free Trial" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="px-8 py-4 bg-secondary text-secondary-foreground border border-border rounded-xl font-bold hover:bg-secondary/80 transition-all flex items-center justify-center">
                Talk to Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">A Complete Ecosystem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">No more juggling 10 different tools. OxgenieEdge brings your entire business operations under one roof.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-colors flex flex-col ${idx === 0 || idx === 3 ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">{feature.desc}</p>
                <Link to={feature.link} className="inline-flex items-center text-primary font-semibold hover:underline mt-auto">
                  Learn More <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Showcase - ZigZag */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Your Built-in <span className="text-primary">AI Assistant</span></h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Experience multi-turn conversations, generate images on the fly, and maintain comprehensive chat history. The AI seamlessly integrates with your CRM data to provide contextual responses.
              </p>
              <ul className="space-y-4 mb-8">
                {['Multi-turn Contextual Chat', 'Image Generation Capabilities', 'Automatic History Saving'].map((item, i) => (
                  <li key={i} className="flex items-center text-muted-foreground">
                    <Sparkles className="w-5 h-5 text-primary mr-3" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/ai-assistant" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center">
                Try AI Assistant Now
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="aspect-square md:aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl relative bg-card flex items-center justify-center">
                <MessagesSquare className="w-32 h-32 text-muted-foreground/20" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CRM System & Partner Portal - 2 Columns */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-3xl p-10 border border-border">
              <Database className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-3xl font-bold text-card-foreground mb-4">CRM System</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Manage users, track leads, handle bulk actions, and dive into powerful analytics. Export data with a single click.
              </p>
              {isAdmin ? (
                <Link to="/admin/crm/dashboard" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex">
                  Access CRM Dashboard
                </Link>
              ) : (
                <Link to="/contact" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors inline-flex">
                  Request CRM Access
                </Link>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-card rounded-3xl p-10 border border-border">
              <Building2 className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-3xl font-bold text-card-foreground mb-4">Partner Portal</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Empower your affiliates with profile management, activity tracking, and direct messaging right from their dashboard.
              </p>
              {isPartner ? (
                <Link to="/partners/dashboard" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex">
                  Access Partner Portal
                </Link>
              ) : (
                <Link to="/partner-application" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors inline-flex">
                  Become a Partner
                </Link>
              )}
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HomePage;
