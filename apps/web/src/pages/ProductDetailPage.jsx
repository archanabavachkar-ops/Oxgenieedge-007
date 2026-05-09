import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProduct } from '@/api/EcommerceApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, PackageX, MessageSquare, ArrowRight } from 'lucide-react';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzliY2E0ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
    }
  }, [product?.images?.length]);

  const handleNextImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
    }
  }, [product?.images?.length]);

  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);

    if (variant.image_url && product?.images?.length > 0) {
      const imageIndex = product.images.findIndex(image => image.url === variant.image_url);
      if (imageIndex !== -1) {
        setCurrentImageIndex(imageIndex);
      }
    }
  }, [product?.images]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProduct = await getProduct(id);
        setProduct(fetchedProduct);

        if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
          setSelectedVariant(fetchedProduct.variants[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-8 -ml-4">
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <div className="text-center p-12 border border-destructive/20 bg-destructive/5 rounded-2xl">
          <PackageX className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || "The product you're looking for doesn't exist or has been removed."}</p>
          <Button asChild>
            <Link to="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentImage = product.images[currentImageIndex];
  const hasMultipleImages = product.images.length > 1;

  return (
    <>
      <Helmet>
        <title>{`${product.title} | OxgenieEdge`}</title>
        <meta name="description" content={product.subtitle || product.title} />
      </Helmet>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="space-y-4"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
              <img
                src={!currentImage?.url ? placeholderImage : currentImage.url}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {hasMultipleImages && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-md opacity-80 hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-md opacity-80 hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {product.ribbon_text && (
                <Badge className="absolute top-4 left-4 shadow-md text-sm px-3 py-1">
                  {product.ribbon_text}
                </Badge>
              )}
            </div>

            {hasMultipleImages && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all snap-start ${
                      index === currentImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img
                      src={!image.url ? placeholderImage : image.url}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }} 
            className="flex flex-col"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
              {product.title}
            </h1>
            
            {product.subtitle && (
              <p className="text-lg text-muted-foreground mb-6">
                {product.subtitle}
              </p>
            )}

            <Separator className="mb-6" />

            {/* Variants Selection */}
            {product.variants.length > 1 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-foreground">Select Option</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map(variant => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <Button
                        key={variant.id}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => handleVariantSelect(variant)}
                        className={`transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                      >
                        {variant.title}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="space-y-6 mb-8 bg-muted/50 p-6 rounded-2xl border border-border">
              <div className="flex-1">
                <p className="text-sm text-foreground mb-4">
                  Interested in this product? Contact our team to discuss your requirements and get a custom quote.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild
                  size="lg" 
                  className="flex-1 h-14 text-lg font-semibold" 
                >
                  <Link to="/contact">
                    <MessageSquare className="mr-2 h-5 w-5" /> 
                    Inquire Now
                  </Link>
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Product Description</h3>
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            {/* Secondary Get Started CTA */}
            <div className="mb-8">
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => navigate('/contact')}
                className="group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Additional Info */}
            {product.additional_info?.length > 0 && (
              <div className="space-y-6 border-t border-border pt-8">
                {product.additional_info
                  .sort((a, b) => a.order - b.order)
                  .map((info) => (
                    <div key={info.id}>
                      <h4 className="text-base font-semibold text-foreground mb-2">{info.title}</h4>
                      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: info.description }} />
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default ProductDetailPage;