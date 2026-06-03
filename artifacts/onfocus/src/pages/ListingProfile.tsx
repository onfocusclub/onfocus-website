import { useState, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useGetListing, getGetListingQueryKey } from "@workspace/api-client-react";
import {
  MapPin, Star, BadgeCheck, Users, Calendar, IndianRupee,
  ChevronLeft, Check, Link2, Share2, Globe, Tag, Mic,
  Music, Heart, Award, Sparkles, Coffee,
} from "lucide-react";
import { SiWhatsapp, SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// ── Helpers ───────────────────────────────────────────────────────────────────

const KNOWN_LANGUAGES = new Set([
  "Hindi","Hinglish","English","Tamil","Telugu","Punjabi",
  "Bengali","Marathi","Gujarati","Kannada","Malayalam","Urdu","Odia",
]);

const KNOWN_CATEGORIES = new Set([
  "Vocalist","Guitarist","Singer","Live Performer","Acoustic Artist",
  "Cover Song Artist","Dancer","Anchor","DJ","Musician","Band",
  "Performer","Solo Artist","Solo","Rapper","Keyboardist","Drummer",
]);

function parseTags(tags: string[]) {
  const languages: string[] = [];
  const categories: string[] = [];
  const other: string[] = [];
  for (const t of tags) {
    if (KNOWN_LANGUAGES.has(t)) languages.push(t);
    else if (KNOWN_CATEGORIES.has(t)) categories.push(t);
    else other.push(t);
  }
  return { languages, categories, other };
}

// ── Why Pick cards: tag → feature card content ────────────────────────────────
type FeatureCard = { title: string; desc: string; Icon: React.ElementType };

const TAG_TO_FEATURE: Record<string, FeatureCard> = {
  "Vocalist": {
    Icon: Mic,
    title: "Soulful Live Performances",
    desc: "Creates an emotional connection with the audience through heartfelt vocals and acoustic music.",
  },
  "Live Performer": {
    Icon: Award,
    title: "Experienced Stage Artist",
    desc: "Has performed at university events, live crowds, and Jhansi Open Mic, making him confident and engaging on stage.",
  },
  "Acoustic Artist": {
    Icon: Heart,
    title: "Perfect for Soft & Romantic Events",
    desc: "An ideal choice for cafés, open mics, cultural events, and gatherings that call for soothing, memorable music.",
  },
  "Cover Song Artist": {
    Icon: Users,
    title: "Strong Audience Connection",
    desc: "Known for engaging the audience and creating memorable, emotionally resonant musical experiences.",
  },
  "Singer": {
    Icon: Sparkles,
    title: "Great for Cafés, Open Mics & College Events",
    desc: "Versatile performer suitable for a wide range of intimate and large-scale events.",
  },
  "Guitarist": {
    Icon: Music,
    title: "Skilled Instrumentalist",
    desc: "Expert guitar playing that adds warmth, depth, and authenticity to every live set.",
  },
  "Dancer": {
    Icon: Sparkles,
    title: "Dynamic Stage Presence",
    desc: "Captivating choreography and movement that transforms any event into a visual experience.",
  },
  "DJ": {
    Icon: Music,
    title: "Energy-Driven Sets",
    desc: "Curated mixes that keep audiences engaged and the dance floor alive all night.",
  },
};

function getWhyPickCards(categories: string[]): FeatureCard[] {
  const cards: FeatureCard[] = [];
  for (const cat of categories) {
    if (TAG_TO_FEATURE[cat]) cards.push(TAG_TO_FEATURE[cat]);
    if (cards.length === 5) break;
  }
  return cards;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ListingProfile() {
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: listing, isLoading } = useGetListing(id, {
    query: { enabled: !!id, queryKey: getGetListingQueryKey(id) },
  });

  const profileUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({ description: "Profile link copied", duration: 2500 });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ description: "Could not copy link", duration: 2500 });
    }
  }, [profileUrl, toast]);

  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`Check out this artist on OnFocus — ${profileUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }, [profileUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.name ?? "OnFocus Artist",
          text: `Check out ${listing?.name ?? "this artist"} on OnFocus`,
          url: profileUrl,
        });
      } catch { /* dismissed */ }
    } else {
      handleCopyLink();
    }
  }, [listing, profileUrl, handleCopyLink]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="w-full h-[55vh] rounded-none" />
        <div className="container mx-auto px-6 md:px-8 -mt-24 relative z-10">
          <Skeleton className="w-full h-52 rounded-2xl mb-16" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="w-full h-64 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="w-full h-80 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-3xl font-bold mb-6 text-foreground" data-testid="text-not-found">
          Profile not found
        </h1>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const { languages, categories } = parseTags(listing.tags ?? []);
  const whyPickCards = getWhyPickCards(categories);
  const avatarSrc = listing.images?.[0] || listing.coverImage;

  const galleryImages = Array.from(
  new Set([listing.coverImage, ...(listing.images ?? [])].filter(Boolean))
);

const profileCopyByType = {
  artist: {
    label: "Artist",
    gallery: "Photos and videos from performances, events, and live setups.",
    portfolio: "Curated performance highlights and event-ready work.",
    detailTitle: "Performance Details",
  },
  vendor: {
    label: "Vendor",
    gallery: "Photos and videos from past services, setups, and finished work.",
    portfolio: "Selected event work, service showcases, and client-ready examples.",
    detailTitle: "Service Details",
  },
  venue: {
    label: "Venue",
    gallery: "Photos and videos of spaces, ambience, seating, and event setups.",
    portfolio: "Selected event setups and venue transformations.",
    detailTitle: "Venue Details",
  },
} as const;

const profileCopy =
  profileCopyByType[listing.type as keyof typeof profileCopyByType] ??
  profileCopyByType.artist;

const shortBio = listing.bio.split(".")[0]?.trim();

const portfolioItems = galleryImages.slice(0, 4).map((image, index) => ({
  image,
  title:
    index === 0
      ? `${listing.category} Showcase`
      : `${listing.category} Highlight ${index + 1}`,
  meta: `${listing.city} · ${profileCopy.label}`,
  desc:
    index === 0 && shortBio
      ? `${shortBio}.`
      : `A closer look at ${listing.name}'s ${listing.category.toLowerCase()} work for event planners.`,
}));

const primaryDetails = [
  `Category: ${listing.category}`,
  `City: ${listing.city}`,
  listing.priceRange ? `Starting price: ${listing.priceRange}` : "",
  listing.yearsActive ? `Experience: ${listing.yearsActive} years active` : "",
  listing.eventsCompleted ? `Events completed: ${listing.eventsCompleted}+` : "",
  listing.capacity ? `Capacity: Up to ${listing.capacity} guests` : "",
].filter(Boolean) as string[];

const detailsGroups = [
  { title: profileCopy.detailTitle, items: primaryDetails },
  { title: "Categories", items: categories },
  { title: "Languages", items: languages },
  {
    title:
      listing.type === "venue"
        ? "Amenities"
        : listing.type === "vendor"
          ? "Services & Inclusions"
          : "Suitable For",
    items: listing.amenities ?? [],
  },
  { title: "Tags", items: listing.tags ?? [] },
].filter((group) => group.items.length > 0);


  return (
    <div className="min-h-screen bg-background pb-32">
      <Toaster />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="w-full h-[55vh] min-h-[380px] relative bg-muted overflow-hidden">
        <img
          src={listing.coverImage}
          alt={listing.name}
          className="w-full h-full object-cover object-[center_20%]"
          data-testid="img-profile-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="absolute top-24 left-6 md:left-8 z-10 text-white hover:bg-white/20 hover:text-white rounded-full px-4"
          data-testid="button-back"
        >
          <Link href={`/${listing.type}s`}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Link>
        </Button>

        {/* Join as Partner – top right overlay, matches reference */}
        <div className="absolute top-5 right-6 md:right-8 z-10">
          <Button
            asChild
            className="rounded-full px-6 h-10 text-sm font-semibold bg-white/10 border border-white/40 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Link href="/join">Join as Partner</Link>
          </Button>
        </div>
      </div>

      {/* ── Info Card ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 md:px-8 -mt-20 relative z-10 mb-14">
        <div className="bg-white rounded-2xl shadow-sm border border-border/60 px-8 md:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-7">

          {/* Circular avatar */}
          {avatarSrc && (
            <div className="shrink-0">
              <div className="w-[110px] h-[110px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden border-[3px] border-white shadow-md ring-1 ring-border">
                <img
                  src={avatarSrc}
                  alt={`${listing.name} profile`}
                  className="w-full h-full object-cover object-[center_15%]"
                  data-testid="img-profile-avatar"
                />
              </div>
            </div>
          )}

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-xs font-bold tracking-[0.12em] uppercase text-muted-foreground"
                data-testid="text-profile-category"
              >
                {listing.category}
              </span>
              {listing.verified && (
                <span
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground bg-foreground/8 border border-border px-2.5 py-1 rounded-full"
                  data-testid="badge-verified"
                >
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            {/* Name */}
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-none"
              data-testid="text-profile-name"
            >
              {listing.name}
            </h1>

            {/* Location + rating */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0" />
                <span data-testid="text-profile-city">{listing.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-foreground text-foreground" />
                <span className="font-semibold text-foreground" data-testid="text-profile-rating">
                  {listing.rating.toFixed(1)}
                </span>
                <span>({listing.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              size="lg"
              className="flex-1 sm:flex-none px-8 h-12 rounded-full text-sm font-semibold"
              asChild
              data-testid="button-get-in-touch"
            >
              <Link href="/contact">Get in Touch</Link>
            </Button>
            <button
              title="Save profile"
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0"
              data-testid="button-save-profile"
            >
              <Heart className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">

          {/* ── Main content ────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
  <TabsList
    className="w-full justify-start border-b border-border rounded-none p-0 bg-transparent h-auto mb-12 gap-8 overflow-x-auto"
    data-testid="tabs-profile"
  >
    {["about", "gallery", "portfolio", "details"].map((tab) => (
      <TabsTrigger
        key={tab}
        value={tab}
        className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 py-4 text-base font-medium data-[state=active]:text-foreground text-muted-foreground transition-all capitalize whitespace-nowrap"
        data-testid={`tab-${tab}`}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </TabsTrigger>
    ))}
  </TabsList>

  <TabsContent value="about" className="space-y-14 outline-none">
    <div>
      <h2 className="text-xl font-bold mb-5 text-foreground">About</h2>
      <div className="space-y-4">
        {listing.bio.split("\n\n").filter(Boolean).map((para, i) => (
          <p key={i} className="text-base leading-[1.85] text-muted-foreground">
            {para}
          </p>
        ))}
      </div>
    </div>

    {whyPickCards.length > 0 && (
      <div>
        <h2 className="text-xl font-bold mb-7 text-foreground">
          Why Pick {listing.name}?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyPickCards.map(({ Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-xl border border-border/60 bg-muted/30">
              <Icon className="w-5 h-5 text-foreground/70 mb-4" />
              <p className="font-semibold text-sm text-foreground mb-1.5">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </TabsContent>

  <TabsContent value="gallery" className="outline-none">
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-3 text-foreground">Gallery</h2>
      <p className="text-sm text-muted-foreground">{profileCopy.gallery}</p>
    </div>
    <div className="columns-1 sm:columns-2 gap-5 space-y-5">
      {galleryImages.map((img, i) => (
        <div key={img} className="break-inside-avoid rounded-xl overflow-hidden bg-muted border border-border/50">
          <img src={img} alt={`${listing.name} gallery ${i + 1}`} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
        </div>
      ))}
    </div>
  </TabsContent>

  <TabsContent value="portfolio" className="outline-none">
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-3 text-foreground">Portfolio</h2>
      <p className="text-sm text-muted-foreground">{profileCopy.portfolio}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {portfolioItems.map((item) => (
        <div key={item.title} className="rounded-2xl overflow-hidden border border-border/60 bg-white">
          <img src={item.image} alt={item.title} className="aspect-[4/3] w-full object-cover" />
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{item.meta}</p>
            <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </TabsContent>

  <TabsContent value="details" className="outline-none">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {detailsGroups.map((group) => (
        <div key={group.title} className="rounded-2xl border border-border/60 bg-white p-6">
          <h2 className="text-lg font-bold mb-5 text-foreground">{group.title}</h2>
          <ul className="space-y-3">
            {group.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </TabsContent>
</Tabs>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Key Details */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-7">
              <h3 className="font-bold text-base mb-6 text-foreground">Key Details</h3>
              <div className="space-y-5">
                {listing.priceRange && (
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <IndianRupee className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Starting Price</p>
                      <p className="font-semibold text-sm text-foreground" data-testid="text-detail-price">
                        {listing.priceRange}
                      </p>
                    </div>
                  </div>
                )}
                {listing.yearsActive && (
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Experience</p>
                      <p className="font-semibold text-sm text-foreground" data-testid="text-detail-experience">
                        {listing.yearsActive} Years Active
                      </p>
                    </div>
                  </div>
                )}
                {listing.eventsCompleted && (
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <BadgeCheck className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Events</p>
                      <p className="font-semibold text-sm text-foreground" data-testid="text-detail-events">
                        {listing.eventsCompleted}+ completed
                      </p>
                    </div>
                  </div>
                )}
                {listing.capacity && (
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Capacity</p>
                      <p className="font-semibold text-sm text-foreground" data-testid="text-detail-capacity">
                        Up to {listing.capacity} guests
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-bold text-base text-foreground">Languages</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3.5 py-1.5 bg-muted/60 border border-border rounded-full text-xs font-medium text-foreground"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-bold text-base text-foreground">Categories</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3.5 py-1.5 bg-muted/60 border border-border rounded-full text-xs font-medium text-foreground"
                      data-testid={`tag-${cat.toLowerCase()}`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suitable For */}
            {listing.amenities && listing.amenities.length > 0 && listing.type === "artist" && (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <Coffee className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-bold text-base text-foreground">Suitable For</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((item) => (
                    <span
                      key={item}
                      className="px-3.5 py-1.5 bg-muted/60 border border-border rounded-full text-xs font-medium text-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Profile */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-7">
              <h3 className="font-bold text-base mb-5 text-foreground">Share Profile</h3>
              <div className="flex items-center gap-2.5">
                {/* WhatsApp */}
                <button
                  onClick={handleWhatsApp}
                  title="Share on WhatsApp"
                  className="w-11 h-11 rounded-full border border-border bg-muted/40 hover:bg-[#25D366]/10 hover:border-[#25D366]/40 flex items-center justify-center transition-all duration-200"
                  data-testid="button-share-whatsapp"
                >
                  <SiWhatsapp className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Instagram (native share fallback) */}
                <button
                  onClick={handleNativeShare}
                  title="Share"
                  className="w-11 h-11 rounded-full border border-border bg-muted/40 hover:bg-muted hover:border-foreground/20 flex items-center justify-center transition-all duration-200"
                  data-testid="button-share-native"
                >
                  <SiInstagram className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Copy link */}
                <button
                  onClick={handleCopyLink}
                  title="Copy profile link"
                  className="w-11 h-11 rounded-full border border-border bg-muted/40 hover:bg-muted hover:border-foreground/20 flex items-center justify-center transition-all duration-200"
                  data-testid="button-share-copy"
                >
                  {copied
                    ? <Check className="w-4 h-4 text-foreground" />
                    : <Link2 className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Share this profile via WhatsApp, your device share menu, or by copying the link.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
