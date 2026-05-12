import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
    budgetRange: "",
    preferredContact: "",
    subject: "",
    message: "",
});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // (1) Validate that name and email are not empty
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // (2) Create JSON payload with all fields
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        designation: formData.designation,
        budgetRange: formData.budgetRange,
        preferredContact: formData.preferredContact,
        subject: formData.subject,
        message: formData.message,
      };

      // (3) Call apiServerClient.fetch
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let data = {};

      try {
        data = await response.json();
      } catch (err) {
        data = {
          success: false,
          error: 'Invalid server response',
        };
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save contact");
      }

      // (4) On success, show success toast message and clear form
      toast.success("Contact saved successfully");
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        designation: "",
        budgetRange: "",
        preferredContact: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      // (5) On error, show error toast message
      toast.error(error.message || "Failed to save contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <Helmet>
        <title>{`Contact Us | Lead Capture`}</title>
        <meta name="description" content="Get in touch with our team today." />
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Contact Info */}
          <div className="flex flex-col space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>
                Let's build something great together.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-[65ch]">
                Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.
              </p>
            </div>

            <div className="space-y-6 pt-8 border-t border-border">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Email us</h3>
                  <p className="text-muted-foreground mt-1">Our friendly team is here to help.</p>
                  <a href="mailto:hello@example.com" className="text-primary font-medium hover:underline mt-2 inline-block">
                    hello@example.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Visit us</h3>
                  <p className="text-muted-foreground mt-1">Come say hello at our office HQ.</p>
                  <p className="text-foreground font-medium mt-2">
                    100 Smith Street<br />
                    Collingwood VIC 3066 AU
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Call us</h3>
                  <p className="text-muted-foreground mt-1">Mon-Fri from 8am to 5pm.</p>
                  <a href="tel:+15550000000" className="text-primary font-medium hover:underline mt-2 inline-block">
                    +1 (555) 000-0000
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-card text-card-foreground rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-semibold mb-6">Lead Capture Form</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Maya Chen"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="maya@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>

                <Input
                  id="company"
                  name="company"
                  placeholder="Your Company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>

                <Input
                  id="designation"
                  name="designation"
                  placeholder="CEO, Founder, Sales Head..."
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetRange">Budget Range</Label>

                <select
                  id="budgetRange"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Budget</option>
                  <option value="under_1000">Under ₹1,000</option>
                  <option value="1000_5000">₹1,000 - ₹5,000</option>
                  <option value="5000_25000">₹5,000 - ₹25,000</option>
                  <option value="25000_plus">₹25,000+</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredContact">
                  Preferred Contact Method
                </Label>

                <select
                  id="preferredContact"
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Method</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Service Interest</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g. Web Development, Consulting"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Description</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us a little about your project..."
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full group transition-all" 
                disabled={isSubmitting || !formData.name || !formData.email}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}