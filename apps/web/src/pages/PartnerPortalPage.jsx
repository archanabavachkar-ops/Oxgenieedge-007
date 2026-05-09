import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, UserCircle, Activity, FileText, MessageCircle, HeartHandshake, ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const partnerFeatures = [
  { icon: LayoutDashboard, title: 'Partner Dashboard', desc: 'Your central hub for tracking commissions, referrals, and performance.' },
  { icon: UserCircle, title: 'Profile Management', desc: 'Keep your business details, payout methods, and contact info up to date.' },
  { icon: Activity, title: 'Activity Tracking', desc: 'Real-time logs of every lead you submit and their conversion status.' },
  { icon: FileText, title: 'Document Management', desc: 'Upload and organize your compliance docs, invoices, and contracts securely.' },
  { icon: MessageCircle, title: 'Direct Messaging', desc: 'Communicate directly with your assigned account manager.' },
  { icon: HeartHandshake, title: 'Dedicated Support', desc: 'Priority support channels to ensure your success.' },
];

const PartnerPortalPage = () => {
  return (
    <>
      <Helmet><title>Partner Portal | OxgenieEdge</title></Helmet>
      <Header />

      <main className="bg-[#111827] min-h-screen text-white">
        {/* Hero */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-balance">
              Grow With Us via the <span className="text-[#F97316]">Partner Portal</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
              A transparent, powerful, and easy-to-use portal designed to help agencies, resellers, and affiliates maximize their earnings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/partners/dashboard" className="px-8 py-4 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-all flex items-center justify-center shadow-lg shadow-[#F97316]/20">
                Access Portal <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/partner-application" className="px-8 py-4 bg-[#1F2937] text-white border border-gray-700 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center">
                Become a Partner
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-[#1F2937]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partnerFeatures.map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#111827] rounded-2xl p-8 border border-gray-800 hover:border-gray-600 transition-colors"
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

export default PartnerPortalPage;