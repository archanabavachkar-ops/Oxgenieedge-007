
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Database, LayoutDashboard, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const CRMSystemPage = () => {
  return (
    <>
      <Helmet>
        <title>CRM System | Platform | OxgenieEdge</title>
        <meta name="description" content="Manage customer relationships effectively with our robust CRM." />
      </Helmet>
      <Header />
      
      <main className="bg-[#0a0a0a] min-h-screen text-white">
        {/* Hero */}
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
                The central hub for your <span className="text-primary">customer data</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 text-balance">
                A powerful, intuitive CRM designed to give you complete visibility into your sales pipeline, customer interactions, and team performance.
              </p>
              <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all active:scale-[0.98]">
                Explore the CRM
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 2+1 Layout Features */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Card 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-3xl p-10 border border-border/50 flex flex-col h-full"
              >
                <LayoutDashboard className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">Customizable Dashboards</h3>
                <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                  Build views that matter to your role. Track KPIs, monitor pipeline health, and visualize revenue forecasts with drag-and-drop widgets.
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-3xl p-10 border border-border/50 flex flex-col h-full"
              >
                <Users className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">360° Customer View</h3>
                <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                  Every email, call, meeting, and transaction logged in one unified timeline. Never ask a customer to repeat themselves again.
                </p>
              </motion.div>
            </div>

            {/* Full Width Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-3xl p-10 md:p-16 border border-border/50 flex flex-col md:flex-row items-center gap-12"
            >
              <div className="flex-1">
                <ShieldCheck className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-3xl font-bold mb-4">Enterprise-Grade Security & Roles</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Granular role-based access control ensures your team only sees what they need to. Comprehensive audit logs track every change, keeping your data secure and compliant.
                </p>
                <ul className="space-y-2">
                  <li className="text-muted-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Field-level permissions</li>
                  <li className="text-muted-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Automated data backups</li>
                  <li className="text-muted-foreground flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> GDPR & CCPA compliance tools</li>
                </ul>
              </div>
              <div className="flex-1 w-full bg-background rounded-2xl border border-border/50 aspect-video flex items-center justify-center">
                <span className="text-muted-foreground/50 font-medium">Security Dashboard Preview</span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CRMSystemPage;
