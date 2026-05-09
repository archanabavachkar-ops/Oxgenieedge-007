import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const EducationPage = () => {
  return (
    <>
      <Helmet>
        <title>Education Digital Marketing - OxgenieEdge</title>
      </Helmet>
      <Header />
      
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1624388611710-bdf95023d1c2" alt="Education" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-[hsl(var(--industry-education))]/20 text-[hsl(var(--industry-education))] font-semibold text-sm mb-6">
              Education Solutions
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Digital Marketing for Educational Institutions
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Attract prospective students, highlight your programs, and stand out in a competitive educational landscape.
            </p>
            <Link to="/contact" className="inline-flex items-center px-8 py-4 bg-[hsl(var(--industry-education))] text-white rounded-lg font-medium hover:brightness-110 transition-all active:scale-95">
              Book Consultation <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Industry Challenge</h2>
              <ul className="space-y-4">
                {['Declining student enrollments', 'Low visibility for specialized courses', 'Fierce competition from online platforms', 'Weak digital presence'].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1 mr-3">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <span className="text-gray-700 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Solution</h2>
              <ul className="space-y-4">
                {['Targeted Social Media Campaigns', 'Educational Content Marketing', 'Influencer & Alumni Partnerships', 'SEO for Course Discovery'].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[hsl(var(--industry-education))] mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[hsl(var(--industry-education))] rounded-3xl p-10 lg:p-16 text-white mb-24">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-semibold mb-4 opacity-90">Case Study: Global Tech Institute</h3>
              <p className="text-3xl lg:text-4xl font-bold mb-12 leading-tight">
                "Our enrollment numbers hit record highs after implementing the targeted digital strategy."
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <div className="text-5xl font-bold mb-2">180%</div>
                  <div className="text-lg opacity-90">Increase in student enrollments</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">5x</div>
                  <div className="text-lg opacity-90">Improved course visibility across platforms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default EducationPage;