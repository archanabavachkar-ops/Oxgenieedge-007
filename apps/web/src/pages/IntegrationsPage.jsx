import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, BarChart, CreditCard, Lock, Mail, ExternalLink, Settings } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const integrations = [
  {
    id: 'store',
    name: 'Online Store',
    icon: ShoppingCart,
    desc: 'Fully integrated e-commerce module for your digital products and services.',
    features: ['Product Management', 'Cart System', 'Inventory Tracking'],
    status: 'Active'
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    icon: BarChart,
    desc: 'Real-time metrics, conversion funnels, and revenue tracking.',
    features: ['Custom Reports', 'Data Export', 'Traffic Sources'],
    status: 'Active'
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    icon: CreditCard,
    desc: 'Secure credit card processing for subscriptions and one-time payments.',
    features: ['Global Payments', 'Subscription Billing', 'Fraud Protection'],
    status: 'Available'
  },
  {
    id: 'razorpay',
    name: 'Razorpay Integration',
    icon: CreditCard,
    desc: 'Seamless UPI, net banking, and card payments tailored for India.',
    features: ['UPI Support', 'Fast Settlements', 'Payment Links'],
    status: 'Active'
  },
  {
    id: 'oauth2',
    name: 'OAuth2 Social Login',
    icon: Lock,
    desc: 'Let users sign in quickly with Google, GitHub, and other providers.',
    features: ['SSO Ready', 'Secure Tokens', 'User Sync'],
    status: 'Available'
  },
  {
    id: 'email',
    name: 'Email Service',
    icon: Mail,
    desc: 'Automated platform emails for OTPs, notifications, and campaigns.',
    features: ['Built-in SMTP', 'Custom Templates', 'Delivery Tracking'],
    status: 'Active'
  }
];

const IntegrationsPage = () => {
  return (
    <>
      <Helmet><title>Integrations | OxgenieEdge</title></Helmet>
      <Header />
      
      <main className="min-h-screen bg-[#111827] pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Connect Your <span className="text-[#F97316]">Favorite Tools</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 leading-relaxed"
            >
              Extend the capabilities of your platform. Enable seamless payments, deep analytics, and smooth communication channels with one click.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {integrations.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#1F2937] border border-gray-800 rounded-2xl p-8 hover:border-[#F97316]/50 transition-all flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-[#F97316]/10 rounded-xl flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-[#F97316]" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">{item.name}</h3>
                <p className="text-gray-400 mb-6 flex-grow">{item.desc}</p>
                
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {item.features.map((feat, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full mr-2"></span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-auto flex gap-3">
                  <button className="flex-1 bg-[#374151] hover:bg-gray-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center">
                    <Settings className="w-4 h-4 mr-2" /> Setup
                  </button>
                  <button className="px-4 border border-gray-700 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors flex items-center justify-center">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default IntegrationsPage;