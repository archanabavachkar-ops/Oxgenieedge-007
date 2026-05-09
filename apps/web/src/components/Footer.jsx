import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Linkedin, Twitter, Facebook, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-white/80 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-[#F97316] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-xl font-bold text-white">OxgenieEdge</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-gray-400">
              AI-powered digital marketing solutions to help businesses grow with data-driven strategies, cutting-edge technology, and seamless automation.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-gray-400">
                <MapPin className="w-4 h-4 text-[#F97316] mt-1 flex-shrink-0" />
                <span className="text-sm">Pune Office: JP Homes, Row Hse 13, Manjri Bk, Pune, India 412307</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                <a href="tel:+919422008201" className="text-sm hover:text-[#F97316] transition-colors duration-200">
                  +91 9422008201
                </a>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                <a href="mailto:hello@oxgenieedge.com" className="text-sm hover:text-[#F97316] transition-colors duration-200">
                  hello@oxgenieedge.com
                </a>
              </div>
            </div>
          </div>

          <div>
            <span className="text-white font-semibold mb-4 block">Company</span>
            <div className="space-y-2">
              <Link to="/landing-page" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">Landing Page</Link>
              <Link to="/ai-web-automated-lead-management" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">AI Lead Management</Link>
              <Link to="/your-ai-chief-of-staff" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">AI Chief of Staff</Link>
              <Link to="/about" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">About</Link>
              <Link to="/services" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">Services</Link>
              <Link to="/products" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">Products</Link>
              <Link to="/industries" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">Industries</Link>
              <Link to="/pricing" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">Plans</Link>
            </div>
          </div>

          <div>
            <span className="text-white font-semibold mb-4 block">Resources</span>
            <div className="space-y-2">
              <Link to="/faq" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">Help Center</Link>
              <Link to="/contact" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">Contact Support</Link>
            </div>
          </div>

          <div>
            <span className="text-white font-semibold mb-4 block">Admin</span>
            <div className="space-y-2">
              <Link to="/admin/crm/dashboard" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">CRM Dashboard</Link>
              <Link to="/partners/dashboard" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">Partner Portal</Link>
              <Link to="/admin/settings" className="block text-sm text-gray-400 hover:text-[#F97316] transition-colors duration-200">Settings</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-500">© 2026 OxgenieEdge. All rights reserved.</p>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-[#F97316] transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-[#F97316] transition-colors duration-200">Terms of Service</Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-[#F97316] transition-colors duration-200">Cookie Policy</Link>
          </div>

          <div className="flex space-x-4">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#F97316] transition-colors duration-200">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#F97316] transition-colors duration-200">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#F97316] transition-colors duration-200">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#F97316] transition-colors duration-200">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;