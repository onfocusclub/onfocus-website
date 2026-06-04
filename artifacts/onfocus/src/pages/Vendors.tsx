import { useState, useEffect, useMemo } from "react";
import { useListListings } from "@workspace/api-client-react";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const CATEGORIES = ["Photographer", "Makeup Artist", "Catering", "Lighting & Decor", "Production"];
const CITY_SUGGESTIONS = [
  "Mumbai",
  "Delhi",
  "Pune",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Lucknow",
  "Varanasi",
  "Gurugram",
  "Gurgaon",
  "Ghaziabad",
  "Goa",
  "Guwahati",
  "Gwalior",
  "Greater Noida",
  "Noida",
  "Ahmedabad",
  "Indore",
  "Bhopal",
  "Surat",
  "Udaipur",
  "Chandigarh",
  "Dehradun",
];

const PRICE_RANGES = [
  { label: "Any Price", value: "" },
  { label: "Under ₹10,000", value: "under-10k" },
  { label: "₹10,000 - ₹30,000", value: "10k-30k" },
  { label: "₹30,000 - ₹80,000", value: "30k-80k" },
  { label: "₹80,000+", value: "above-80k" },
];

function extractFirstPrice(priceRange: string | null | undefined): number | null {
  if (!priceRange) return null;

  const match = priceRange.match(/[\d,]+/);
  if (!match) return null;

  return parseInt(match[0].replace(/,/g, ""), 10);
}

function matchesPriceRange(priceRange: string | null | undefined, bucket: string): boolean {
  if (!bucket) return true;

  const price = extractFirstPrice(priceRange);
  if (price === null) return true;

  if (bucket === "under-10k") return price < 10000;
  if (bucket === "10k-30k") return price >= 10000 && price <= 30000;
  if (bucket === "30k-80k") return price > 30000 && price <= 80000;
  if (bucket === "above-80k") return price > 80000;

  return true;
}

function matchesCustomBudget(priceRange: string | null | undefined, budget: string): boolean {
  const normalizedBudget = budget.replace(/[^\d]/g, "");
  if (!normalizedBudget) return true;

  const maxBudget = parseInt(normalizedBudget, 10);
  if (Number.isNaN(maxBudget)) return true;

  const listingPrice = extractFirstPrice(priceRange);
  if (listingPrice === null) return true;

  return listingPrice <= maxBudget;
}


export function Vendors() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [cityFilter, setCityFilter] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [priceRange, setPriceRange] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [location] = useLocation();
  
  const { data, isLoading } = useListListings({
  type: "vendor",
  search: search || undefined,
  category: category || undefined,
  limit: 100,
});

const filtered = useMemo(() => {
  if (!data?.listings) return [];

  return data.listings.filter((listing) => {
    if (cityFilter.trim()) {
      if (!listing.city.toLowerCase().includes(cityFilter.trim().toLowerCase())) {
        return false;
      }
    }

    if (priceRange) {
      if (!matchesPriceRange(listing.priceRange, priceRange)) return false;
    }

    if (customBudget.trim()) {
      if (!matchesCustomBudget(listing.priceRange, customBudget)) return false;
    }

    return true;
  });
}, [data, cityFilter, priceRange, customBudget]);

const hasActiveFilters = search || category || cityFilter || priceRange || customBudget;

function clearAll() {
  setSearch("");
  setCategory("");
  setCityFilter("");
  setPriceRange("");
  setCustomBudget("");
}

  useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const city = searchParams.get("city");
  const urlCategory = searchParams.get("category");

  if (city) {
    setCityFilter(city);
  }

  if (urlCategory) {
    setCategory(urlCategory);
  }
}, [location]);

const cityMatches = cityFilter.trim()
  ? CITY_SUGGESTIONS.filter((city) =>
      city.toLowerCase().includes(cityFilter.trim().toLowerCase())
    )
  : [];

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mb-16 border-b border-border pb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground" data-testid="text-vendors-heading">Vendors</h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed" data-testid="text-vendors-subheading">
            Connect with top-tier professionals to bring your vision to life.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-8 items-start md:items-center justify-between">
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

                  <div className="flex flex-col sm:flex-row gap-3 mb-10 p-4 rounded-2xl bg-muted/40 border border-border/60">
          <div className="relative flex-1 min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
              City
            </label>
            <div className="relative">
              <Input
                placeholder="e.g. Mumbai, Pune"
                className="rounded-xl border-border bg-white h-10 text-sm focus-visible:ring-foreground"
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                data-testid="input-filter-city"
              />

              {showCitySuggestions && cityFilter && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-60 overflow-auto">
                  {cityMatches.map((city) => (
                    <div
                      key={city}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setCityFilter(city);
                        setShowCitySuggestions(false);
                      }}
                    >
                      {city}
                    </div>
                  ))}

                  {cityMatches.length === 0 && (
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setCityFilter(cityFilter.trim());
                        setShowCitySuggestions(false);
                      }}
                    >
                      Use "{cityFilter.trim()}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="relative flex-1 min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
              Price Range
            </label>
            <div className="relative">
              <select
                className="w-full h-10 pl-3 pr-8 rounded-xl border border-border bg-white text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                data-testid="select-filter-price"
              >
                {PRICE_RANGES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Input
              inputMode="numeric"
              placeholder="Custom max budget"
              className="mt-2 rounded-xl border-border bg-white h-10 text-sm focus-visible:ring-foreground"
              value={customBudget}
              onChange={(e) => setCustomBudget(e.target.value)}
              data-testid="input-filter-custom-budget"
            />
          </div>

          {hasActiveFilters && (
            <div className="flex items-end shrink-0">
              <button
                onClick={clearAll}
                className="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl bg-white transition-colors whitespace-nowrap"
                data-testid="button-clear-filters"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <ListingCardSkeleton key={i} />)
          ) : filtered.length ? (
  filtered.map((listing, i) => (
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
              <p className="text-foreground text-xl font-semibold" data-testid="text-no-results">
  No exact matches found.
</p>
<p className="mt-2 text-muted-foreground">
  Try clearing filters or browsing popular vendor categories.
</p>
              <button 
                className="mt-4 text-foreground font-medium underline underline-offset-4" 
               onClick={clearAll}
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
