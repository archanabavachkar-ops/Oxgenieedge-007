import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Terms of Service - OxgenieEdge</title>
        <meta name="description" content="Terms of Service for OxgenieEdge. Read our user agreement and terms of use." />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: April 23, 2026
          </p>
        </div>

        <div className="space-y-10 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
            <p className="mb-4">
              By accessing or using the services provided by OxgenieEdge ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Use of Services</h2>
            <p className="mb-4">
              You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to use our services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent.</li>
              <li>To impersonate or attempt to impersonate OxgenieEdge, an OxgenieEdge employee, another user, or any other person or entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Intellectual Property Rights</h2>
            <p className="mb-4">
              The services and their entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by OxgenieEdge, its licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Limitation of Liability</h2>
            <p className="mb-4">
              In no event will OxgenieEdge, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, our services, any websites linked to it, any content on our services or such other websites, including any direct, indirect, special, incidental, consequential, or punitive damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your access to all or part of our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the services will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-muted p-6 rounded-xl border border-border">
              <p className="font-medium text-foreground">OxgenieEdge</p>
              <p className="text-muted-foreground mt-1">Email: hello@oxgenieedge.com</p>
              <p className="text-muted-foreground">Phone: +91 9422008201</p>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;