import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CURATED_EVENTS, type EventItem } from "@/lib/eventsData";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function EventsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Events");
  const [selectedCity, setSelectedCity] = useState<string>("All Cities");
  const [viewAll, setViewAll] = useState<boolean>(false);

  const [categoriesList, setCategoriesList] = useState<string[]>(["All Events"]);
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Fetch dynamic categories and live events
  useEffect(() => {
    fetch(`${API_BASE}/api/event-categories`)
      .then((r) => r.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : data?.categories;
        if (Array.isArray(cats) && cats.length > 0) {
          const names = cats.map((c: any) => c.name);
          setCategoriesList(["All Events", ...names]);
        } else {
          setCategoriesList(["All Events"]);
        }
      })
      .catch(() => {
        setCategoriesList(["All Events"]);
      });

    fetch(`${API_BASE}/api/events?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        const evs = Array.isArray(data) ? data : data?.events;
        if (Array.isArray(evs)) {
          setLiveEvents(evs);
        } else {
          setLiveEvents([]);
        }
      })
      .catch(() => {
        setLiveEvents([]);
      })
      .finally(() => {
        setHasLoaded(true);
      });
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return liveEvents.filter((event) => {
      const matchCategory =
        selectedCategory === "All Events" ||
        event.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchCity =
        selectedCity === "All Cities" ||
        event.city.toLowerCase() === selectedCity.toLowerCase();

      return matchCategory && matchCity;
    });
  }, [liveEvents, selectedCategory, selectedCity]);

  // Cities extracted
  const availableCities = useMemo(() => {
    const set = new Set(liveEvents.map((e) => e.city));
    return ["All Cities", ...Array.from(set)];
  }, [liveEvents]);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 20);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 20);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [filteredEvents]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // If no events are created by admin, do not show the events section on the home page
  if (liveEvents.length === 0) {
    return null;
  }

  return (
    <section id="events" className="w-full bg-background pt-14 pb-16 md:pt-16 md:pb-24 border-b border-border/50 relative">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section Header (BookMyShow pattern: Big bold title on left, 'See All ›' link on right) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Our Events
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1.5 max-w-xl">
              Step out, experience raw talent, and book live concerts, open mics, and cultural evenings.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-end">
            {/* City filter dropdown */}
            <div className="flex items-center gap-1.5 shrink-0 mr-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs md:text-sm font-medium bg-muted/60 text-foreground border border-border/60 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer"
              >
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setViewAll(!viewAll)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors group cursor-pointer"
            >
              <span>{viewAll ? "Show Carousel" : "See All"}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Desktop Carousel Navigation Arrows */}
            {!viewAll && (
              <div className="hidden md:flex items-center gap-1.5 ml-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 rounded-full border-border/70 hover:bg-muted"
                  disabled={!canScrollLeft}
                  onClick={() => handleScroll("left")}
                  aria-label="Previous events"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 rounded-full border-border/70 hover:bg-muted"
                  disabled={!canScrollRight}
                  onClick={() => handleScroll("right")}
                  aria-label="Next events"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-6">
          {categoriesList.map((cat) => {
            const active = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs md:text-sm font-medium px-4 py-2 rounded-full transition-all shrink-0 cursor-pointer ${
                  active
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Events Layout: Horizontal Carousel or Expanded Grid View */}
        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-border/70 bg-muted/20">
            <p className="text-base font-semibold text-foreground mb-1">No events found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Try selecting "All Events" or "All Cities" to view all upcoming experiences.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setSelectedCategory("All Events");
                setSelectedCity("All Cities");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : viewAll ? (
          /* Full Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          /* Carousel View (BookMyShow standard smooth horizontal strip) */
          <div className="relative -mx-6 px-6 md:mx-0 md:px-0">
            <div
              ref={scrollContainerRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="w-[240px] sm:w-[270px] md:w-[290px] shrink-0 snap-start flex flex-col"
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Event Card Component (Links to /event/:id) ──────────────────────────────────
function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      href={`/event/${event.id}`}
      className="group relative flex flex-col h-full cursor-pointer select-none"
    >
      {/* Poster Image Container (BookMyShow vertical poster ratio 3:4) */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-muted shadow-sm transition-all duration-300 group-hover:shadow-lg border border-border/60">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <Badge className="bg-black/60 backdrop-blur-md text-white border-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            {event.category}
          </Badge>
          {event.tag && (
            <Badge className="bg-white/95 text-foreground backdrop-blur-md border-0 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full shadow-xs">
              {event.tag}
            </Badge>
          )}
        </div>

        {/* BookMyShow signature: Translucent bottom bar on poster showing Date & Time */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8 pb-3 px-3.5 z-10">
          <div className="flex items-center gap-1.5 text-white/95 text-xs font-bold tracking-tight">
            <Calendar className="w-3.5 h-3.5 text-white/80 shrink-0" />
            <span>{event.displayDate}</span>
            <span className="text-white/40">·</span>
            <span className="font-medium text-white/80">
              {event.time.split(" ")[0]} {event.time.split(" ")[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Below Poster */}
      <div className="pt-3 pb-1 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug line-clamp-2 group-hover:text-muted-foreground transition-colors">
          {event.title}
        </h3>

        {/* Venue & Location */}
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 text-muted-foreground/80 shrink-0" />
          <span className="truncate">{event.venue}, {event.city}</span>
        </p>

        {/* Genre & Category tag */}
        <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate font-medium">
          {event.genre}
        </p>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block -mb-0.5">
              Entry
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {event.price}
            </span>
          </div>

          <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-foreground text-background group-hover:bg-foreground/90 transition-colors">
            Book
          </span>
        </div>
      </div>
    </Link>
  );
}
