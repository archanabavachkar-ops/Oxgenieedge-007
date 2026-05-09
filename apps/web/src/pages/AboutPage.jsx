import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Lightbulb, Users, Shield, Trophy } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AboutPage = () => {
  const values = [
    { icon: Lightbulb, title: 'Innovation', desc: 'We leverage cutting-edge AI to stay ahead of the curve.' },
    { icon: Users, title: 'Customer Success', desc: 'Your growth is our primary metric for success.' },
    { icon: Shield, title: 'Transparency', desc: 'Clear reporting and honest communication always.' },
    { icon: Trophy, title: 'Excellence', desc: 'We deliver premium quality in every campaign.' }
  ];

  return (
    <>
      <Helmet><title>About Us - OxgenieEdge</title></Helmet>
      <Header />
      <div className="bg-white">
        {/* Hero */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Empowering Businesses with AI-Driven Marketing
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-gray-600 max-w-3xl mx-auto">
              OxgenieEdge was founded with a simple mission: to make enterprise-grade digital marketing accessible and effective for businesses of all sizes.
            </motion.p>
          </div>
        </section>

        {/* Values */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((val, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <val.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{val.title}</h3>
                  <p className="text-gray-600">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 bg-gray-900 text-white bg-dark-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16 text-white">Meet the Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div className="text-center">
                <img src="https://images.unsplash.com/photo-1493882552576-fce827c6161e" alt="CEO" className="w-48 h-48 rounded-full object-cover mx-auto mb-6 border-4 border-gray-800" />
                <h3 className="text-2xl font-bold mb-1 text-white">Maya Chen</h3>
                <p className="text-primary font-medium mb-4">Founder & CEO</p>
                <p className="text-gray-400">10+ years in digital strategy and AI implementation.</p>
              </div>
              <div className="text-center">
                <img src="https://images.unsplash.com/photo-1675270714610-11a5cadcc7b3" alt="CTO" className="w-48 h-48 rounded-full object-cover mx-auto mb-6 border-4 border-gray-800" />
                <h3 className="text-2xl font-bold mb-1 text-white">Raj Patel</h3>
                <p className="text-primary font-medium mb-4">Chief Technology Officer</p>
                <p className="text-gray-400">Expert in scalable web architectures and machine learning.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;