import { useState, useMemo } from "react";
import { useListListings } from "@workspace/api-client-react";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Singers", "DJs", "Bands", "Anchors", "Dancers", "Performers"];

const LANGUAGES = ["All Languages", "Hindi", "Hinglish", "English", "Tamil", "Telugu", "Punjabi"];

const PRICE_RANGES = [
  { label: "Any Price", value: "" },
  { label: "Under ₹10,000", value: "under-10k" },
  { label: "₹10,000 – ₹30,000", value: "10k-30k" },
  { label: "₹30,000 – ₹80,000", value: "30k-80k" },
  { label: "₹80,000+", value: "above-80k" },
];

function matchesPriceRange(priceRange: string | null | undefined, bucket: string): boolean {
  if (!bucket || !priceRange) return true;
  const lower = priceRange.toLowerCase();
  const extractFirst = (s: string) => {
    const match = s.match(/[\d,]+/);
    if (!match) return null;
    return parseInt(match[0].replace(/,/g, ""), 10);
  };
  const price = extractFirst(lower);
  if (price === null) return true;
  if (bucket === "under-10k") return price < 10000;
  if (bucket === "10k-30k") return price >= 10000 && price <= 30000;
  if (bucket === "30k-80k") return price > 30000 && price <= 80000;
  if (bucket === "above-80k") return price > 80000;
  return true;
}

export function Artists() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [cityFilter, setCityFilter] = useState("");
  const [language, setLanguage] = useState("All Languages");
  const [priceRange, setPriceRange] = useState("");

  const { data, isLoading } = useListListings({
    type: "artist",
    search: search || undefined,
    category: category || undefined,
    limit: 100,
  });

  const filtered = useMemo(() => {
    if (!data?.listings) return [];
    return data.listings.filter((l) => {
      if (cityFilter.trim()) {
        if (!l.city.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      }
      if (language && language !== "All Languages") {
        const hasLang = l.tags?.some((t) => t.toLowerCase() === language.toLowerCase());
        if (!hasLang) return false;
      }
      if (priceRange) {
        if (!matchesPriceRange(l.priceRange, priceRange)) return false;
      }
      return true;
    });
  }, [data, cityFilter, language, priceRange]);

  const hasActiveFilters = cityFilter || (language && language !== "All Languages") || priceRange;

  function clearAll() {
    setSearch("");
    setCategory("");
    setCityFilter("");
    setLanguage("All Languages");
    setPriceRange("");
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-8">

        <div className="mb-16 border-b border-border pb-12">
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground"
            data-testid="text-artists-heading"
          >
            Artists
          </h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl leading-relaxed"
            data-testid="text-artists-subheading"
          >
            Discover extraordinary performers to elevate your next event.
          </p>
        </div>

        {/* Category chip row */}
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
              All Artists
            </button>
            {CATEGORIES.map((cat) => (
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
              placeholder="Search by name"
              className="pl-11 rounded-full border-border bg-transparent focus-visible:ring-foreground h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-artists"
            />
          </div>
        </div>

        {/* Filter bar — City, Language, Price Range */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 p-4 rounded-2xl bg-muted/40 border border-border/60">
          {/* City */}
          <div className="relative flex-1 min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
              City
            </label>
            <Input
              placeholder="e.g. Jhansi, Mumbai"
              className="rounded-xl border-border bg-white h-10 text-sm focus-visible:ring-foreground"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              data-testid="input-filter-city"
            />
          </div>

          {/* Language */}
          <div className="relative flex-1 min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
              Language
            </label>
            <div className="relative">
              <select
                className="w-full h-10 pl-3 pr-8 rounded-xl border border-border bg-white text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                data-testid="select-filter-language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Price Range */}
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
          </div>

          {/* Clear filters */}
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

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-6" data-testid="text-results-count">
            {filtered.length} {filtered.length === 1 ? "artist" : "artists"} found
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => <ListingCardSkeleton key={i} />)
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
              <p className="text-muted-foreground text-lg" data-testid="text-no-results">
                No artists found matching your criteria.
              </p>
              <button
                className="mt-4 text-foreground font-medium underline underline-offset-4"
                onClick={clearAll}
                data-testid="button-clear-all"
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
