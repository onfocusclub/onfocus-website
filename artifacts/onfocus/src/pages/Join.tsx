import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Camera, Building2, ChevronRight, Upload, X, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { sendPartnerNotification } from "@/lib/emailjs";

type ListingType = "artist" | "vendor" | "venue";

const TYPE_CONFIG = {
  artist: {
    icon: Music,
    title: "Artist",
    desc: "Singer, DJ, Performer, Band, Dancer & more",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
    activeColor: "bg-purple-50 border-purple-500 ring-2 ring-purple-300",
    categories: ["Singer", "DJ", "Classical Dancer", "Bollywood Dancer", "Band", "Comedian", "Photographer", "Videographer", "Other"],
  },
  vendor: {
    icon: Camera,
    title: "Vendor",
    desc: "Photography, Decor, Makeup, Catering & more",
    image: "https://images.unsplash.com/photo-1487530811015-780d30deabc9?w=400",
    color: "bg-pink-50 border-pink-200 hover:border-pink-400",
    activeColor: "bg-pink-50 border-pink-500 ring-2 ring-pink-300",
    categories: ["Photographer", "Videographer", "Florist", "Catering", "Makeup Artist", "Mehendi Artist", "Lighting & Decor", "Wedding Cake", "Other"],
  },
  venue: {
    icon: Building2,
    title: "Venue",
    desc: "Banquet Hall, Café, Rooftop, Lawn & more",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    activeColor: "bg-blue-50 border-blue-500 ring-2 ring-blue-300",
    categories: ["Banquet Hall", "Rooftop Venue", "Garden / Lawn", "Hotel", "Resort", "Café / Restaurant", "Convention Center", "Other"],
  },
};

const STEPS = ["Choose Type", "Basic Info", "About & Pricing", "Portfolio", "Review"];

export function Join() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ListingType | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", category: "",
    bio: "", priceRange: "", yearsActive: "", website: "",
  });

  function updateForm(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newFiles = [...mediaFiles, ...files].slice(0, 10);
    setMediaFiles(newFiles);
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setMediaPreviews(previews);
  }

  function removeFile(i: number) {
    const newFiles = mediaFiles.filter((_, idx) => idx !== i);
    const newPreviews = mediaPreviews.filter((_, idx) => idx !== i);
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  }

  async function handleSubmit() {
  setIsSubmitting(true);
  try {
    await sendPartnerNotification({
      type:        type!,
      name:        form.name,
      email:       form.email,
      phone:       form.phone,
      city:        form.city,
      category:    form.category,
      bio:         form.bio,
      priceRange:  form.priceRange,
      yearsActive: form.yearsActive,
      website:     form.website,
      mediaCount:  mediaFiles.length,
    });
    setIsSuccess(true);
  } catch (err) {
    console.error("EmailJS error:", err);
    alert("Submission failed: " + JSON.stringify(err));
  } finally {
    setIsSubmitting(false);
  }
}

  const config = type ? TYPE_CONFIG[type] : null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Application Received!</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Thank you for applying to OnFocus. Our team will review your application and get back to you within 3-5 business days.
          </p>
          <Button size="lg" className="rounded-full px-10 h-14 font-semibold" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">Join as Partner</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Grow Your Presence with OnFocus</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Join a curated network of artists, vendors, and venues connecting with people planning meaningful events.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${i < step ? "bg-foreground text-background" : i === step ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden md:block ${i === step ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-foreground" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {/* Step 0 — Choose Type */}
            {step === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-8">What best describes you?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {(Object.keys(TYPE_CONFIG) as ListingType[]).map((t) => {
                    const cfg = TYPE_CONFIG[t];
                    const Icon = cfg.icon;
                    return (
                      <button key={t} onClick={() => setType(t)}
                        className={`relative rounded-2xl border-2 p-6 text-left transition-all overflow-hidden ${type === t ? cfg.activeColor : cfg.color}`}>
                        <div className="relative z-10">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <Icon className="w-6 h-6 text-foreground" />
                          </div>
                          <h3 className="text-xl font-bold mb-1">{cfg.title}</h3>
                          <p className="text-sm text-muted-foreground">{cfg.desc}</p>
                        </div>
                        <img src={cfg.image} alt={cfg.title} className="absolute right-0 bottom-0 w-32 h-32 object-cover opacity-20 rounded-tl-2xl" />
                        {type === t && <div className="absolute top-3 right-3 w-6 h-6 bg-foreground rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-center">
                  <Button size="lg" className="rounded-full px-12 h-14 font-semibold" disabled={!type} onClick={() => setStep(1)}>
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1 — Basic Info */}
            {step === 1 && (
              <div className="bg-white rounded-3xl border border-border p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-8">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Business / Professional Name *</label>
                    <Input placeholder="e.g. Riya Sharma" value={form.name} onChange={e => updateForm("name", e.target.value)} className="h-12" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contact Email *</label>
                    <Input type="email" placeholder="hello@example.com" value={form.email} onChange={e => updateForm("email", e.target.value)} className="h-12" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number</label>
                    <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => updateForm("phone", e.target.value)} className="h-12" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">City *</label>
                    <Input placeholder="e.g. Mumbai" value={form.city} onChange={e => updateForm("city", e.target.value)} className="h-12" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Primary Category *</label>
                    <div className="flex flex-wrap gap-2">
                      {config?.categories.map(cat => (
                        <button key={cat} onClick={() => updateForm("category", cat)}
                          className={`px-4 py-2 rounded-full text-sm border transition-all ${form.category === cat ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    {form.category === "Other" && (
                      <Input className="mt-3 h-12" placeholder="Please specify..." onChange={e => updateForm("category", e.target.value)} />
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Portfolio Website <span className="text-muted-foreground">(Optional)</span></label>
                    <Input placeholder="https://yourwebsite.com" value={form.website} onChange={e => updateForm("website", e.target.value)} className="h-12" />
                  </div>
                </div>
                <div className="flex justify-between mt-10">
                  <Button variant="outline" className="rounded-full px-8 h-12" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                  <Button className="rounded-full px-8 h-12 font-semibold" disabled={!form.name || !form.email || !form.city || !form.category} onClick={() => setStep(2)}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* Step 2 — About & Pricing */}
            {step === 2 && (
              <div className="bg-white rounded-3xl border border-border p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-8">About & Pricing</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">About Your Work *</label>
                    <Textarea placeholder="Tell us about your experience, style, and what makes your work unique..." value={form.bio} onChange={e => updateForm("bio", e.target.value)} className="min-h-[150px] resize-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Price Range <span className="text-muted-foreground">(Optional)</span></label>
                      <Input placeholder="e.g. ₹15,000 - ₹50,000" value={form.priceRange} onChange={e => updateForm("priceRange", e.target.value)} className="h-12" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Years Active <span className="text-muted-foreground">(Optional)</span></label>
                      <Input type="number" placeholder="e.g. 5" value={form.yearsActive} onChange={e => updateForm("yearsActive", e.target.value)} className="h-12" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-10">
                  <Button variant="outline" className="rounded-full px-8 h-12" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                  <Button className="rounded-full px-8 h-12 font-semibold" disabled={!form.bio} onClick={() => setStep(3)}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* Step 3 — Portfolio */}
            {step === 3 && (
              <div className="bg-white rounded-3xl border border-border p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-2">Portfolio</h2>
                <p className="text-muted-foreground mb-8">Upload photos and videos showcasing your work (max 10 files)</p>
                <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-foreground transition-colors" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">Click to upload photos & videos</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG, MP4, MOV up to 50MB each</p>
                  <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFiles} />
                </div>
                {mediaPreviews.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-6">
                    {mediaPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        {mediaFiles[i]?.type.startsWith("video") ? (
                          <video src={src} className="w-full h-full object-cover" />
                        ) : (
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        )}
                        <button onClick={() => removeFile(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-10">
                  <Button variant="outline" className="rounded-full px-8 h-12" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                  <Button className="rounded-full px-8 h-12 font-semibold" onClick={() => setStep(4)}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* Step 4 — Review */}
            {step === 4 && config && (
              <div className="bg-white rounded-3xl border border-border p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-2">Review Your Application</h2>
                <p className="text-muted-foreground mb-8">Please review your details before submitting.</p>
                <div className="space-y-4">
                  {[
                    { label: "Type", value: type },
                    { label: "Name", value: form.name },
                    { label: "Email", value: form.email },
                    { label: "Phone", value: form.phone || "—" },
                    { label: "City", value: form.city },
                    { label: "Category", value: form.category },
                    { label: "Price Range", value: form.priceRange || "—" },
                    { label: "Years Active", value: form.yearsActive || "—" },
                    { label: "Portfolio Files", value: `${mediaFiles.length} file(s)` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-3 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium capitalize">{value}</span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-1">About</p>
                    <p className="text-sm">{form.bio}</p>
                  </div>
                </div>
                <div className="flex justify-between mt-10">
                  <Button variant="outline" className="rounded-full px-8 h-12" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                  <Button className="rounded-full px-8 h-14 font-semibold text-base" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application ✓"}
                  </Button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}