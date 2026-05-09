import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, MessageCircle as MessageCircleQuestion } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

// 1. Strict definition of FAQ data array.
// NO nested objects or arrays in 'answer' or 'content' fields.
const rawFaqData = [
  {
    id: 1,
    category: 'Services',
    question: 'What exactly does OxgenieEdge do?',
    answer: 'We build and implement AI-driven growth systems for businesses. This includes intelligent lead capture, automated CRM workflows, 24/7 conversational AI agents, and complete sales pipeline optimization tailored to your specific industry.'
  },
  {
    id: 2,
    category: 'Services',
    question: 'Do you work with my specific industry?',
    answer: 'While our AI architecture is highly adaptable, we specialize in Real Estate, Healthcare, Education, and Professional Services. We train our AI models specifically on your industry\'s terminology, compliance requirements, and customer journey.'
  },
  {
    id: 3,
    category: 'Results & Performance',
    question: 'How soon can I expect to see results?',
    answer: 'Most clients see a measurable increase in lead response times and engagement within the first 14 days of launch. Significant pipeline growth and conversion improvements typically stabilize around the 60-day mark as the AI continuously learns and optimizes.'
  },
  {
    id: 4,
    category: 'Results & Performance',
    question: 'What kind of ROI do your clients usually see?',
    answer: 'On average, our partners report a 3x increase in lead-to-appointment conversion rates, while reducing their cost-per-acquisition by 40% through intelligent qualification and automated follow-ups.'
  },
  {
    id: 5,
    category: 'Pricing & Payments',
    question: 'How does your pricing work?',
    answer: 'We offer tiered monthly subscriptions based on your lead volume, active AI agents, and required integrations. We also provide custom enterprise plans for high-volume organizations needing dedicated infrastructure.'
  },
  {
    id: 6,
    category: 'Pricing & Payments',
    question: 'Are there any setup fees or hidden costs?',
    answer: 'Our pricing is completely transparent. We charge a one-time onboarding and model training fee based on the complexity of your workflow, followed by your flat monthly subscription. There are no hidden costs or surprise usage fees.'
  },
  {
    id: 7,
    category: 'AI & Automation',
    question: 'Will the AI sound like a robot to my customers?',
    answer: 'No. Our advanced LLMs are extensively fine-tuned on your brand voice, past successful communications, and industry context. The interactions feel natural, conversational, and highly personalized.'
  },
  {
    id: 8,
    category: 'AI & Automation',
    question: 'How does the AI chatbot handle complex questions?',
    answer: 'When the AI encounters a high-complexity query or an explicitly requested human escalation, it seamlessly routes the conversation to the right team member, providing them with a full summary of the chat history so the customer never has to repeat themselves.'
  },
  {
    id: 9,
    category: 'Trust & Support',
    question: 'How secure is our customer data?',
    answer: 'Security is foundational to our platform. We utilize enterprise-grade AES-256 encryption, comply strictly with SOC2 and GDPR standards, and ensure your data is isolated and never used to train global public AI models.'
  },
  {
    id: 10,
    category: 'Trust & Support',
    question: 'What kind of support do you provide?',
    answer: 'Every client receives access to our priority ticketing system and comprehensive knowledge base. Growth and Enterprise tier clients also get a dedicated Technical Account Manager and quarterly business reviews to optimize your AI strategy.'
  }
];

// 6. Explicit type checking: verify faqData is an array before any operations
const faqData = Array.isArray(rawFaqData) ? rawFaqData : [];

const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // 2, 3, 4, 5, 6. Search function using ONLY safe string operations and basic array filtering
  const filteredFaqs = useMemo(() => {
    if (!searchTerm) {
      return faqData;
    }
    
    // Safely cast search term to string
    const query = String(searchTerm).trim().toLowerCase();
    
    if (!query) {
      return faqData;
    }
    
    // Filter the main faqData array ONLY
    return faqData.filter((item) => {
      // Defensive check: ensure item exists
      if (!item) return false;
      
      // Defensive check: verify each property is a string before calling .toLowerCase().includes()
      // This strictly prevents the 'o.content.filter is not a function' error 
      // by ensuring we only interact with plain strings.
      const q = typeof item.question === 'string' ? item.question.toLowerCase() : '';
      const a = typeof item.answer === 'string' ? item.answer.toLowerCase() : '';
      const c = typeof item.category === 'string' ? item.category.toLowerCase() : '';
      
      return q.includes(query) || a.includes(query) || c.includes(query);
    });
  }, [searchTerm]);

  // Extract unique categories safely
  const categories = useMemo(() => {
    const allCategories = filteredFaqs.map((item) => 
      item && typeof item.category === 'string' ? item.category : 'General'
    );
    return [...new Set(allCategories)];
  }, [filteredFaqs]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Helmet>
        <title>{`FAQ | OxgenieEdge`}</title>
        <meta name="description" content="Frequently asked questions about OxgenieEdge's AI automation, CRM, and lead generation services." />
      </Helmet>
      
      <Header />

      <main className="flex-1">
        <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 text-primary">
                <MessageCircleQuestion className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-950 leading-tight tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
                Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
                Everything you need to know before getting started with OxgenieEdge's intelligent growth systems.
              </p>

              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  type="text"
                  placeholder="Search questions or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 text-base rounded-2xl shadow-sm border-slate-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary text-slate-900 placeholder:text-slate-500 bg-white transition-all"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredFaqs.length > 0 ? (
              <div className="space-y-12">
                {categories.map((category) => {
                  // Pre-filter items for this category to avoid inline complex logic during render
                  const categoryItems = filteredFaqs.filter(
                    (item) => item && item.category === category
                  );

                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category} className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3" style={{ letterSpacing: '-0.02em' }}>
                        {category}
                      </h2>
                      
                      <div className="bg-white rounded-2xl shadow-sm p-2 sm:p-4 ring-1 ring-slate-200">
                        <Accordion type="multiple" className="w-full space-y-2">
                          {categoryItems.map((item) => (
                            <AccordionItem
                              key={item.id}
                              value={`item-${item.id}`}
                              className="border border-transparent data-[state=open]:border-slate-100 data-[state=open]:bg-slate-50/50 rounded-xl px-4 transition-all duration-200"
                            >
                              <AccordionTrigger className="text-left font-semibold text-slate-900 text-lg hover:no-underline hover:text-primary py-4">
                                {item.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-slate-600 leading-relaxed text-base pb-5">
                                {item.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  We couldn't find any questions matching "{searchTerm}". Please try a different search term.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FaqPage;