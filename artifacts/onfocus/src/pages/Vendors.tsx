import { useState } from "react";
import { useListListings } from "@workspace/api-client-react";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Decor", "Catering", "Photography", "Makeup", "Production", "Lighting"];

export function Vendors() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  
  const { data, isLoading } = useListListings({ 
    type: "vendor",
    search: search || undefined,
    category: category || undefined
  });

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mb-16 border-b border-border pb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground" data-testid="text-vendors-heading">Vendors</h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed" data-testid="text-vendors-subheading">
            Connect with top-tier professionals to bring your vision to life.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-12 items-start md:items-center justify-between">
          <div className="flex overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide gap-2">
            <button 
              onClick={() => setCategory("")}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                category === "" 
                  ? "bg-foreground text-background border-foreground" 
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground"
              )}
              data-testid="button-filter-all"
            >
              All Vendors
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                  category === cat 
                    ? "bg-foreground text-background border-foreground" 
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground"
                )}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or city" 
              className="pl-11 rounded-full border-border bg-transparent focus-visible:ring-foreground h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-vendors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <ListingCardSkeleton key={i} />)
          ) : data?.listings.length ? (
            data.listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
              <p className="text-muted-foreground text-lg" data-testid="text-no-results">No vendors found matching your criteria.</p>
              <button 
                className="mt-4 text-foreground font-medium underline underline-offset-4" 
                onClick={() => { setSearch(""); setCategory(""); }}
                data-testid="button-clear-filters"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
