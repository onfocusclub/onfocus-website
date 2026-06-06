import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, ArrowUpRight, Users, Mic, Music, Laugh, X, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Photo paths (all go inside public/about/) ───────────────────────────────
const CONCERT = {
  guitarist:   "/about/concert-guitarist.jpg",
  crowd:       "/about/concert-crowd.jpg",
  performer:   "/about/concert-performer.jpg",
  stageGroup:  "/about/concert-stage-group.jpg",
  bwStage:     "/about/concert-bw-stage.jpg",
  finale:      "/about/concert-finale.jpg",
};

const OPENMIC = {
  group:         "/about/openmic-group.jpg",
  audienceLaugh: "/about/openmic-audience-laugh.jpg",
  audienceClap:  "/about/openmic-audience-clap.jpg",
  standup:       "/about/openmic-standup.jpg",
  poet:          "/about/openmic-poet.jpg",
  singer:        "/about/openmic-singer.jpg",
};

const COMMUNITY = {
  session: "/about/community-session.jpg",
  group1:  "/about/community-group1.jpg",
  group2:  "/about/community-group2.jpg",
  group3:  "/about/community-group3.jpg",
};

const ALL_GALLERY_PHOTOS = [
  { src: CONCERT.guitarist,      caption: "Raag Festival" },
  { src: CONCERT.crowd,          caption: "Raag Festival" },
  { src: CONCERT.performer,      caption: "Raag Festival" },
  { src: CONCERT.stageGroup,     caption: "Raag Festival" },
  { src: CONCERT.bwStage,        caption: "Raag Festival" },
  { src: CONCERT.finale,         caption: "Raag Festival" },
  { src: OPENMIC.group,          caption: "Open Mic" },
  { src: OPENMIC.audienceLaugh,  caption: "Open Mic" },
  { src: OPENMIC.audienceClap,   caption: "Open Mic" },
  { src: OPENMIC.standup,        caption: "Open Mic" },
  { src: OPENMIC.poet,           caption: "Open Mic" },
  { src: OPENMIC.singer,         caption: "Open Mic" },
  { src: COMMUNITY.session,      caption: "Community Meet" },
  { src: COMMUNITY.group1,       caption: "Community Meet" },
  { src: COMMUNITY.group2,       caption: "Community Meet" },
  { src: COMMUNITY.group3,       caption: "Community Meet" },
];

// ─── Data ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "4+",    label: "Open Mic Shows" },
  { value: "4+",    label: "Community Meets" },
  { value: "2+",    label: "Major Concert Projects" },
  { value: "2+",    label: "Standup Shows" },
  { value: "3000+", label: "Artists & Attendees Impacted" },
  { value: "1800+", label: "Largest Event Attendance" },
];

const FEATURES = [
  {
    icon: Search,
    title: "Discover",
    desc: "Find artists, vendors, and venues in your city — all verified, all in one place.",
  },
  {
    icon: Users,
    title: "Compare",
    desc: "Browse profiles, portfolios, pricing, and experience side by side.",
  },
  {
    icon: ArrowUpRight,
    title: "Connect",
    desc: "Send inquiries and communicate directly with the professionals you need.",
  },
  {
    icon: Mic,
    title: "Grow",
    desc: "Professionals receive leads, showcase their work, and build their reputation.",
  },
];

const EVENTS = [
  {
    title: "Open Mic Shows",
    icon: Mic,
    photos: [OPENMIC.standup, OPENMIC.singer, OPENMIC.poet],
    cover: OPENMIC.group,
    desc: "Intimate stages where emerging voices find their first audience.",
  },
  {
    title: "Artist Community Meets",
    icon: Users,
    photos: [COMMUNITY.group1, COMMUNITY.group2, COMMUNITY.session],
    cover: COMMUNITY.group3,
    desc: "Relaxed gatherings that spark collaborations and lasting friendships.",
  },
  {
    title: "Concerts & Music Festivals",
    icon: Music,
    photos: [CONCERT.guitarist, CONCERT.performer, CONCERT.bwStage],
    cover: CONCERT.stageGroup,
    desc: "Full-scale productions with 1800+ attendees and professional artists.",
  },
  {
    title: "Standup Shows",
    icon: Laugh,
    photos: [OPENMIC.audienceLaugh, OPENMIC.audienceClap, OPENMIC.standup],
    cover: OPENMIC.audienceLaugh,
    desc: "Comedy nights that had the house roaring from the first punchline.",
  },
];

const TEAM = [
  {
    name: "Akanksha Singh",
    role: "Co-Founder & CEO",
    focus: "Leadership · Business Development · Growth",
    initials: "AS",
  },
  {
    name: "Raj Kumar",
    role: "Founder & CMO",
    focus: "Vision · Community Building · Artist Relations",
    initials: "RK",
  },
  {
    name: "Manish Kushwaha",
    role: "Co-Founder & CFO",
    focus: "Finance · Operations · Strategic Partnerships",
    initials: "MK",
  },
];

const FAQS = [
  {
    q: "What is On Focus Club?",
    a: "On Focus Club is India's first dedicated platform that connects event organizers with talented artists, trusted vendors, and suitable venues — all in one place. Whether you're planning a concert, wedding, corporate event, open mic, cultural program, or private celebration, we help you discover and connect with the right people.",
  },
  {
    q: "Is listing my profile free?",
    a: "Yes, On Focus Club offers a free listing option to help professionals get started. Premium plans with additional visibility, features, and promotional benefits are also available.",
  },
  {
    q: "How do I receive booking inquiries?",
    a: "Simply create your profile, upload your portfolio, showcase your experience, and submit it for review. Once your profile is live, event organizers can discover and send inquiries directly through the platform.",
  },
  {
    q: "Can vendors and venues also join?",
    a: "Absolutely. On Focus Club is designed for artists, vendors, venues, event hosts, photographers, decorators, sound providers, and many other event-related professionals.",
  },
  {
    q: "Which cities do you currently serve?",
    a: "We are currently building a strong community in Jhansi and nearby regions while gradually expanding our network across India.",
  },
  {
    q: "How does profile verification work?",
    a: "After creating your profile, our team reviews your portfolio, information, and supporting details to ensure authenticity and quality before awarding a verified badge.",
  },
  {
    q: "What types of artists and vendors can join?",
    a: "Singers, musicians, bands, comedians, poets, anchors, dancers, DJs, photographers, videographers, decorators, caterers, sound providers, lighting teams, event planners — and many more.",
  },
  {
    q: "Does On Focus Club organize events as well?",
    a: "Yes. Along with building the platform, On Focus Club has successfully organized open mics, artist community meets, comedy shows, concerts, and cultural events across the region.",
  },
  {
    q: "Why should I choose On Focus Club?",
    a: "Because it's built by event organizers who understand the industry. We don't just list profiles — we actively create opportunities, build communities, and simplify event planning for everyone involved.",
  },
];

function PhotoGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function openLightbox(i: number) { setLightboxIndex(i); }
  function closeLightbox() { setLightboxIndex(null); }
  function prev() { setLightboxIndex(i => i !== null ? (i - 1 + ALL_GALLERY_PHOTOS.length) % ALL_GALLERY_PHOTOS.length : 0); }
  function next() { setLightboxIndex(i => i !== null ? (i + 1) % ALL_GALLERY_PHOTOS.length : 0); }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ALL_GALLERY_PHOTOS.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
            onClick={() => openLightbox(i)}
          >
            <img
              src={photo.src}
              alt={photo.caption}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-3">
              <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-1">
                {photo.caption}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10 bg-white/10 rounded-full p-2"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 bg-white/10 rounded-full p-3"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={ALL_GALLERY_PHOTOS[lightboxIndex].src}
                alt={ALL_GALLERY_PHOTOS[lightboxIndex].caption}
                className="max-h-[75vh] max-w-full object-contain rounded-xl"
              />
              <p className="text-white/60 text-sm">{ALL_GALLERY_PHOTOS[lightboxIndex].caption}</p>
              <p className="text-white/30 text-xs">{lightboxIndex + 1} / {ALL_GALLERY_PHOTOS.length}</p>
            </motion.div>

            {/* Next */}
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 bg-white/10 rounded-full p-3"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-border last:border-0 cursor-pointer group"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between py-5 gap-4">
        <span className="text-base font-medium text-foreground leading-snug">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground leading-relaxed text-sm">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({ event, index }: { event: typeof EVENTS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = event.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative rounded-2xl overflow-hidden border border-border bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={event.cover}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2">
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* 3-photo strip */}
      <div className="flex gap-1 px-4 -mt-8 relative z-10">
        {event.photos.map((src, i) => (
          <div key={i} className="flex-1 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Text */}
      <div className="p-5 pt-4">
        <h3 className="text-lg font-bold text-foreground mb-2">{event.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{event.desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background image collage — blurred, dark */}
        <div className="absolute inset-0 grid grid-cols-3 opacity-20">
          {[CONCERT.guitarist, CONCERT.crowd, CONCERT.performer].map((src, i) => (
            <div key={i} className="overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover blur-sm scale-105" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

        <div className="container mx-auto px-6 md:px-8 relative z-10 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground mb-6">
              India's First Go-To Hub for Talent, Vendors & Venues
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-8 text-foreground">
              We put the right people
              <br />
              <span className="relative inline-block">
                in the spotlight.
                <motion.span
                  className="absolute -bottom-1 left-0 h-[3px] bg-foreground rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Discover, connect, and book verified artists, event vendors, and venues — all in one place.
              Whether you're planning an open mic, wedding, concert, or cultural festival, we help you find the right people to make it happen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full px-8 h-12 font-semibold" asChild>
                <Link href="/explore">Explore Talent</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 font-semibold" asChild>
                <Link href="/join">List Your Profile</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-foreground text-background py-14">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex flex-col items-center"
              >
                <span className="text-3xl md:text-4xl font-bold mb-1">{s.value}</span>
                <span className="text-xs text-background/60 font-medium leading-tight">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY WE BUILT THIS ── */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Stacked image collage */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[480px] hidden lg:block"
            >
              <img
                src={CONCERT.finale}
                alt="OnFocus community"
                className="absolute top-0 left-0 w-[72%] h-[65%] object-cover rounded-2xl shadow-lg"
              />
              <img
                src={COMMUNITY.session}
                alt="Community meet"
                className="absolute bottom-0 right-0 w-[60%] h-[55%] object-cover rounded-2xl shadow-lg border-4 border-white"
              />
              <div className="absolute bottom-10 left-4 bg-foreground text-background rounded-xl px-4 py-3 text-sm font-semibold shadow-lg">
                Built by event organizers,<br />for the event industry.
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4 block">
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-foreground leading-tight">
                Why we built<br />On Focus Club
              </h2>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  On Focus Club started with a simple mission — to create opportunities for artists and simplify event planning.
                </p>
                <p>
                  Over the years, we noticed that talented performers struggled to find stages, event organizers struggled to find reliable artists and vendors, and venues remained disconnected from the event ecosystem.
                </p>
                <p>
                  Instead of building just another directory, we decided to build a platform that connects every part of the event industry in one place.
                </p>
                <p>
                  Today, On Focus Club is evolving into India's first dedicated hub where event organizers can discover talent, vendors, and venues — while professionals can showcase their work, receive inquiries, and grow their business.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES / WHY ONFOCUS ── */}
      <section className="py-24 bg-muted border-y border-border/50">
        <div className="container mx-auto px-6 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4 block">
              Why On Focus Club
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Everything you need,<br />in one platform.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-7 border border-border flex flex-col gap-4"
                >
                  <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-background" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PREVIOUS WORKS (event gallery) ── */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4 block">
              Journey So Far
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Events we've brought to life
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From intimate community gatherings to large-scale concerts, On Focus Club has empowered artists and entertained thousands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EVENTS.map((event, i) => (
              <EventCard key={event.title} event={event} index={i} />
            ))}
          </div>

          {/* Full Photo Gallery with Lightbox */}
<div className="mt-16">
  <div className="text-center mb-8">
    <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
      Photo Gallery
    </span>
    <h3 className="text-2xl font-bold text-foreground">Moments we've captured</h3>
  </div>
  <PhotoGallery />
</div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-32 bg-foreground text-background">
        <div className="container mx-auto px-6 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-background/50 mb-4 block">
              The People Behind It
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-background">
              Meet the founding team
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:bg-white/10 transition-colors"
              >
                {/* Initials avatar */}
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-5">
                  <span className="text-2xl font-bold text-background">{member.initials}</span>
                </div>
                <h3 className="text-xl font-bold text-background mb-1">{member.name}</h3>
                <p className="text-sm font-semibold text-background/60 mb-4">{member.role}</p>
                <p className="text-xs text-background/40 leading-relaxed">{member.focus}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 md:px-8 max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4 block">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Frequently asked questions
            </h2>
          </div>

          <div className="divide-y-0">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 bg-muted border-t border-border/50">
        <div className="container mx-auto px-6 md:px-8 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
              Ready to join the standard?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Whether you're organizing an event or a professional looking to showcase your work, On Focus Club is built for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full px-8 h-14 font-semibold text-base" asChild>
                <Link href="/explore">Explore Directory</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 font-semibold text-base" asChild>
                <Link href="/join">Apply to Join</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
