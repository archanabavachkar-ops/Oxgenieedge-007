import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Users, Briefcase, BarChart, Download, Settings, Zap, ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const crmFeatures = [
  { icon: Users, title: 'User Management', desc: 'Control roles, permissions, and team structures effortlessly.' },
  { icon: Database, title: 'Lead Tracking', desc: 'Monitor every prospect from first touch to closed deal.' },
  { icon: Briefcase, title: 'Application Management', desc: 'Process and review partner applications in a streamlined workflow.' },
  { icon: Zap, title: 'Bulk Actions', desc: 'Update statuses or assign managers to hundreds of records at once.' },
  { icon: Download, title: 'Export Data', desc: 'Export views to CSV or Excel instantly for offline analysis.' },
  { icon: BarChart, title: 'Analytics & Reporting', desc: 'Visual dashboards tracking pipeline velocity and conversion rates.' },
];

const CRMSystemPage = () => {
  return (
    <>
      <Helmet><title>CRM System | OxgenieEdge</title></Helmet>
      <Header />

      <main className="bg-[#111827] min-h-screen text-white">
        {/* Hero */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-balance">
              The CRM Built for <span className="text-[#F97316]">Modern Scale</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
              Stop fighting with bloated software. Our CRM is lightning-fast, tailored for your workflows, and securely integrated into your core platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/admin/crm/dashboard" className="px-8 py-4 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-all flex items-center justify-center">
                Access CRM Dashboard <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/contact" className="px-8 py-4 bg-[#1F2937] text-white border border-gray-700 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center">
                Request Access / Demo
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-[#1F2937]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {crmFeatures.map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#111827] rounded-2xl p-8 border border-gray-800"
                >
                  <div className="w-12 h-12 bg-[#F97316]/10 rounded-xl flex items-center justify-center mb-6">
                    <feat.icon className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
};

export default CRMSystemPage;