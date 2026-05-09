import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, PackageX, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getProducts, formatCurrency } from '@/api/EcommerceApi';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzliY2E0ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

const ProductCard = ({ product, index, navigate }) => {
  const hasVariants = product.variants && product.variants.length > 0;
  const defaultVariant = hasVariants ? product.variants[0].id : 'default';
  
  // Identify if this is a premium product for special styling
  const isPremium = 
    product.title?.toLowerCase().includes('premium') || 
    product.collections?.some(c => c.collection_id?.toLowerCase().includes('premium')) ||
    product.ribbon_text?.toLowerCase().includes('premium');

  // Mock features if they aren't provided by the API for a richer display
  const getMockFeatures = (variantTitle) => {
    const title = variantTitle?.toLowerCase() || '';
    if (title.includes('premium') || isPremium) return ['Everything in Growth', 'Dedicated Account Manager', 'Custom Integrations', '24/7 Priority Support', 'Advanced Security'];
    if (title.includes('growth')) return ['Everything in Starter', 'Advanced Analytics', 'Increased Limits', 'Priority Email Support'];
    return ['Basic Features', 'Standard Support', 'Community Access'];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`h-full flex flex-col rounded-2xl border ${isPremium ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border bg-card'} text-card-foreground shadow-sm group hover:shadow-lg transition-all duration-300 overflow-visible`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted shrink-0 rounded-t-2xl">
        <img
          src={product.image || placeholderImage}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.ribbon_text && (
          <Badge className={`absolute top-4 left-4 shadow-sm px-3 py-1 text-xs font-medium ${isPremium ? 'bg-primary text-primary-foreground' : ''}`}>
            {product.ribbon_text}
          </Badge>
        )}
        {isPremium && !product.ribbon_text && (
          <Badge className="absolute top-4 left-4 shadow-sm px-3 py-1 text-xs font-medium bg-primary text-primary-foreground">
            Premium
          </Badge>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-6">
          <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            {product.title}
          </h3>
          <div className="text-sm text-muted-foreground whitespace-normal break-words space-y-2">
            {product.subtitle && (
              <p className="font-medium text-foreground/80">{product.subtitle}</p>
            )}
            {product.description ? (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              !product.subtitle && <p>Explore our comprehensive solutions tailored for your business needs.</p>
            )}
          </div>
        </div>

        {hasVariants ? (
          <Tabs defaultValue={defaultVariant} className="w-full flex flex-col flex-grow">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl h-auto shrink-0">
              {product.variants.map((variant) => (
                <TabsTrigger 
                  key={variant.id} 
                  value={variant.id}
                  className="rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2 whitespace-normal h-auto"
                >
                  {variant.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {product.variants.map((variant) => (
              <TabsContent key={variant.id} value={variant.id} className="flex flex-col flex-grow mt-0 outline-none">
                <div className="mb-6 flex-grow">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">
                      {variant.price_formatted || formatCurrency(variant.price_in_cents, variant.currency_info) || `₹${(variant.price_in_cents / 100).toLocaleString()}`}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">/project</span>
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  <ul className="space-y-3 mb-6">
                    {getMockFeatures(variant.title).map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-muted-foreground">
                        <CheckCircle2 className={`h-4 w-4 mr-2 shrink-0 mt-0.5 ${isPremium ? 'text-primary' : 'text-foreground/60'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4 shrink-0">
                  <Button 
                    onClick={() => navigate(`/product/${product.id}`)}
                    variant={isPremium ? 'default' : 'outline'}
                    className={`w-full group h-12 text-base font-semibold shadow-sm hover:shadow transition-all ${isPremium ? '' : 'bg-background hover:bg-muted'}`}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex flex-col flex-grow justify-end mt-4">
            <div className="mb-6">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                {formatCurrency(product.price_in_cents, { code: product.currency, symbol: '₹' }) || `₹${(product.price_in_cents / 100).toLocaleString()}`}
              </span>
            </div>
            <Button 
              onClick={() => navigate(`/product/${product.id}`)}
              variant={isPremium ? 'default' : 'outline'}
              className={`w-full group h-12 text-base font-semibold shadow-sm hover:shadow transition-all ${isPremium ? '' : 'bg-background hover:bg-muted'}`}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ProductsList = ({ categoryFilter = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("DEBUG: Fetching products from EcommerceApi...");
        const productsResponse = await getProducts();

        if (!productsResponse.products || productsResponse.products.length === 0) {
          console.warn("DEBUG: No products returned from API.");
          setProducts([]);
          return;
        }

        // Comprehensive Debugging Investigation
        console.log("DEBUG [Step 1]: Raw products data:", productsResponse.products);
        
        // Check for Premium Category exact values and count
        const premiumProducts = productsResponse.products.filter(p => 
          p.title?.toLowerCase().includes('premium') ||
          p.collections?.some(c => c.collection_id?.toLowerCase().includes('premium')) ||
          p.ribbon_text?.toLowerCase().includes('premium')
        );
        
        console.log(`DEBUG [Step 2]: Count of premium products found: ${premiumProducts.length}`);
        if (premiumProducts.length > 0) {
          console.log("DEBUG [Step 3]: Premium Products Data:", premiumProducts);
        } else {
          console.warn("DEBUG [Step 3]: NO premium products found matching 'premium' string.");
        }

        // Extract and log all unique categories/collections to check exact naming
        const uniqueCategories = new Set();
        productsResponse.products.forEach(p => {
          if (p.collections) p.collections.forEach(c => uniqueCategories.add(c.collection_id));
        });
        console.log("DEBUG [Step 4]: All unique category/collection IDs from API:", Array.from(uniqueCategories));

        setProducts(productsResponse.products);
      } catch (err) {
        console.error("DEBUG [ERROR]: Failed to fetch products:", err);
        setError(err.message || 'Failed to load products from the store.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Case-insensitive filtering logic that handles exact and partial matches
  const displayedProducts = useMemo(() => {
    if (!categoryFilter) return products;
    
    const lowerCategory = categoryFilter.toLowerCase();
    const filtered = products.filter(p => 
      p.title?.toLowerCase().includes(lowerCategory) ||
      p.collections?.some(c => c.collection_id?.toLowerCase() === lowerCategory || c.collection_id?.toLowerCase().includes(lowerCategory)) ||
      p.type?.value?.toLowerCase() === lowerCategory ||
      p.ribbon_text?.toLowerCase().includes(lowerCategory)
    );
    
    console.log(`DEBUG [Filter]: Applied category filter '${categoryFilter}', resulting in ${filtered.length} products.`);
    return filtered;
  }, [products, categoryFilter]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading solutions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 border border-destructive/20 bg-destructive/5 rounded-2xl max-w-2xl mx-auto">
        <PackageX className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Unable to load solutions</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    return (
      <div className="text-center p-12 border border-border bg-card rounded-2xl max-w-2xl mx-auto">
        <PackageX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No solutions found</h3>
        <p className="text-muted-foreground">
          {categoryFilter 
            ? `No solutions found matching the category "${categoryFilter}".` 
            : "Check back later for new offerings."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
      {displayedProducts.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} navigate={navigate} />
      ))}
    </div>
  );
};

export default ProductsList;