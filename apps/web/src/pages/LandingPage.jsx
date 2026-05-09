import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import LandingPageHeader from '@/components/landing/LandingPageHeader.jsx';
import HeroSection from '@/components/landing/HeroSection.jsx';
import ProblemSection from '@/components/landing/ProblemSection.jsx';
import SolutionsSection from '@/components/landing/SolutionsSection.jsx';
import HowItWorksSection from '@/components/landing/HowItWorksSection.jsx';
import ResultsSection from '@/components/landing/ResultsSection.jsx';
import IndustriesSection from '@/components/landing/IndustriesSection.jsx';
import ProductPreviewSection from '@/components/landing/ProductPreviewSection.jsx';
import PricingSection from '@/components/landing/PricingSection.jsx';
import FinalCTASection from '@/components/landing/FinalCTASection.jsx';
import LeadCaptureModal from '@/components/landing/LeadCaptureModal.jsx';
import WhatsAppButton from '@/components/landing/WhatsAppButton.jsx';
import Footer from '@/components/Footer.jsx';

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Helmet>
        <title>{`AI-Powered CRM & Automation | OxgenieEdge`}</title>
        <meta name="description" content="Grow your business with intelligent CRM solutions, automated workflows, and comprehensive lead management built for SMEs." />
      </Helmet>

      <LandingPageHeader />
      
      <main>
        <HeroSection onOpenModal={handleOpenModal} />
        <ProblemSection />
        <SolutionsSection />
        <HowItWorksSection />
        <ResultsSection />
        <IndustriesSection />
        <ProductPreviewSection />
        <PricingSection onOpenModal={handleOpenModal} />
        <FinalCTASection onOpenModal={handleOpenModal} />
      </main>

      <Footer />
      
      <LeadCaptureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <WhatsAppButton />
    </div>
  );
};

export default LandingPage;