import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Users,
  CheckCircle2,
  Ticket,
  Share2,
  ShieldCheck,
  Tag,
  Sparkles,
  Download,
  Check,
  QrCode,
  AlertCircle,
  Copy,
  Lock,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getEventById, CURATED_EVENTS, type EventItem } from "@/lib/eventsData";

type Step = "details" | "form" | "confirm" | "ticket";
type CategoryType = "Performer" | "Audience";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function EventDetails() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const [liveEvent, setLiveEvent] = useState<EventItem | null>(() => getEventById(params?.id || "") || null);
  const [isLoadingEvent, setIsLoadingEvent] = useState<boolean>(!liveEvent);

  useEffect(() => {
    if (params?.id) {
      const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
      fetch(`${API_BASE}/api/events/${params.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && (data.id || data.slug)) {
            setLiveEvent({
              ...data,
              performerPrice: data.performerPrice ?? data.performer_price ?? 0,
              audiencePrice: data.audiencePrice ?? data.audience_price ?? 0,
              bannerImage: data.bannerImage ?? data.banner_image ?? data.image,
              artistLineup: data.artistLineup ?? data.artist_lineup ?? [],
              displayDate: data.displayDate ?? data.display_date ?? data.date,
            });
          }
        })
        .catch(() => { })
        .finally(() => setIsLoadingEvent(false));
    }
  }, [params?.id]);

  const event = liveEvent;

  const [step, setStep] = useState<Step>("details");
  const [chosenCategory, setChosenCategory] = useState<CategoryType>("Performer");

  // Form State (Matching Performert.jpg.jpeg Form fields 1 to 8)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState(event?.city || "");
  const [performanceType, setPerformanceType] = useState("POETRY / SHAYARI");
  const [companionOption, setCompanionOption] = useState("No, I'm coming alone.");
  const [audienceCount, setAudienceCount] = useState(0);
  const [attendedBefore, setAttendedBefore] = useState("No");
  const [agreedTerms, setAgreedTerms] = useState(true);

  useEffect(() => {
    if (event?.city && !city) {
      setCity(event.city);
    }
  }, [event]);

  // Discount Offer Code
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Ticket Pass details
  const [ticketId, setTicketId] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Scanner preview modal toggle (screens 5, 6, 7 from Performert.jpg.jpeg)
  const [showScannerPreview, setShowScannerPreview] = useState(false);

  // Payment Gateway & Idempotency Key state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep("details");
    setTicketId(`OF-${Math.floor(100000 + Math.random() * 900000)}`);
  }, [params?.id]);

  if (!event) {
    if (isLoadingEvent) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading event details...</p>
        </div>
      );
    }
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Event Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-6 text-sm">
          The event you are looking for does not exist or may have been removed.
        </p>
        <Button asChild className="rounded-full px-6">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  // Price calculations
  const performerRate = event.performerPrice ?? 0;
  const audienceRate = event.audiencePrice ?? 0;

  // Base tickets calculation
  const primaryTicketCount = chosenCategory === "Performer" ? 1 : 1;
  const primaryTicketPrice =
    chosenCategory === "Performer" ? performerRate : audienceRate;

  const totalAudienceCount =
    chosenCategory === "Performer" ? audienceCount : Math.max(1, audienceCount);

  const subtotal =
    chosenCategory === "Performer"
      ? performerRate + audienceCount * audienceRate
      : audienceCount * audienceRate;

  const discountAmount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const convenienceFee = 0; // Free on OnFocus
  const grandTotal = Math.max(0, subtotal - discountAmount + convenienceFee);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "ONFOCUS10" || couponCode.trim().toUpperCase() === "FOCUS") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try 'ONFOCUS10' for 10% off.");
    }
  };

  const handleSelectCategory = (category: CategoryType) => {
    setChosenCategory(category);
    if (category === "Audience" && audienceCount === 0) {
      setAudienceCount(1);
    }
    setStep("form");
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert("Please provide your full name and mobile number.");
      return;
    }
    if (!agreedTerms) {
      alert("Please agree with the event Terms & Conditions to proceed.");
      return;
    }
    // Generate unique idempotency key for this checkout attempt
    const newIdempKey = `OF-IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setIdempotencyKey(newIdempKey);
    setPaymentError("");
    setStep("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmOrder = async () => {
    setIsProcessingPayment(true);
    setPaymentError("");

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay checkout failed to load. Please check your internet connection and try again.");
      }

      const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

      // 1. Create order with Idempotency Key
      const key = idempotencyKey || `OF-IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      if (!idempotencyKey) setIdempotencyKey(key);

      const orderRes = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": key,
        },
        body: JSON.stringify({
          idempotencyKey: key,
          eventId: event.id || event.slug,
          eventTitle: event.title,
          ticketType: chosenCategory,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          city,
          performanceType,
          companionOption,
          performerCount: chosenCategory === "Performer" ? 1 : 0,
          audienceCount,
          amount: grandTotal,
          discountAmount,
          couponCode: couponApplied ? couponCode : undefined,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order. Please try again.");
      }

      // Free tickets / RSVP (amount === 0)
      if (orderData.isFree || orderData.alreadyPaid) {
        setTicketId(orderData.ticketCode);
        setStep("ticket");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Paid ticket: launch Razorpay Checkout modal
      const options = {
        key: orderData.key,
        amount: orderData.amount, // in paise
        currency: orderData.currency || "INR",
        name: "OnFocus Events",
        description: `${chosenCategory} Ticket for ${event.title}`,
        image: event.image || "/favicon.ico",
        order_id: orderData.orderId,
        prefill: {
          name: fullName,
          email: email || undefined,
          contact: phone,
        },
        notes: {
          ticketType: chosenCategory,
          ticketCode: orderData.ticketCode,
          idempotencyKey: key,
        },
        theme: {
          color: "#09090b",
        },
        handler: async function (response: any) {
          try {
            // Verify payment on server
            const verifyRes = await fetch(`${API_BASE}/api/payments/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Idempotency-Key": key,
              },
              body: JSON.stringify({
                idempotencyKey: key,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: orderData.bookingId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setTicketId(verifyData.ticketCode || orderData.ticketCode);
              setStep("ticket");
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              setPaymentError(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            setPaymentError(err?.message || "Payment verification network error. Please contact support.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        setPaymentError(`Payment failed: ${response.error?.description || "Transaction declined"}`);
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      setPaymentError(err?.message || "Payment initiation failed. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Join me for ${event.title} on ${event.displayDate} in ${event.city}!`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-28 text-foreground selection:bg-foreground selection:text-background">
      {/* Top Breadcrumb & Back bar */}
      {/* <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-5xl mb-4">
        <div className="flex items-center justify-between py-2">
          <Link
            href="/#events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Live Events</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border/70 hover:bg-muted transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-muted-foreground" />}
              <span>{copiedLink ? "Link Copied!" : "Share Event"}</span>
            </button>
          </div>
        </div>
      </div> */}

      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-5xl">
        {/* =========================================================================
            STEP 1: DETAILS & CATEGORY SELECTION (Screen 1 from Performert.jpg.jpeg)
           ========================================================================= */}
        {step === "details" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {/* HERO SECTION: High-impact Event Banner */}
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-muted shadow-lg border border-border/60">
              <img
                src={event.bannerImage || event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              {/* Floating Badges */}
              {/* <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
                <Badge className="bg-black/60 backdrop-blur-md text-white border-0 text-xs font-semibold px-3 py-1 rounded-full">
                  {event.category}
                </Badge>
                {event.tag && (
                  <Badge className="bg-white text-black border-0 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {event.tag}
                  </Badge>
                )}
              </div> */}

              {/* Banner Details Overlay */}
              {/* <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white max-w-3xl">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide uppercase text-white/90 mb-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{event.displayDate}</span>
                  <span className="text-white/40">·</span>
                  <Clock className="w-4 h-4 ml-1" />
                  <span>{event.time}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  {event.title}
                </h1>
                <p className="text-xs sm:text-sm text-white/80 mt-2 line-clamp-2 sm:line-clamp-none max-w-2xl">
                  {event.subtitle}
                </p>
              </div> */}
            </div>

            {/* EVENT DETAILS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Description, Info & Guidelines */}
              <div className="lg:col-span-2 space-y-8">
                {/* Event Name, Date, Venue Summary Strip */}
                <div className="bg-muted/30 border border-border/60 rounded-2xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border/60 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Date & Time</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{event.date}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border/60 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Venue & City</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{event.venue}</p>
                        <p className="text-xs text-muted-foreground truncate">{event.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About the Event */}
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground mb-3">About the Event</h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {event.about}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                    <div>
                      <strong className="text-foreground">Language:</strong> {event.language}
                    </div>
                    <div>·</div>
                    <div>
                      <strong className="text-foreground">Genre:</strong> {event.genre}
                    </div>
                    <div>·</div>
                    <div>
                      <strong className="text-foreground">Duration:</strong> {event.duration}
                    </div>
                  </div>
                </div>

                {/* Featured Artists Lineup */}
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground mb-3">Featured Artists & Lineup</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {event.artistLineup.map((artist, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 bg-muted/60 border border-border/50 rounded-full px-4 py-2 text-xs md:text-sm font-medium text-foreground"
                      >
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{artist}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guidelines & Terms */}
                {event.guidelines && event.guidelines.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground mb-3">Event Guidelines & T&C</h3>
                    <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                      {event.guidelines.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Col: CHOOSE CATEGORY (Performer & Audience - Pixel-perfect match to Performert.jpg.jpeg) */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-white border border-border shadow-md rounded-2xl p-6 space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Pass Reservation
                    </span>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                      Choose Category
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select how you would like to participate in {event.title}.
                    </p>
                  </div>

                  {/* The Two Category Buttons (Performert.jpg.jpeg design) */}
                  <div className="space-y-3">
                    {/* Performer Card Button */}
                    <div
                      onClick={() => handleSelectCategory("Performer")}
                      className="group p-4 rounded-xl border-2 border-border/70 hover:border-foreground bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer relative"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                          On-Stage Slot
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {event.performerPrice === 0 ? "Free Slot" : `₹${event.performerPrice}`}
                        </span>
                      </div>
                      <Button
                        type="button"
                        className="w-full rounded-full font-bold h-12 text-sm bg-foreground text-background hover:bg-foreground/90 transition-all"
                      >
                        Performer
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center mt-2">
                        For poets, singers, comedians, bands & creators.
                      </p>
                    </div>

                    {/* Audience Card Button */}
                    <div
                      onClick={() => handleSelectCategory("Audience")}
                      className="group p-4 rounded-xl border-2 border-border/70 hover:border-foreground bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer relative"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                          Guest Entry
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {event.audiencePrice === 0 ? "Free RSVP" : `₹${event.audiencePrice}`}
                        </span>
                      </div>
                      <Button
                        type="button"
                        className="w-full rounded-full font-bold h-12 text-sm bg-foreground text-background hover:bg-foreground/90 transition-all"
                      >
                        Audience
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center mt-2">
                        Attend with friends & family to watch and enjoy.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Instant Digital Pass · OnFocus Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STEP 2: FORM SCREEN (Screen 2 from Performert.jpg.jpeg)
           ========================================================================= */}
        {step === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl mx-auto bg-white border border-border shadow-md rounded-2xl overflow-hidden"
          >
            {/* Top Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
              <button
                onClick={() => setStep("details")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Categories</span>
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                Registration Form
              </span>
            </div>

            {/* Event Mini Banner */}
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
              <img src={event.bannerImage || event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-lg font-bold truncate">{event.title}</h3>
                <p className="text-xs text-white/80">{event.date} | {event.time}</p>
              </div>
            </div>

            {/* Category Indicator */}
            <div className="text-center py-4 border-b border-border/50 bg-muted/10">
              <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground block mb-1">
                Registering As
              </span>
              <span className="text-base font-extrabold text-foreground px-4 py-1 rounded-full bg-foreground text-background inline-block">
                {chosenCategory}
              </span>
            </div>

            {/* Detailed Form (Fields 1 to 8 as per Performert.jpg.jpeg) */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6">
              {/* 1. YOUR FULL NAME */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                  1. YOUR FULL NAME *
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="rounded-xl h-11 text-sm bg-muted/20"
                />
              </div>

              {/* 2. MOBILE / WHATSAPP NUMBER */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                  2. MOBILE / WHATSAPP NUMBER *
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="rounded-xl h-11 text-sm bg-muted/20"
                />
              </div>

              {/* 3. EMAIL */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                  3. EMAIL
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-11 text-sm bg-muted/20"
                />
              </div>

              {/* 4. YOUR CITY */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                  4. YOUR CITY
                </label>
                <Input
                  type="text"
                  placeholder="Your City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl h-11 text-sm bg-muted/20"
                />
              </div>

              {/* 5. (If Performer) CHOOSE WHAT WILL YOU BE PERFORMING? */}
              {chosenCategory === "Performer" && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                    5. Choose what will you be performing?
                  </label>
                  <div className="space-y-2">
                    {[
                      "POETRY / SHAYARI",
                      "STORY TELLING",
                      "SINGING",
                      "STAND-UP",
                      "Group Performance",
                    ].map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-colors ${performanceType === opt
                          ? "border-foreground bg-muted/50 font-bold"
                          : "border-border/60 hover:bg-muted/30"
                          }`}
                      >
                        <input
                          type="radio"
                          name="performanceType"
                          checked={performanceType === opt}
                          onChange={() => setPerformanceType(opt)}
                          className="accent-foreground"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. ARE YOU BRINGING FAMILY OR FRIENDS WITH YOU? */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                  {chosenCategory === "Performer" ? "6" : "5"}. Are you bringing FAMILY or FRIENDS with you?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["No, I'm coming alone.", "Yes, +1", "Yes, +2", "More than +2"].map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${companionOption === opt
                        ? "border-foreground bg-muted/50 font-bold"
                        : "border-border/60 hover:bg-muted/30"
                        }`}
                    >
                      <input
                        type="radio"
                        name="companionOption"
                        checked={companionOption === opt}
                        onChange={() => {
                          setCompanionOption(opt);
                          if (opt === "Yes, +1") setAudienceCount(1);
                          if (opt === "Yes, +2") setAudienceCount(2);
                          if (opt === "More than +2") setAudienceCount(3);
                          if (opt === "No, I'm coming alone.") {
                            if (chosenCategory === "Performer") setAudienceCount(0);
                            else setAudienceCount(1);
                          }
                        }}
                        className="accent-foreground"
                      />
                      <span className="truncate">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 7. ADD AUDIENCE MEMBER COUNTER */}
              <div className="bg-muted/30 p-4 rounded-xl border border-border/60 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                    {chosenCategory === "Performer" ? "7" : "6"}. Add Audience Member:
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ₹{audienceRate} per audience pass
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white rounded-full p-1 border border-border shadow-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setAudienceCount(
                        Math.max(chosenCategory === "Audience" ? 1 : 0, audienceCount - 1)
                      )
                    }
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-foreground w-6 text-center">
                    {audienceCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAudienceCount(Math.min(10, audienceCount + 1))}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 8. HAVE YOU ATTENDED ANY ON FOCUS EVENT BEFORE? */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                  {chosenCategory === "Performer" ? "8" : "7"}. Have you attended any On Focus event before?
                </label>
                <div className="flex gap-4">
                  {["Yes", "No"].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${attendedBefore === opt
                        ? "border-foreground bg-muted/50 font-bold"
                        : "border-border/60 hover:bg-muted/30"
                        }`}
                    >
                      <input
                        type="radio"
                        name="attendedBefore"
                        checked={attendedBefore === opt}
                        onChange={() => setAttendedBefore(opt)}
                        className="accent-foreground"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* TERMS AGREEMENT */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 accent-foreground rounded"
                  />
                  <span>
                    I agree with the event <strong>Terms & Conditions</strong> and venue rules.
                  </span>
                </label>
              </div>

              {/* CONTINUE BUTTON */}
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full font-bold h-12 text-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md"
              >
                Continue
              </Button>
            </form>
          </motion.div>
        )}

        {/* =========================================================================
            STEP 3: CONFIRM PAYMENT SCREEN (Screen 3 from Performert.jpg.jpeg)
           ========================================================================= */}
        {step === "confirm" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl mx-auto bg-white border border-border shadow-md rounded-2xl overflow-hidden space-y-6 p-6 sm:p-8"
          >
            {/* Top Back Nav */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <button
                onClick={() => setStep("form")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Form</span>
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-foreground">
                Confirm Payment
              </span>
            </div>

            {/* Event Summary Card */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-foreground">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.date} | {event.time}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.venue}, {event.city}</p>
                </div>
                <Badge className="bg-foreground text-background border-0 text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                  {chosenCategory}
                </Badge>
              </div>
            </div>

            {/* Ticket Breakdown Card */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                Ticket Summary
              </h4>

              <div className="space-y-3 divide-y divide-border/40">
                {/* Performer Pass (if Performer) */}
                {chosenCategory === "Performer" && (
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Performer Ticket</p>
                      <p className="text-[11px] text-muted-foreground">Qty: 1 Slot ({performanceType})</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      ₹{performerRate}
                    </span>
                  </div>
                )}

                {/* Audience Pass(es) */}
                {audienceCount > 0 && (
                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Audience Ticket</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => setAudienceCount(Math.max(chosenCategory === "Audience" ? 1 : 0, audienceCount - 1))}
                          className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold hover:bg-muted/80 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-foreground">{audienceCount}</span>
                        <button
                          onClick={() => setAudienceCount(Math.min(10, audienceCount + 1))}
                          className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold hover:bg-muted/80 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      ₹{audienceCount * audienceRate}
                    </span>
                  </div>
                )}

                {/* Subtotals & Fees */}
                <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
                  <span>Ticket(s) price</span>
                  <span className="font-semibold text-foreground">₹{subtotal}</span>
                </div>

                <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
                  <span>Convenience fee</span>
                  <span className="font-semibold text-emerald-600">₹0 (Free)</span>
                </div>

                {couponApplied && (
                  <div className="flex items-center justify-between pt-3 text-xs text-emerald-600">
                    <span>Discount (10% OFF)</span>
                    <span className="font-semibold">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 text-base font-bold text-foreground">
                  <span>Order Total:</span>
                  <span className="text-lg">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Offer Coupon Card (Performert.jpg.jpeg style) */}
            <div className="p-3.5 rounded-xl border border-dashed border-border bg-muted/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Apply Offer / Promo Code</span>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="ONFOCUS10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                    className="h-8 text-xs w-28 uppercase rounded-lg"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={couponApplied || !couponCode.trim()}
                    className="h-8 text-xs rounded-lg px-3"
                  >
                    {couponApplied ? "Applied" : "Apply"}
                  </Button>
                </div>
              </div>
              {couponError && <p className="text-[11px] text-destructive mt-1.5">{couponError}</p>}
              {couponApplied && <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">Coupon ONFOCUS10 applied successfully!</p>}
            </div>

            {/* Payment Error Banner */}
            {paymentError && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{paymentError}</span>
              </div>
            )}

            {/* Bottom Total & Continue Bar */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Payable</p>
                <p className="text-2xl font-black text-foreground">₹{grandTotal}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Idempotent 256-bit Encrypted Checkout</span>
                </p>
              </div>

              <Button
                onClick={handleConfirmOrder}
                disabled={isProcessingPayment}
                size="lg"
                className="rounded-full font-bold px-8 h-12 text-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </div>
                ) : grandTotal === 0 ? (
                  <span>Confirm Free RSVP</span>
                ) : (
                  <span>Pay ₹{grandTotal} with Razorpay</span>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STEP 4: YOUR TICKET SCREEN (Screen 4 from Performert.jpg.jpeg)
           ========================================================================= */}
        {step === "ticket" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto space-y-6"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("details")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Event Page</span>
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Verified Pass
              </span>
            </div>

            {/* TICKET PASS CARD (Exact format from Performert.jpg.jpeg) */}
            <div className="bg-white border-2 border-border shadow-xl rounded-2xl overflow-hidden relative">
              {/* Event Header Banner */}
              <div className="bg-foreground text-background p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white">{event.title}</h3>
                    <p className="text-xs text-white/80 mt-1">{event.date} | {event.time}</p>
                    <p className="text-xs text-white/70 mt-0.5">{event.venue}, {event.city}</p>
                  </div>
                  <Badge className="bg-white text-foreground border-0 text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
                    {chosenCategory}
                  </Badge>
                </div>
              </div>

              {/* Performer / Ticket Type Info */}
              <div className="p-6 bg-muted/20 border-b border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {chosenCategory === "Performer" ? "Performer Ticket" : "Audience Pass"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">Ticket ID: {ticketId}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-white border border-border rounded-full shadow-xs">
                  Qty: {primaryTicketCount}
                </span>
              </div>

              {/* Scannable QR Code Container (Performert.jpg.jpeg style) */}
              <div className="p-8 flex flex-col items-center justify-center bg-white border-b border-dashed border-border">
                <div className="w-48 h-48 bg-muted/30 border-2 border-border/80 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-xs">
                  {/* Mock QR SVG */}
                  <svg className="w-36 h-36 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-2h4v2h-4v-2zm4-2h4v2h-4v-2zm-2 4h-2v2h2v-2zm2 2h2v2h-2v-2zm-6-4h2v2h-2v-2zm-2 2h2v2h-2v-2zm0-4h2v2h-2v-2z" />
                  </svg>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground mt-2 uppercase font-bold">
                    Scan for Entry
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Present this digital QR pass at the entry desk for instant check-in.
                </p>
              </div>

              {/* Attendee Details & Breakdown */}
              <div className="p-6 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attendee Name:</span>
                  <span className="font-semibold text-foreground">{fullName || "Attendee"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile:</span>
                  <span className="font-semibold text-foreground">{phone || "Not provided"}</span>
                </div>
                {chosenCategory === "Performer" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Performance Category:</span>
                    <span className="font-semibold text-foreground">{performanceType}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Audience Ticket(s):</span>
                  <span className="font-bold text-foreground">{audienceCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-bold text-foreground">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => window.print()}
                className="w-full rounded-full font-bold h-12 text-sm bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download / Print Ticket</span>
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowScannerPreview(true)}
                  className="flex-1 rounded-full font-semibold h-11 text-xs border-border/80"
                >
                  <QrCode className="w-4 h-4 mr-1.5" />
                  <span>Preview QR Scan Check</span>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="flex-1 rounded-full font-semibold h-11 text-xs border-border/80"
                >
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `I just booked my pass for ${event.title} on OnFocus! Ticket ID: ${ticketId}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <SiWhatsapp className="w-4 h-4 mr-1.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            QR SCANNER PREVIEW MODAL (Screens 5, 6, 7 from Performert.jpg.jpeg)
           ========================================================================= */}
        {showScannerPreview && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-6 shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ticket Check Simulator
                </span>
                <button
                  onClick={() => setShowScannerPreview(false)}
                  className="text-xs font-semibold px-2 py-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Big Green Verification Checkmark (Matching Screen 6 from Performert.jpg.jpeg) */}
              <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-200">
                <Check className="w-14 h-14" strokeWidth={3} />
              </div>

              <div>
                <h4 className="text-xl font-bold text-foreground">Valid Ticket</h4>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{ticketId}</p>
              </div>

              <div className="bg-muted/30 rounded-2xl p-4 text-xs space-y-2 text-left border border-border/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Performer Ticket:</span>
                  <span className="font-bold text-foreground">{chosenCategory === "Performer" ? "1" : "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Audience Ticket:</span>
                  <span className="font-bold text-foreground">{audienceCount}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold text-foreground">{fullName || "Attendee"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile:</span>
                  <span className="font-semibold text-foreground">{phone || "Not provided"}</span>
                </div>
              </div>

              <Button
                onClick={() => setShowScannerPreview(false)}
                className="w-full rounded-full font-bold h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Proceed
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
