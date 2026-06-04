import { useState } from "react";
import { useListCategories } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";


const SEARCH_OPTIONS = [
 { label: "Singer", type: "artist", aliases: ["singer", "singers", "singing", "vocalist", "vocalists", "bollywood singer", "bollywood singers"] },
{ label: "DJ", type: "artist", aliases: ["dj", "djs", "disc jockey", "disc jockeys"] },
{ label: "Band", type: "artist", aliases: ["band", "bands", "live band", "live bands", "musician", "musicians"] },
{ label: "Anchor", type: "artist", aliases: ["anchor", "anchors", "host", "hosts", "emcee", "emcees"] },
{ label: "Dancer", type: "artist", aliases: ["dancer", "dancers", "dance", "classical dancer", "classical dancers", "bollywood dancer", "bollywood dancers"] },
  { label: "Photographer", type: "vendor", aliases: ["photography", "photographer", "photographers", "photo", "photos"] },
{ label: "Makeup Artist", type: "vendor", aliases: ["makeup", "makeup artist", "makeup artists", "mua"] },
{ label: "Catering", type: "vendor", aliases: ["catering", "caterer", "caterers", "food"] },
{ label: "Lighting & Decor", type: "vendor", aliases: ["decor", "decoration", "decorator", "decorators", "lighting", "lights"] },
{ label: "Banquet Hall", type: "venue", aliases: ["venue", "venues", "banquet", "banquets", "hall", "halls", "banquet hall", "banquet halls"] },
{ label: "Rooftop Venue", type: "venue", aliases: ["rooftop", "rooftops", "terrace", "terraces", "rooftop venue", "rooftop venues"] },
{ label: "Garden / Lawn", type: "venue", aliases: ["lawn", "lawns", "garden", "gardens", "garden venue", "garden venues"] },
] as const;

export function Explore() {
  const { data, isLoading } = useListCategories();
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const requestedQuery = searchParams.get("query")?.trim();
  const [searchQuery, setSearchQuery] = useState(requestedQuery ?? "");

  const handleExploreSearch = () => {
    const typedSearch = searchQuery.trim();

    if (!typedSearch) {
      navigate("/explore");
      return;
    }

    const normalizedSearch = typedSearch.toLowerCase();
    const singularSearch = normalizedSearch.endsWith("s")
  ? normalizedSearch.slice(0, -1)
  : normalizedSearch;
    const matchedOption = SEARCH_OPTIONS.find((option) =>
      [option.label, ...option.aliases].some(
        (value) => {
  const normalizedValue = value.toLowerCase();
  return normalizedValue === normalizedSearch || normalizedValue === singularSearch;
}
      )
    );

    if (matchedOption) {
      navigate(`/${matchedOption.type}s?category=${encodeURIComponent(matchedOption.label)}`);
      return;
    }

    navigate(`/explore?query=${encodeURIComponent(typedSearch)}`);
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl">
        <div className="text-center mb-20 border-b border-border pb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground" data-testid="text-explore-heading">Explore Directory</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-explore-subheading">
            Browse our comprehensive directory of creative professionals and venues.
          </p>
        </div>

                <div className="mx-auto mb-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleExploreSearch();
                }
              }}
              placeholder="Search artists, vendors, venues..."
              className="h-12 rounded-full border-border bg-white pl-11 text-base focus-visible:ring-foreground"
              data-testid="input-explore-search"
            />
          </div>
          <Button
            className="h-12 rounded-full px-8 font-semibold"
            onClick={handleExploreSearch}
            data-testid="button-explore-search"
          >
            Search
          </Button>
        </div>

        {requestedQuery && (
          <div className="mb-12 rounded-xl border border-border bg-white px-6 py-5 text-center shadow-sm" data-testid="explore-no-match-message">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              We don't have "{requestedQuery}" yet.
            </h2>
            <p className="text-muted-foreground">
              Try these popular categories instead.
            </p>
          </div>
        )}

        <Tabs defaultValue="artists" className="w-full flex flex-col items-center">
          <TabsList className="h-auto p-1.5 bg-muted rounded-full mb-16 inline-flex" data-testid="tabs-explore-directory">
            <TabsTrigger value="artists" className="text-sm font-medium py-2.5 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all">Artists</TabsTrigger>
            <TabsTrigger value="vendors" className="text-sm font-medium py-2.5 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all">Vendors</TabsTrigger>
            <TabsTrigger value="venues" className="text-sm font-medium py-2.5 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all">Venues</TabsTrigger>
          </TabsList>
          
          <TabsContent value="artists" className="w-full mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl border border-border" />)
              ) : (
                data?.artists.map((cat, i) => (
                  <motion.div key={cat.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/artists?category=${encodeURIComponent(cat.label)}`} data-testid={`link-cat-artist-${cat.slug}`}>
                      <div className="p-6 border border-border rounded-xl hover:border-foreground transition-colors cursor-pointer group h-full bg-white flex flex-col justify-between">
                        <span className="font-semibold text-lg text-foreground mb-4">{cat.label}</span>
                        <span className="text-sm font-medium text-muted-foreground">{cat.count} listings</span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="vendors" className="w-full mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl border border-border" />)
              ) : (
                data?.vendors.map((cat, i) => (
                  <motion.div key={cat.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/vendors?category=${encodeURIComponent(cat.label)}`} data-testid={`link-cat-vendor-${cat.slug}`}>
                      <div className="p-6 border border-border rounded-xl hover:border-foreground transition-colors cursor-pointer group h-full bg-white flex flex-col justify-between">
                        <span className="font-semibold text-lg text-foreground mb-4">{cat.label}</span>
                        <span className="text-sm font-medium text-muted-foreground">{cat.count} listings</span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="venues" className="w-full mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl border border-border" />)
              ) : (
                data?.venues.map((cat, i) => (
                  <motion.div key={cat.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/venues?category=${encodeURIComponent(cat.label)}`} data-testid={`link-cat-venue-${cat.slug}`}>
                      <div className="p-6 border border-border rounded-xl hover:border-foreground transition-colors cursor-pointer group h-full bg-white flex flex-col justify-between">
                        <span className="font-semibold text-lg text-foreground mb-4">{cat.label}</span>
                        <span className="text-sm font-medium text-muted-foreground">{cat.count} listings</span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
