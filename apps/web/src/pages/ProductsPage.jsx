import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  MousePointerClick, 
  Share2, 
  Search, 
  PenTool,
  Video,
  Palette,
  LayoutTemplate,
  Globe,
  ShoppingCart
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ServiceSection from '@/components/ServiceSection.jsx';
import { Button } from '@/components/ui/button';

// --- DATA DEFINITIONS ---

const digitalMarketingServices = [
  {
    title: 'Pay-Per-Click (PPC)',
    description: 'Data-driven paid advertising campaigns on Google, Meta, and LinkedIn designed to maximize ROI and capture high-intent leads.',
    icon: MousePointerClick,
    plans: [
      { name: 'Starter', description: 'Perfect for local businesses', price: 15000, features: ['1 Ad Platform (Google or Meta)', 'Campaign Setup & Structure', 'Up to 2 Campaigns', 'Basic Keyword Research', 'Monthly Performance Report'] },
      { name: 'Growth', description: 'Scale your lead generation', price: 35000, features: ['2 Ad Platforms', 'Advanced Audience Targeting', 'Up to 5 Campaigns', 'A/B Testing for Ad Copy', 'Conversion Tracking Setup', 'Bi-weekly Strategy Calls'] },
      { name: 'Premium', description: 'Aggressive market dominance', price: 75000, features: ['Unlimited Ad Platforms', 'Dynamic Remarketing', 'Unlimited Campaigns', 'Landing Page Optimization Support', 'Custom Dashboard Integration', 'Weekly Performance Reviews'] }
    ]
  },
  {
    title: 'Social Media Marketing',
    description: 'Build brand authority and engage your audience through strategic content, community management, and targeted social growth.',
    icon: Share2,
    plans: [
      { name: 'Starter', description: 'Establish your presence', price: 12000, features: ['2 Social Media Platforms', '8 Custom Posts per Month', 'Basic Community Management', 'Profile Optimization', 'Monthly Analytics Report'] },
      { name: 'Growth', description: 'Build active communities', price: 25000, features: ['3 Social Media Platforms', '15 Custom Posts per Month', '4 Short-form Reels/Videos', 'Proactive Engagement Strategy', 'Hashtag & Trend Analysis', 'Monthly Strategy Meeting'] },
      { name: 'Premium', description: 'Dominate social channels', price: 45000, features: ['All Major Platforms', 'Daily Content Publishing', '10 Short-form Reels/Videos', 'Influencer Outreach Strategy', 'Social Listening & Reputation', 'Priority Support'] }
    ]
  },
  {
    title: 'Search Engine Optimization (SEO)',
    description: 'Improve your organic visibility and drive sustainable, high-quality traffic to your website through white-hat SEO techniques.',
    icon: Search,
    plans: [
      { name: 'Starter', description: 'Foundation for organic growth', price: 18000, features: ['Initial Technical Audit', 'On-page SEO (Up to 10 pages)', 'Basic Keyword Research', 'Google Search Console Setup', 'Monthly Ranking Report'] },
      { name: 'Growth', description: 'Competitive search rankings', price: 40000, features: ['Comprehensive Technical SEO', 'On-page SEO (Up to 30 pages)', 'Content Gap Analysis', '4 High-Quality Backlinks/mo', 'Local SEO Optimization', 'Competitor Tracking'] },
      { name: 'Premium', description: 'Enterprise organic dominance', price: 80000, features: ['Advanced Technical Architecture', 'Unlimited On-page SEO', 'Content Hub Strategy', '10+ Authority Backlinks/mo', 'Schema Markup Implementation', 'Dedicated SEO Account Manager'] }
    ]
  },
  {
    title: 'Content Writing',
    description: 'Compelling, SEO-optimized copy that speaks to your audience, communicates your value proposition, and drives action.',
    icon: PenTool,
    plans: [
      { name: 'Starter', description: 'Essential brand messaging', price: 10000, features: ['4 SEO Blog Posts (800 words)', 'Topic Ideation', 'Basic Keyword Integration', '1 Round of Revisions', 'Grammarly Premium Checked'] },
      { name: 'Growth', description: 'Consistent content engine', price: 22000, features: ['8 SEO Blog Posts (1200 words)', 'Website Copy Refresh (3 pages)', 'Competitor Content Analysis', '2 Rounds of Revisions', 'Plagiarism & AI Checks', 'Content Calendar Management'] },
      { name: 'Premium', description: 'Authority thought leadership', price: 40000, features: ['12 In-depth Articles (1500+ words)', '1 E-book or Whitepaper per month', 'Email Newsletter Copy (4/mo)', 'Unlimited Revisions', 'Subject Matter Expert Interviews', 'Custom Graphics Briefs'] }
    ]
  }
];

const creativeServices = [
  {
    title: 'Video Editing',
    description: 'Professional video post-production for social media, corporate presentations, and advertising that captures attention instantly.',
    icon: Video,
    plans: [
      { name: 'Starter', description: 'Basic cuts and assembly', price: 15000, features: ['Up to 5 Short-form Videos (Reels/Shorts)', 'Basic Color Correction', 'Standard Transitions', 'Royalty-free Background Music', '1 Round of Revisions'] },
      { name: 'Growth', description: 'Engaging dynamic edits', price: 30000, features: ['10 Short-form or 2 Long-form Videos', 'Advanced Color Grading', 'Motion Graphics & Text Animations', 'Sound Design & Mixing', 'Subtitles/Captions Integration', '2 Rounds of Revisions'] },
      { name: 'Premium', description: 'Cinematic commercial quality', price: 60000, features: ['Unlimited Monthly Editing Output', 'Complex VFX & Compositing', 'Custom Animated Intros/Outros', 'Premium Sound Design', 'Multi-cam Syncing', 'Dedicated Senior Editor'] }
    ]
  },
  {
    title: 'Graphic Design',
    description: 'Striking visuals that elevate your brand identity across digital and print mediums, creating a memorable aesthetic.',
    icon: Palette,
    plans: [
      { name: 'Starter', description: 'Essential brand assets', price: 12000, features: ['10 Social Media Graphics/mo', 'Basic Photo Retouching', 'Standard Typography Layouts', '2 Rounds of Revisions', 'Delivery in JPG/PNG'] },
      { name: 'Growth', description: 'Comprehensive visual identity', price: 28000, features: ['25 Social Media Graphics/mo', 'Custom Vector Illustrations', 'Marketing Collateral (Flyers, Ads)', 'Presentation Deck Design (Up to 15 slides)', 'Source Files Included', 'Brand Guideline Alignment'] },
      { name: 'Premium', description: 'Unlimited creative requests', price: 55000, features: ['Unlimited Design Requests', 'Complete Brand Identity Kits', 'Custom Iconography', 'Print-ready Packaging Design', 'Priority 24-48hr Turnaround', 'Dedicated Art Director'] }
    ]
  },
  {
    title: 'UI/UX Design',
    description: 'User-centric interface design for web and mobile applications that maximizes engagement, usability, and conversion rates.',
    icon: LayoutTemplate,
    plans: [
      { name: 'Starter', description: 'Wireframes and basic flows', price: 25000, features: ['Up to 5 Unique Screens/Pages', 'Basic Wireframing', 'Standard UI Component Kit', 'Mobile Responsive Layouts', 'Figma Source File', '1 Revision Iteration'] },
      { name: 'Growth', description: 'Complete product experiences', price: 60000, features: ['Up to 15 Unique Screens', 'Interactive High-fidelity Prototypes', 'Custom Design System Creation', 'User Journey Mapping', 'Micro-interactions & Animations', '3 Revision Iterations'] },
      { name: 'Premium', description: 'Enterprise-grade UX architecture', price: 120000, features: ['Unlimited Screens (Per Project Phase)', 'Comprehensive User Testing', 'Advanced Design System (Tokens)', 'Complex Dashboard Interfaces', 'Developer Handoff Documentation', 'Ongoing UX Consultation'] }
    ]
  }
];

const devServices = [
  {
    title: 'Web Development',
    description: 'Fast, secure, and highly scalable websites built on modern tech stacks (React, Next.js) tailored to your business objectives.',
    icon: Globe,
    plans: [
      { name: 'Starter', description: 'Professional landing presence', price: 35000, features: ['Up to 5 Pages (Static/CMS)', 'Mobile Responsive Design', 'Basic SEO Setup', 'Contact Form Integration', 'Standard Analytics Tracking', '1 Month Free Support'] },
      { name: 'Growth', description: 'Dynamic business platforms', price: 80000, features: ['Up to 15 Pages with Custom CMS', 'Advanced Animations & Transitions', 'Third-party API Integrations', 'Custom Post Types (Blogs/Portfolios)', 'Speed & Performance Optimization', '3 Months Free Support'] },
      { name: 'Premium', description: 'Custom web applications', price: 180000, features: ['Unlimited Pages & Complex Architecture', 'Custom Web App Features (Dashboards, Portals)', 'Advanced Database Architecture', 'High-security Implementation', 'Scalable Cloud Hosting Setup', 'Dedicated QA & 6 Months Support'] }
    ]
  },
  {
    title: 'E-commerce Development',
    description: 'Robust online stores optimized for conversions, featuring seamless payment gateways, inventory management, and intuitive shopping experiences.',
    icon: ShoppingCart,
    plans: [
      { name: 'Starter', description: 'Launch your digital store', price: 45000, features: ['Shopify/WooCommerce Setup', 'Up to 50 Products Upload', 'Standard Premium Theme', 'Basic Payment Gateway Integration', 'Standard Shipping Rules', 'Basic Training Session'] },
      { name: 'Growth', description: 'Scale your online revenue', price: 100000, features: ['Custom Headless E-commerce (React)', 'Up to 500 Products Upload', 'Advanced Filtering & Search', 'Multi-currency & Multi-language', 'Abandoned Cart Recovery Setup', 'CRM/ERP Integration'] },
      { name: 'Premium', description: 'Enterprise retail architecture', price: 250000, features: ['Fully Custom E-commerce Platform', 'Unlimited Products & Variants', 'Advanced AI Recommendation Engine', 'Custom B2B/Wholesale Portals', 'Complex Logistics API Integrations', 'Omnichannel Sales Synchronization'] }
    ]
  }
];

const ProductsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Helmet>
        <title>Services & Pricing | OxgenieEdge</title>
        <meta name="description" content="Explore our tiered service packages for Digital Marketing, Creative Services, and Development. Transparent pricing to help your business scale." />
      </Helmet>
      
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-[#1F2937] text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight text-balance text-primary">
                Services & Pricing
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed text-balance">
                Comprehensive digital solutions designed to scale your business. Choose from our transparent, tiered service packages tailored to your precise growth stage.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild className="h-14 px-8 text-base shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                  <Link to="/contact">
                    Get a Custom Quote
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base bg-white/10 border-white/20 hover:bg-white/20 text-white">
                  <a href="#digital-marketing">
                    View Pricing Plans
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          
          {/* Digital Marketing Section */}
          <section id="digital-marketing" className="scroll-mt-24">
            <div className="mb-12 inline-block">
              <h2 className="text-sm font-bold tracking-wider uppercase text-primary mb-2">01 / Growth Engine</h2>
              <h3 className="text-3xl md:text-4xl font-bold">Digital Marketing</h3>
            </div>
            
            {digitalMarketingServices.map((service) => (
              <ServiceSection 
                key={service.title}
                title={service.title}
                description={service.description}
                icon={service.icon}
                plans={service.plans}
              />
            ))}
          </section>

          {/* Creative Services Section */}
          <section id="creative-services" className="scroll-mt-24">
            <div className="mb-12 inline-block">
              <h2 className="text-sm font-bold tracking-wider uppercase text-primary mb-2">02 / Brand Identity</h2>
              <h3 className="text-3xl md:text-4xl font-bold">Creative Services</h3>
            </div>
            
            {creativeServices.map((service) => (
              <ServiceSection 
                key={service.title}
                title={service.title}
                description={service.description}
                icon={service.icon}
                plans={service.plans}
              />
            ))}
          </section>

          {/* Development Services Section */}
          <section id="development-services" className="scroll-mt-24">
            <div className="mb-12 inline-block">
              <h2 className="text-sm font-bold tracking-wider uppercase text-primary mb-2">03 / Tech Infrastructure</h2>
              <h3 className="text-3xl md:text-4xl font-bold">Development Services</h3>
            </div>
            
            {devServices.map((service) => (
              <ServiceSection 
                key={service.title}
                title={service.title}
                description={service.description}
                icon={service.icon}
                plans={service.plans}
              />
            ))}
          </section>

        </div>

        {/* Bottom CTA */}
        <section className="bg-primary/10 py-24 border-t border-accent/20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance text-foreground">
              Need a tailored enterprise solution?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 text-balance">
              Mix and match services or request custom integrations, dedicated resource allocation, and specialized workflows for your organization.
            </p>
            <Button size="lg" asChild className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/contact">
                Contact Sales Team
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;