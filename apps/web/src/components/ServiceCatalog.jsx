import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const catalogData = [
  {
    category: "Digital Marketing Services",
    badgeIcon: "🟠",
    badgeColor: "bg-[hsl(var(--service-digital-marketing)/0.1)] text-[hsl(var(--service-digital-marketing))]",
    services: [
      {
        name: "Pay Per Click (PPC)",
        idPrefix: "ppc",
        tiers: [
          { name: "Starter", price: 15000, billing: "monthly", features: ["Google Ads Setup", "Basic Keyword Research", "1 Ad Campaign", "Monthly Reporting"] },
          { name: "Growth", price: 30000, billing: "monthly", features: ["Google & Meta Ads", "Advanced Targeting", "A/B Testing", "Bi-weekly Reporting"], highlighted: true },
          { name: "Premium", price: 50000, billing: "monthly", features: ["Omnichannel Ads", "Custom Conversion Tracking", "Dedicated Account Manager", "Weekly Strategy Calls"] }
        ]
      },
      {
        name: "Social Media Marketing",
        idPrefix: "smm",
        tiers: [
          { name: "Starter", price: 12000, billing: "monthly", features: ["2 Platforms", "8 Posts/month", "Basic Community Management", "Monthly Report"] },
          { name: "Growth", price: 25000, billing: "monthly", features: ["3 Platforms", "15 Posts/month", "Custom Graphics", "Bi-weekly Report"], highlighted: true },
          { name: "Premium", price: 45000, billing: "monthly", features: ["All Platforms", "Daily Posting", "Video Content Included", "Influencer Outreach"] }
        ]
      },
      {
        name: "Search Engine Optimization (SEO)",
        idPrefix: "seo",
        tiers: [
          { name: "Starter", price: 18000, billing: "monthly", features: ["On-page SEO", "Basic Technical Audit", "5 Target Keywords", "Monthly Ranking Report"] },
          { name: "Growth", price: 35000, billing: "monthly", features: ["Comprehensive Audit", "Content Optimization", "15 Target Keywords", "Basic Link Building"], highlighted: true },
          { name: "Premium", price: 60000, billing: "monthly", features: ["Enterprise SEO Strategy", "Advanced Link Building", "Unlimited Keywords", "Competitor Analysis"] }
        ]
      },
      {
        name: "Content Writing",
        idPrefix: "content",
        tiers: [
          { name: "Starter", price: 10000, billing: "monthly", features: ["4 Blog Posts (500 words)", "Basic SEO Formatting", "1 Revision Round"] },
          { name: "Growth", price: 22000, billing: "monthly", features: ["8 Blog Posts (1000 words)", "Advanced SEO Formatting", "Social Media Snippets"], highlighted: true },
          { name: "Premium", price: 40000, billing: "monthly", features: ["12 Long-form Articles", "Whitepapers & E-books", "Unlimited Revisions", "Content Strategy"] }
        ]
      }
    ]
  },
  {
    category: "Creative Services",
    badgeIcon: "🔶",
    badgeColor: "bg-[hsl(var(--service-creative)/0.1)] text-[hsl(var(--service-creative))]",
    services: [
      {
        name: "Video Editing",
        idPrefix: "video",
        tiers: [
          { name: "Starter", price: 8000, billing: "project", features: ["Up to 3 mins final video", "Basic Transitions", "Stock Music", "1 Revision"] },
          { name: "Growth", price: 18000, billing: "project", features: ["Up to 10 mins final video", "Color Grading", "Motion Graphics", "3 Revisions"], highlighted: true },
          { name: "Premium", price: 35000, billing: "project", features: ["Unlimited length", "Advanced VFX", "Custom Sound Design", "Unlimited Revisions"] }
        ]
      },
      {
        name: "Graphic Design",
        idPrefix: "graphic",
        tiers: [
          { name: "Starter", price: 5000, billing: "project", features: ["3 Social Media Creatives", "Basic Typography", "1 Revision"] },
          { name: "Growth", price: 15000, billing: "project", features: ["Brand Identity Kit", "10 Custom Creatives", "Source Files Included"], highlighted: true },
          { name: "Premium", price: 30000, billing: "project", features: ["Full Brand Guidelines", "Unlimited Creatives (Monthly)", "Priority Delivery"] }
        ]
      },
      {
        name: "UI/UX Design",
        idPrefix: "uiux",
        tiers: [
          { name: "Starter", price: 25000, billing: "project", features: ["Up to 5 Pages", "Wireframing", "Basic Prototyping", "2 Revisions"] },
          { name: "Growth", price: 55000, billing: "project", features: ["Up to 15 Pages", "Interactive Prototype", "Design System", "User Testing"], highlighted: true },
          { name: "Premium", price: 95000, billing: "project", features: ["Unlimited Pages", "Complex Web Apps", "Advanced Animations", "Developer Handoff"] }
        ]
      }
    ]
  },
  {
    category: "Development Services",
    badgeIcon: "🔶",
    badgeColor: "bg-[hsl(var(--service-development)/0.1)] text-[hsl(var(--service-development))]",
    services: [
      {
        name: "Web Development",
        idPrefix: "webdev",
        tiers: [
          { name: "Starter", price: 35000, billing: "project", features: ["Landing Page", "Mobile Responsive", "Contact Form", "Basic SEO Setup"] },
          { name: "Growth", price: 75000, billing: "project", features: ["Up to 10 Pages", "CMS Integration", "Custom Animations", "Performance Optimization"], highlighted: true },
          { name: "Premium", price: 150000, billing: "project", features: ["Custom Web Application", "Database Architecture", "API Integrations", "Advanced Security"] }
        ]
      },
      {
        name: "E-Commerce Development",
        idPrefix: "ecom",
        tiers: [
          { name: "Starter", price: 50000, billing: "project", features: ["Up to 50 Products", "Standard Theme", "Payment Gateway", "Basic Shipping Setup"] },
          { name: "Growth", price: 120000, billing: "project", features: ["Unlimited Products", "Custom Theme Design", "Inventory Management", "Abandoned Cart Recovery"], highlighted: true },
          { name: "Premium", price: 250000, billing: "project", features: ["Multi-vendor Marketplace", "Custom ERP Integration", "Advanced Analytics", "Mobile App Included"] }
        ]
      }
    ]
  }
];

const ServiceCatalog = () => {
  return (
    <div className="space-y-24">
      {catalogData.map((category, catIndex) => (
        <section key={catIndex} className="scroll-mt-24">
          <div className="mb-12 text-center md:text-left">
            <div className={`category-badge ${category.badgeColor}`}>
              <span className="mr-2">{category.badgeIcon}</span>
              {category.category}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {category.category}
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl">
              Choose the right tier for your business needs. Upgrade or downgrade at any time as your requirements evolve.
            </p>
          </div>

          <div className="space-y-16">
            {category.services.map((service, srvIndex) => (
              <div key={srvIndex} className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
                <div className="mb-8 border-b border-gray-100 pb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{service.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {service.tiers.map((tier, tierIndex) => {
                    const isHighlighted = tier.highlighted;
                    const isPremium = tier.name === 'Premium';
                    
                    return (
                      <div 
                        key={tierIndex} 
                        className={`service-card flex flex-col h-full ${
                          isHighlighted ? 'service-card-highlighted' : 
                          isPremium ? 'service-card-premium' : ''
                        }`}
                      >
                        {isHighlighted && (
                          <div className="absolute -top-3 left-0 right-0 flex justify-center">
                            <Badge className="bg-primary text-white px-3 py-0.5 text-xs font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Recommended
                            </Badge>
                          </div>
                        )}
                        
                        <div className="mb-6">
                          <h4 className={`text-xl font-bold mb-2 ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                            {tier.name}
                          </h4>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-extrabold tracking-tight ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                              ₹{tier.price.toLocaleString()}
                            </span>
                            <span className={`text-sm font-medium ${isPremium ? 'text-gray-400' : 'text-gray-500'}`}>
                              /{tier.billing}
                            </span>
                          </div>
                        </div>
                        
                        <ul className="space-y-3 mb-8 flex-1">
                          {tier.features.map((feature, fIndex) => (
                            <li key={fIndex} className="feature-list-item">
                              <Check className={`w-5 h-5 shrink-0 mr-3 ${
                                isPremium ? 'text-primary' : 'text-primary'
                              }`} />
                              <span className={isPremium ? 'text-gray-300' : 'text-gray-600'}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ServiceCatalog;