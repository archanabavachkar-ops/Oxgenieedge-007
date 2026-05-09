import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#1F2937] text-white items-center justify-center px-4 py-16">
      <Helmet><title>Page Not Found | OxgenieEdge</title></Helmet>
      
      <div className="text-center max-w-2xl w-full">
        <div className="mx-auto w-24 h-24 bg-[#F97316]/10 rounded-3xl flex items-center justify-center mb-8 transform -rotate-6">
          <Search className="w-12 h-12 text-[#F97316] transform rotate-6" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
          404 - Page Not Found
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-200 mb-6">
          Sorry, the page you're looking for doesn't exist.
        </h2>
        
        <p className="text-lg text-gray-400 mb-8 max-w-lg mx-auto">
          The page you requested could not be found. It might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 md:p-8 mb-10 text-left max-w-md mx-auto">
          <h3 className="font-semibold text-white mb-4 flex items-center">
            Helpful suggestions:
          </h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#F97316] mr-3" /> Check the URL for typos</li>
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#F97316] mr-3" /> Go back to the previous page</li>
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#F97316] mr-3" /> Return to home page</li>
            <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#F97316] mr-3" /> Contact support if you need help</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => window.history.back()} 
            className="w-full sm:w-auto bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold h-12 px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full sm:w-auto bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold h-12 px-6"
          >
            <Home className="w-4 h-4 mr-2" /> Go Home
          </Button>
          <Button 
            onClick={() => navigate('/contact')} 
            variant="outline"
            className="w-full sm:w-auto bg-[#374151] border-transparent hover:bg-[#4B5563] text-white font-semibold h-12 px-6"
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}