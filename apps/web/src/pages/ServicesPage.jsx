import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowRight, Layers } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const records = await pb.collection('products').getFullList({
          filter: 'type="service"',
          sort: '-created',
          $autoCancel: false
        });
        setServices(records);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleGetStarted = (serviceName) => {
    localStorage.setItem('selectedService', serviceName);
    navigate('/contact');
  };

  return (
    <>
      <Helmet>
        <title>Our Services - OxgenieEdge</title>
        <meta name="description" content="Explore our comprehensive range of digital marketing and development services." />
      </Helmet>
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Services designed for growth
            </h1>
            <p className="text-xl text-gray-600">
              From SEO to custom web development, we provide end-to-end solutions to elevate your digital presence.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100">
                  <Skeleton className="w-12 h-12 rounded-xl mb-6" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-8" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500">We are currently updating our service offerings. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Layers className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h3>
                  <p className="text-gray-600 mb-8 flex-1 leading-relaxed">
                    {service.description || 'Comprehensive solution tailored to your specific business requirements.'}
                  </p>
                  
                  <div className="mt-auto">
                    <Button 
                      onClick={() => handleGetStarted(service.name)}
                      className="w-full group-hover:bg-primary/90 transition-colors"
                      variant="outline"
                    >
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ServicesPage;