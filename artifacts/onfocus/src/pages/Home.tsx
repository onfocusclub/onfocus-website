import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListListings, useGetPlatformStats, useGetFeaturedListings } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Search, MapPin, CheckCircle2, Shield, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";

export function Home() {

  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"artist" | "vendor" | "venue">("artist");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const searchOptions = [
    { label: "Singer", type: "artist", aliases: ["singer", "vocalist", "bollywood singer"] },
    { label: "DJ", type: "artist", aliases: ["dj", "disc jockey"] },
    { label: "Band", type: "artist", aliases: ["band", "live band", "musician"] },
    { label: "Anchor", type: "artist", aliases: ["anchor", "host", "emcee"] },
    { label: "Dancer", type: "artist", aliases: ["dancer", "dance", "classical dancer"] },
    { label: "Photographer", type: "vendor", aliases: ["photography", "photographer", "photo"] },
    { label: "Makeup Artist", type: "vendor", aliases: ["makeup", "makeup artist", "mua"] },
    { label: "Catering", type: "vendor", aliases: ["catering", "caterer", "food"] },
    { label: "Lighting & Decor", type: "vendor", aliases: ["decor", "decoration", "lighting"] },
    { label: "Banquet Hall", type: "venue", aliases: ["venue", "banquet", "hall"] },
    { label: "Rooftop Venue", type: "venue", aliases: ["rooftop", "terrace"] },
    { label: "Garden / Lawn", type: "venue", aliases: ["lawn", "garden"] },
  ] as const;

  const citySuggestions = [
    "Mumbai", "Delhi", "Pune", "Bangalore", "Hyderabad", "Chennai",
    "Kolkata", "Jaipur", "Lucknow", "Varanasi", "Gurugram", "Gurgaon",
    "Ghaziabad", "Goa", "Guwahati", "Gwalior", "Greater Noida", "Noida",
    "Ahmedabad", "Indore", "Bhopal", "Surat", "Udaipur", "Chandigarh", "Dehradun",
  ];

  const cityMatches = searchCity.trim()
    ? citySuggestions.filter((city) =>
        city.toLowerCase().includes(searchCity.trim().toLowerCase())
      )
    : [];

  const { data: statsData } = useGetPlatformStats();
  const { data: featuredData } = useGetFeaturedListings();
  const { data: tabData, isLoading: isTabLoading } = useListListings({ type: activeTab, limit: 6 });

  const masonryImages = featuredData ? [
    ...featuredData.artists.map(a => ({ id: a.id, type: 'artist', src: a.coverImage })),
    ...featuredData.vendors.map(v => ({ id: v.id, type: 'vendor', src: v.coverImage })),
    ...featuredData.venues.map(v => ({ id: v.id, type: 'venue', src: v.coverImage })),
  ].slice(0, 9) : [];

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    const city = searchCity.trim();

    if (!query && !city) {
      navigate("/explore");
      return;
    }

    const match = searchOptions.find((item) =>
      [item.label, ...item.aliases].some((value) => value.toLowerCase() === query)
    );

    const params = new URLSearchParams();
    if (city) params.set("city", city);

    if (match) {
      params.set("category", match.label);
      navigate(`/${match.type}s?${params.toString()}`);
      return;
    }

    params.set("query", searchQuery.trim());
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text + Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="mb-6">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
                  The Discovery Platform for Creative Professionals
                </span>
              </div>
              <h1 className="text-5xl md:text-[72px] lg:text-[80px] font-bold tracking-tight leading-[1.05] mb-8 text-foreground">
                Discover talent.<br />Book experiences.
              </h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
                A trusted platform to discover artists, vendors, and venues for weddings, events, and celebrations.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-center bg-white rounded-full shadow-sm border border-border p-1.5 mb-10">
                <div className="flex-1 w-full relative flex items-center px-5 py-3">
                  <Input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                    className="border-0 bg-transparent focus-visible:ring-0 p-0 text-base shadow-none h-auto w-full placeholder:text-muted-foreground/70"
                  />
                </div>
                <div className="hidden sm:block w-px h-8 bg-border"></div>
                <div className="flex-1 w-full relative flex items-center px-5 py-3 border-t sm:border-t-0">
                  <Input
                    type="text"
                    placeholder="City or location"
                    value={searchCity}
                    onChange={(e) => { setSearchCity(e.target.value); setShowCitySuggestions(true); }}
                    className="border-0 bg-transparent focus-visible:ring-0 p-0 text-base shadow-none h-auto w-full placeholder:text-muted-foreground/70"
                  />
                  {showCitySuggestions && searchCity && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 overflow-hidden">
                      {cityMatches.map((city) => (
                        <div key={city} className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => { setSearchCity(city); setShowCitySuggestions(false); }}>
                          {city}
                        </div>
                      ))}
                      {cityMatches.length === 0 && (
                        <div className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => { setSearchCity(searchCity.trim()); setShowCitySuggestions(false); }}>
                          Use "{searchCity.trim()}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button size="lg" className="w-full sm:w-auto rounded-full font-semibold px-8 h-12 shrink-0" onClick={handleSearch}>
                  Search
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm font-medium">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link href="/explore">Explore Platform</Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="rounded-full px-8">
                  <Link href="/artists">Browse Categories</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right: Photo Collage — no text, just images */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block h-[600px] w-full"
            >
              {/* Top-left portrait */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute top-0 left-0 w-[220px] h-[300px] rounded-2xl overflow-hidden shadow-xl z-20"
              >
                <img
                  src="/hero/WhatsApp Image 2026-06-06 at 4.26.34 PM.jpeg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Large center image */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute top-[80px] left-[160px] w-[320px] h-[400px] rounded-2xl overflow-hidden shadow-2xl z-30"
              >
                <img
                  src="/hero/WhatsApp Image 2026-06-06 at 4.27.37 PM.jpeg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Bottom-right image */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute bottom-0 right-0 w-[220px] h-[280px] rounded-2xl overflow-hidden shadow-xl z-20"
              >
                <img
                  src="/hero/WhatsApp Image 2026-06-06 at 4.28.09 PM.jpeg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Left edge blend */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-40 pointer-events-none" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Strip */}
      {/* Stats Strip */}
<section className="bg-background py-16 border-y border-border/50">
  <div className="container mx-auto px-6 md:px-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div className="flex flex-col items-center justify-center">
        <span className="text-[48px] font-bold tracking-tight mb-2 text-foreground">12+</span>
        <span className="text-sm text-muted-foreground font-medium">Shows & Events</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="text-[48px] font-bold tracking-tight mb-2 text-foreground">3000+</span>
        <span className="text-sm text-muted-foreground font-medium">Artists & Attendees Impacted</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="text-[48px] font-bold tracking-tight mb-2 text-foreground">1800+</span>
        <span className="text-sm text-muted-foreground font-medium">Largest Event Attendance</span>
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="text-[48px] font-bold tracking-tight mb-2 text-foreground">98%</span>
        <span className="text-sm text-muted-foreground font-medium">Satisfaction Rate</span>
      </div>
    </div>
  </div>
</section>

      {/* Explore Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">Explore Creative Professionals</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Browse our curated directory of verified artists, vendors, and venues.
            </p>
          </div>

          <Tabs defaultValue="artist" onValueChange={(v) => setActiveTab(v as any)} className="w-full flex flex-col items-center">
            <TabsList className="h-auto p-1.5 bg-muted rounded-full mb-16 inline-flex">
              <TabsTrigger value="artist" className="text-sm font-medium py-2.5 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all">Artists</TabsTrigger>
              <TabsTrigger value="vendor" className="text-sm font-medium py-2.5 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all">Vendors</TabsTrigger>
              <TabsTrigger value="venue" className="text-sm font-medium py-2.5 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all">Venues</TabsTrigger>
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
              <Link href={`/${activeTab}s`} className="inline-flex items-center text-sm font-semibold hover:text-muted-foreground transition-colors border-b border-foreground hover:border-muted-foreground pb-0.5">
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
              <h3 className="text-lg font-bold mb-3 text-foreground">Verified Professionals</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Every listing is reviewed and verified by our team to ensure the highest standard.</p>
            </div>
            <div className="flex flex-col items-start text-left">
              <Star className="w-8 h-8 text-foreground mb-6" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-3 text-foreground">Curated Portfolios</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Rich portfolio galleries that let the extraordinary work speak for itself.</p>
            </div>
            <div className="flex flex-col items-start text-left">
              <Shield className="w-8 h-8 text-foreground mb-6" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-3 text-foreground">Trusted by Organizers</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Thousands of event organizers rely on OnFocus for their most important events.</p>
            </div>
            <div className="flex flex-col items-start text-left">
              <Search className="w-8 h-8 text-foreground mb-6" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-3 text-foreground">Seamless Discovery</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">Find exactly who you need, seamlessly filtered by category and city.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Portfolio Section */}
      {masonryImages.length > 0 && (
        <section className="py-32 bg-background">
          <div className="container mx-auto px-6 md:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16 text-center text-foreground">Featured Work</h2>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {masonryImages.map((img, i) => (
                <Link key={`${img.id}-${i}`} href={`/listing/${img.id}`} className="block break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer">
                  <img src={img.src} alt="Featured portfolio work" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
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
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Are you a creative professional?</h2>
          <p className="text-xl md:text-2xl text-background/70 mb-12 leading-relaxed">
            Join OnFocus and connect with thousands of event organizers looking for talent like yours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto rounded-full font-semibold px-8 h-14 text-base bg-background text-foreground hover:bg-background/90" asChild>
              <Link href="/join">Apply as Partner</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-semibold px-8 h-14 text-base border-background/20 text-background hover:bg-background/10" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}