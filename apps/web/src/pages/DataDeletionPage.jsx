import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Mail, ListChecks, Shield, Trash, Clock, CheckCircle, Lock, Eye, ChevronRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.jsx";

const steps = [
  {
    id: 1,
    title: "Request Submission",
    description: "Send an email to hello@oxgenieedge.com with the subject line 'Data Deletion Request'.",
    icon: Mail,
  },
  {
    id: 2,
    title: "Required Information",
    description: "Include your full name, registered email address, and phone number associated with your account.",
    icon: ListChecks,
  },
  {
    id: 3,
    title: "Verification",
    description: "Our team will verify your identity to ensure the security of your data before proceeding.",
    icon: Shield,
  },
  {
    id: 4,
    title: "Deletion Process",
    description: "We will permanently remove your personal data, leads, and associated records from our active systems.",
    icon: Trash,
  },
  {
    id: 5,
    title: "Timeline",
    description: "The complete deletion process typically takes between 7 to 30 business days to finalize.",
    icon: Clock,
  },
  {
    id: 6,
    title: "Confirmation",
    description: "You will receive a final confirmation email once your data has been successfully deleted.",
    icon: CheckCircle,
  }
];

const trustBadges = [
  { title: "GDPR Compliant", icon: Shield },
  { title: "Meta Approved", icon: CheckCircle },
  { title: "Secure Processing", icon: Lock },
  { title: "Transparent Process", icon: Eye },
];

const faqs = [
  {
    question: "How long does the data deletion process take?",
    answer: "We aim to process all data deletion requests within 7 to 30 days of verifying your identity, in compliance with GDPR and other privacy regulations."
  },
  {
    question: "What data exactly gets deleted?",
    answer: "We delete your personal profile information, contact details, lead data, and interaction history. Some anonymized, aggregated data may be retained for statistical purposes, and transactional data may be kept if required by law for tax and accounting purposes."
  },
  {
    question: "Is my request kept confidential?",
    answer: "Yes. All data deletion requests are handled with strict confidentiality by our dedicated privacy team."
  },
  {
    question: "Can I cancel my deletion request?",
    answer: "You can cancel your request within 48 hours of submission by replying to your original email. Once the deletion process has begun, it cannot be reversed."
  },
  {
    question: "What happens to data in backups?",
    answer: "Data in our routine system backups will be naturally overwritten and destroyed according to our standard backup retention cycle (typically 30-90 days). We do not restore personal data from backups once a deletion request has been processed."
  },
  {
    question: "Who can I contact if I have issues?",
    answer: "If you experience any issues or have questions about the process, please contact our support team directly at hello@oxgenieedge.com."
  }
];

const DataDeletionPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Data Deletion Instructions - OxgenieEdge</title>
        <meta name="description" content="Learn how to request data deletion from OxgenieEdge. Compliant with GDPR and Meta requirements. Simple 6-step process." />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1695173583133-c19731e2df44" 
              alt="Data Security Background" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-slate-950/80 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Breadcrumb */}
            <nav className="flex justify-center items-center space-x-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Data Deletion</span>
            </nav>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Data Deletion <span className="text-primary">Instructions</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto text-balance">
              Learn how to request deletion of your data from OxgenieEdge systems. We respect your privacy and make it easy to manage your digital footprint.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">The Deletion Process</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Follow these simple steps to request the permanent removal of your personal information from our databases.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={step.id} 
                    className="relative overflow-hidden p-8 rounded-2xl border border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="absolute -bottom-6 -right-6 text-9xl font-black text-muted/30 group-hover:text-primary/5 transition-colors duration-300 select-none pointer-events-none">
                      {step.id}
                    </div>
                    
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 relative z-10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-3 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground relative z-10">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 bg-muted/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trustBadges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3 shadow-sm">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="font-medium text-sm text-foreground">{badge.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Common questions about our data deletion process.</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_70%)]"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Request Data Deletion?</h2>
            <p className="text-slate-300 mb-10 text-lg max-w-2xl mx-auto">
              Our privacy team is ready to assist you. Send us an email with your details to initiate the process immediately.
            </p>
            <div className="flex flex-col items-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-lg rounded-xl">
                <a href="mailto:hello@oxgenieedge.com?subject=Data%20Deletion%20Request">
                  Contact Support
                </a>
              </Button>
              <p className="text-sm text-slate-400 mt-4">
                Or email us directly at <a href="mailto:hello@oxgenieedge.com" className="text-primary hover:underline">hello@oxgenieedge.com</a>
              </p>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div className="py-6 text-center border-t border-border bg-background">
          <p className="text-sm text-muted-foreground">
            Last Updated: April 23, 2026
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DataDeletionPage;