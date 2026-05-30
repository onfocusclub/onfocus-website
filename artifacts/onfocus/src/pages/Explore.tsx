import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function Explore() {
  const { data, isLoading } = useListCategories();

  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl">
        <div className="text-center mb-20 border-b border-border pb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground" data-testid="text-explore-heading">Explore Directory</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-explore-subheading">
            Browse our comprehensive directory of creative professionals and venues.
          </p>
        </div>

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
