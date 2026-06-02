import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListListings, useGetPlatformStats, useGetFeaturedListings } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Search, MapPin, CheckCircle2, Shield, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";

export function Home() {

  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"artist" | "vendor" | "venue">("artist");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
 
  const suggestions = [
  "Singer",
  "DJ",
  "Band",
  "Anchor",
  "Dancer",
  "Photography",
  "Makeup",
  "Catering",
  "Decor",
  "Venue"
];

const citySuggestions = [
  "Mumbai",
  "Delhi",
  "Pune",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Lucknow",
  "Varanasi"
];

  
  const { data: statsData } = useGetPlatformStats();
  const { data: featuredData } = useGetFeaturedListings();
  const { data: tabData, isLoading: isTabLoading } = useListListings({ type: activeTab, limit: 6 });

  // Get masonry images from featured listings
  const masonryImages = featuredData ? [
    ...featuredData.artists.map(a => ({ id: a.id, type: 'artist', src: a.coverImage })),
    ...featuredData.vendors.map(v => ({ id: v.id, type: 'vendor', src: v.coverImage })),
    ...featuredData.venues.map(v => ({ id: v.id, type: 'venue', src: v.coverImage })),
  ].slice(0, 9) : [];

  const handleSearch = () => {
  const query = searchQuery.toLowerCase();

  if (
  query.includes("singer") ||
  query.includes("dj") ||
  query.includes("band") ||
  query.includes("anchor") ||
  query.includes("dancer")
) {
  navigate(`/artists?city=${encodeURIComponent(searchCity)}`);
  return;
}

  if (
    query.includes("decor") ||
    query.includes("catering") ||
    query.includes("photography") ||
    query.includes("makeup")
  ) {
    navigate("/vendors");
    return;
  }

  if (
    query.includes("venue") ||
    query.includes("banquet") ||
    query.includes("rooftop") ||
    query.includes("lawn")
  ) {
    navigate("/venues");
    return;
  }

  navigate("/explore");
};

  return (
    <div className="w-full flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="mb-6">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground" data-testid="text-hero-overline">
                  The Discovery Platform for Creative Professionals
                </span>
              </div>
              <h1 className="text-5xl md:text-[72px] lg:text-[80px] font-bold tracking-tight leading-[1.05] mb-8 text-foreground" data-testid="text-hero-heading">
                Discover talent.<br />Book experiences.
              </h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg" data-testid="text-hero-subheading">
                A trusted platform to discover artists, vendors, and venues for weddings, events, and celebrations.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center bg-white rounded-full shadow-sm border border-border p-1.5 mb-10">
                <div className="flex-1 w-full relative flex items-center px-5 py-3">
                  <Input 
                    type="text" 
                    placeholder="What are you looking for?" 
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    className="border-0 bg-transparent focus-visible:ring-0 p-0 text-base shadow-none h-auto w-full placeholder:text-muted-foreground/70"
                    data-testid="input-hero-search-query"
                  />
                </div>
                <div className="hidden sm:block w-px h-8 bg-border"></div>
                <div className="flex-1 w-full relative flex items-center px-5 py-3 border-t sm:border-t-0">
                  <Input 
                    type="text" 
                    placeholder="City or location" 
                    value={searchCity}
                    onChange={(e) => {
                      setSearchCity(e.target.value);
                      setShowCitySuggestions(true);
                    }}
                    className="border-0 bg-transparent focus-visible:ring-0 p-0 text-base shadow-none h-auto w-full placeholder:text-muted-foreground/70"
                    data-testid="input-hero-search-location"
                  />

                  {showCitySuggestions && searchCity && (
  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50">
    {citySuggestions
      .filter((city) =>
        city.toLowerCase().includes(searchCity.toLowerCase())
      )
      .map((city) => (
        <div
          key={city}
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
          onClick={() => {
            setSearchCity(city);
            setShowCitySuggestions(false);
          }}
        >
          {city}
        </div>
      ))}
  </div>
)}

                  {showSuggestions && searchQuery && (
  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50">
    {suggestions
      .filter((item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((item) => (
        <div
          key={item}
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
          onClick={() => {
            setSearchQuery(item);
            setShowSuggestions(false);
          }}
        >
          {item}
        </div>
      ))}
  </div>
)}
                </div>
                <Button size="lg" className="w-full sm:w-auto rounded-full font-semibold px-8 h-12 shrink-0"  onClick={handleSearch} data-testid="button-hero-search">
                  Search
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm font-medium">
                <Button asChild size="lg" className="rounded-full px-8" data-testid="link-hero-explore">
                  <Link href="/explore">Explore Platform</Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="rounded-full px-8" data-testid="link-hero-browse">
                  <Link href="/artists">Browse Categories</Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block h-[600px] w-full"
            >
              {featuredData?.artists[0] && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute top-10 left-0 w-[280px] bg-white rounded-xl shadow-lg border border-border/50 overflow-hidden z-20"
                >
                  <div className="aspect-[4/5] relative">
                    <img src={featuredData.artists[0].coverImage} alt={featuredData.artists[0].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-sm">{featuredData.artists[0].name}</h3>
                      <p className="text-xs text-muted-foreground">{featuredData.artists[0].category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Star className="w-3 h-3 fill-foreground" />
                      <span>{featuredData.artists[0].rating.toFixed(1)}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {featuredData?.venues[0] && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="absolute top-32 left-[200px] w-[340px] bg-white rounded-xl shadow-xl border border-border/50 overflow-hidden z-30"
                >
                  <div className="aspect-video relative">
                    <img src={featuredData.venues[0].coverImage} alt={featuredData.venues[0].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{featuredData.venues[0].name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {featuredData.venues[0].city}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3"/> Up to {featuredData.venues[0].capacity}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {featuredData?.vendors[0] && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="absolute bottom-10 right-0 w-[260px] bg-white rounded-xl shadow-md border border-border/50 overflow-hidden z-10"
                >
                  <div className="aspect-square relative">
                    <img src={featuredData.vendors[0].coverImage} alt={featuredData.vendors[0].name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      Verified
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm">{featuredData.vendors[0].name}</h3>
                    <p className="text-xs text-muted-foreground">{featuredData.vendors[0].category}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-muted py-16 border-y border-border/50">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statsData ? (
              <>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[48px] font-bold tracking-tight mb-2 text-foreground" data-testid="text-stats-professionals">{statsData.totalProfessionals}+</span>
                  <span className="text-sm text-muted-foreground font-medium">Creative Professionals</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[48px] font-bold tracking-tight mb-2 text-foreground" data-testid="text-stats-events">{statsData.eventsSupported.toLocaleString()}+</span>
                  <span className="text-sm text-muted-foreground font-medium">Events Supported</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[48px] font-bold tracking-tight mb-2 text-foreground" data-testid="text-stats-cities">{statsData.citiesCovered}+</span>
                  <span className="text-sm text-muted-foreground font-medium">Cities</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[48px] font-bold tracking-tight mb-2 text-foreground" data-testid="text-stats-satisfaction">98%</span>
                  <span className="text-sm text-muted-foreground font-medium">Satisfaction Rate</span>
                </div>
              </>
            ) : (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center">
                  <div className="h-12 w-24 bg-border rounded animate-pulse mb-3"></div>
                  <div className="h-4 w-32 bg-border rounded animate-pulse"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground" data-testid="text-explore-heading">Explore Creative Professionals</h2>
            <p className="text-muted-foreground text-lg max-w-2xl" data-testid="text-explore-subheading">
              Browse our curated directory of verified artists, vendors, and venues.
            </p>
          </div>

          <Tabs defaultValue="artist" onValueChange={(v) => setActiveTab(v as any)} className="w-full flex flex-col items-center">
            <TabsList className="h-auto p-1.5 bg-muted rounded-full mb-16 inline-flex" data-testid="tabs-explore">
              <TabsTrigger value="artist" className="text-sm font-medium py-2.5 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all" data-testid="tab-artists">Artists</TabsTrigger>
              <TabsTrigger value="vendor" className="text-sm font-medium py-2.5 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all" data-testid="tab-vendors">Vendors</TabsTrigger>
              <TabsTrigger value="venue" className="text-sm font-medium py-2.5 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all" data-testid="tab-venues">Venues</TabsTrigger>
            </TabsList>
            
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {isTabLoading ? (
                  Array(6).fill(0).map((_, i) => <ListingCardSkeleton key={i} />)
                ) : tabData?.listings.length ? (
                  tabData.listings.map((listing, i) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <ListingCard listing={listing} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-muted-foreground">
                    No listings found.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-16 text-center w-full">
              <Link href={`/${activeTab}s`} className="inline-flex items-center text-sm font-semibold hover:text-muted-foreground transition-colors border-b border-foreground hover:border-muted-foreground pb-0.5" data-testid={`link-view-all-${activeTab}`}>
                View all {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s →
              </Link>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-white border-y border-border/50">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
            <div className="flex flex-col items-start text-left">
              <CheckCircle2 className="w-8 h-8 text-foreground mb-6" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-3 text-foreground" data-testid="text-trust-title-1">Verified Professionals</h3>
              <p className="text-muted-foreground leading-relaxed text-sm" data-testid="text-trust-desc-1">
                Every listing is reviewed and verified by our team to ensure the highest standard.
              </p>
            </div>
            <div className="flex flex-col items-start text-left">
              <Star className="w-8 h-8 text-foreground mb-6" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-3 text-foreground" data-testid="text-trust-title-2">Curated Portfolios</h3>
              <p className="text-muted-foreground leading-relaxed text-sm" data-testid="text-trust-desc-2">
                Rich portfolio galleries that let the extraordinary work speak for itself.
              </p>
            </div>
            <div className="flex flex-col items-start text-left">
              <Shield className="w-8 h-8 text-foreground mb-6" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-3 text-foreground" data-testid="text-trust-title-3">Trusted by Organizers</h3>
              <p className="text-muted-foreground leading-relaxed text-sm" data-testid="text-trust-desc-3">
                Thousands of event organizers rely on OnFocus for their most important events.
              </p>
            </div>
            <div className="flex flex-col items-start text-left">
              <Search className="w-8 h-8 text-foreground mb-6" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-3 text-foreground" data-testid="text-trust-title-4">Seamless Discovery</h3>
              <p className="text-muted-foreground leading-relaxed text-sm" data-testid="text-trust-desc-4">
                Find exactly who you need, seamlessly filtered by category and city.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Portfolio Section */}
      {masonryImages.length > 0 && (
        <section className="py-32 bg-background">
          <div className="container mx-auto px-6 md:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16 text-center text-foreground" data-testid="text-portfolio-heading">Featured Work</h2>
            
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {masonryImages.map((img, i) => (
                <Link key={`${img.id}-${i}`} href={`/listing/${img.id}`} className="block break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer" data-testid={`link-portfolio-img-${i}`}>
                  <img 
                    src={img.src} 
                    alt="Featured portfolio work" 
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Join CTA Banner */}
      <section className="py-32 bg-foreground text-background">
        <div className="container mx-auto px-6 md:px-8 text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8" data-testid="text-cta-heading">Are you a creative professional?</h2>
          <p className="text-xl md:text-2xl text-background/70 mb-12 leading-relaxed" data-testid="text-cta-subheading">
            Join OnFocus and connect with thousands of event organizers looking for talent like yours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto rounded-full font-semibold px-8 h-14 text-base bg-background text-foreground hover:bg-background/90" asChild data-testid="link-cta-apply">
              <Link href="/join">Apply as Partner</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-semibold px-8 h-14 text-base border-background/20 text-background hover:bg-background/10" asChild data-testid="link-cta-learn">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
