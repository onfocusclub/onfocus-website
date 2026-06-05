import { useState, useEffect, type ChangeEvent } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Music, Camera, Building2, ChevronRight, Check, ArrowLeft, Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { sendPartnerNotification } from "@/lib/emailjs";
import imageCompression from "browser-image-compression";

type ListingType = "artist" | "vendor" | "venue";

type UploadedMedia = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
};

type MediaSlot = {
  file: File;
  previewUrl: string;
  uploaded?: UploadedMedia;
};

type PortfolioDraft = {
  eventName: string;
  about: string;
  genre: string;
  attendees: string;
};

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_BYTES = 10 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 5;
const MAX_VIDEOS = 1;

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

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
export function Join() {
  const { user, openModal } = useAuth();
  const params = useParams<{ id?: string }>();
const editId = params?.id ? Number(params.id) : null;
const isEditMode = Boolean(editId);
const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ListingType | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => {
  if (!editId) return;
  setIsLoadingEdit(true);

  fetch(`${API_BASE}/api/partner-applications/${editId}`)
    .then(res => res.json())
    .then(data => {
      // Pre-fill type
      if (data.type) setType(data.type as ListingType);

      // Pre-fill form fields
      setForm({
        name:            data.name          ?? "",
        email:           data.email         ?? "",
        phone:           data.phone         ?? "",
        city:            data.city          ?? "",
        category:        data.category      ?? "",
        bio:             data.description   ?? "",
        priceRange:      data.price_range   ?? "",
        yearsActive:     data.years_active  ? String(data.years_active)  : "",
        eventsCompleted: data.events_completed ? String(data.events_completed) : "",
        capacity:        data.capacity      ? String(data.capacity)      : "",
        website:         data.website       ?? "",
        tags:            Array.isArray(data.tags) ? data.tags.join("\n") : "",
        amenities:       Array.isArray(data.amenities) ? data.amenities.join("\n") : "",
      });

      // Skip to step 1 so they don't have to re-pick type
      setStep(1);
    })
    .catch(err => {
      console.error("Failed to load application:", err);
      alert("Could not load your application. Please try again.");
    })
    .finally(() => setIsLoadingEdit(false));
}, [editId]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<MediaSlot | null>(null);
  const [profileImage, setProfileImage] = useState<MediaSlot | null>(null);
  const [galleryImages, setGalleryImages] = useState<MediaSlot[]>([]);
  const [portfolioDrafts, setPortfolioDrafts] = useState<PortfolioDraft[]>([]);
  const [videos, setVideos] = useState<MediaSlot[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "", category: "",
   bio: "", priceRange: "", yearsActive: "", eventsCompleted: "", capacity: "", website: "",
   tags: "", amenities: "",
  });

  function updateForm(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function updatePortfolioDraft(index: number, key: keyof PortfolioDraft, value: string) {
  setPortfolioDrafts((prev) => {
    const next = [...prev];
    const current = next[index] ?? {
      eventName: "",
      about: "",
      genre: "",
      attendees: "",
    };

    next[index] = {
      ...current,
      [key]: value,
    };

    return next;
  });
}

 const tags = splitLines(form.tags);
const amenities = splitLines(form.amenities);
const uploadedGalleryUrls = galleryImages
  .map((item) => item.uploaded?.url)
  .filter(Boolean) as string[];
const uploadedVideoUrls = videos
  .map((item) => item.uploaded?.url)
  .filter(Boolean) as string[];
const uploadedMediaCount =
  Number(Boolean(coverImage?.uploaded)) +
  Number(Boolean(profileImage?.uploaded)) +
  uploadedGalleryUrls.length +
  uploadedVideoUrls.length;

  function revokeSlot(slot: MediaSlot | null) {
  if (slot) URL.revokeObjectURL(slot.previewUrl);
}

async function prepareImage(file: File) {
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error("Image is too large. Please upload an image up to 5 MB.");
  }

  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1400,
    useWebWorker: true,
  });
}

async function uploadFiles(files: File[]) {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));

  const res = await fetch(`${API_BASE}/api/uploads/media`, {
    method: "POST",
    body,
  });

  const data = await res.json();
  if (!res.ok) {
  throw new Error(data.error || "Upload failed. Please check file size and try again.");
}

  return data.media as UploadedMedia[];
}

async function handleImagePick(
  event: ChangeEvent<HTMLInputElement>,
  target: "cover" | "profile" | "gallery",
) {
  const files = Array.from(event.target.files ?? []);
  event.target.value = "";

  if (files.length === 0) return;

  try {
    setIsUploading(true);

    const limitedFiles =
      target === "gallery"
        ? files.slice(0, Math.max(0, MAX_GALLERY_IMAGES - galleryImages.length))
        : [files[0]];

    const compressedFiles = await Promise.all(limitedFiles.map(prepareImage));
    const uploaded = await uploadFiles(compressedFiles);

    const slots = compressedFiles.map((file, index) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      uploaded: uploaded[index],
    }));

    if (target === "cover") {
      revokeSlot(coverImage);
      setCoverImage(slots[0]);
    } else if (target === "profile") {
      revokeSlot(profileImage);
      setProfileImage(slots[0]);
    } else {
  setGalleryImages((prev) => [...prev, ...slots].slice(0, MAX_GALLERY_IMAGES));
  setPortfolioDrafts((prev) => [
    ...prev,
    ...slots.map(() => ({
      eventName: "",
      about: "",
      genre: "",
      attendees: "",
    })),
  ].slice(0, MAX_GALLERY_IMAGES));
}
  } catch (err) {
    alert(err instanceof Error ? err.message : "Image upload failed");
  } finally {
    setIsUploading(false);
  }
}

async function handleVideoPick(event: ChangeEvent<HTMLInputElement>) {
  const files = Array.from(event.target.files ?? []);
  event.target.value = "";

  if (files.length === 0) return;

  const remaining = MAX_VIDEOS - videos.length;
  const selected = files.slice(0, remaining);

  const oversized = selected.find((file) => file.size > VIDEO_MAX_BYTES);
  if (oversized) {
   alert("Video is too large. Please upload a video up to 10 MB.");
    return;
  }

  try {
    setIsUploading(true);
    const uploaded = await uploadFiles(selected);
    const slots = selected.map((file, index) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      uploaded: uploaded[index],
    }));

    setVideos((prev) => [...prev, ...slots].slice(0, MAX_VIDEOS));
  } catch (err) {
    alert(err instanceof Error ? err.message : "Video upload failed");
  } finally {
    setIsUploading(false);
  }
}

function removeGalleryImage(index: number) {
  setGalleryImages((prev) => {
    const next = [...prev];
    const [removed] = next.splice(index, 1);
    revokeSlot(removed ?? null);
    setPortfolioDrafts((drafts) => drafts.filter((_, draftIndex) => draftIndex !== index));
    return next;
  });
}

function removeVideo(index: number) {
  setVideos((prev) => {
    const next = [...prev];
    const [removed] = next.splice(index, 1);
    revokeSlot(removed ?? null);
    return next;
  });
}

const portfolioItems = galleryImages
  .map((item, index) => ({
    image: item.uploaded?.url ?? "",
    eventName: portfolioDrafts[index]?.eventName ?? "",
    about: portfolioDrafts[index]?.about ?? "",
    genre: portfolioDrafts[index]?.genre ?? form.category,
    attendees: portfolioDrafts[index]?.attendees
      ? Number(portfolioDrafts[index].attendees)
      : null,
  }))
  .filter((item) => item.image && item.eventName && item.about && item.genre);


  async function handleSubmit() {
  if (!coverImage?.uploaded || !profileImage?.uploaded) {
  alert("Please upload a cover image and profile image before submitting.");
  return;
}
 setIsSubmitting(true);
  try {
    // 1. Save to your Neon DB via backend
   const apiRes = await fetch(
  isEditMode
    ? `${API_BASE}/api/partner-applications/${editId}`
    : `${API_BASE}/api/partner-applications`,
  {
    method: isEditMode ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerType:     type,
      businessName:    form.name,
      email:           form.email,
      phone:           form.phone || null,
      city:            form.city,
      category:        form.category,
      description:     form.bio,
      priceRange:      form.priceRange || null,
      yearsActive:     form.yearsActive     ? Number(form.yearsActive)     : null,
      eventsCompleted: form.eventsCompleted ? Number(form.eventsCompleted) : null,
      capacity:        form.capacity        ? Number(form.capacity)        : null,
      tags,
      amenities,
      coverImage:      coverImage?.uploaded?.url   ?? null,
      profileImage:    profileImage?.uploaded?.url ?? null,
      galleryUrls:     uploadedGalleryUrls,
      videoUrls:       uploadedVideoUrls,
      mediaMetadata: {
        coverImage:    coverImage?.uploaded   ?? null,
        profileImage:  profileImage?.uploaded ?? null,
        galleryImages: galleryImages.map(i => i.uploaded).filter(Boolean),
        videos:        videos.map(i => i.uploaded).filter(Boolean),
      },
      portfolioUrls:  uploadedGalleryUrls,
      portfolioItems,
      website:        form.website || null,
    }),
  }
);

    if (!apiRes.ok) {
      const err = await apiRes.json();
      throw new Error(err.error || "Failed to save application");
    }

    // 2. Send email notification
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
      mediaCount: uploadedMediaCount,
    });

    setIsSuccess(true);
  } catch (err) {
    console.error("Submission error:", err);
    alert("Submission failed: " + (err instanceof Error ? err.message : JSON.stringify(err)));
  } finally {
    setIsSubmitting(false);
  }
}

  const config = type ? TYPE_CONFIG[type] : null;

  if (isLoadingEdit) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading your application...</p>
    </div>
  );
}

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">Login Required</h2>
          <p className="text-muted-foreground mb-8">Please sign in to apply as a partner on OnFocus.</p>
          <Button size="lg" className="rounded-full px-10 h-14 font-semibold" onClick={openModal}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
  {isEditMode ? "Application Updated!" : "Application Received!"}
</h2>
<p className="text-muted-foreground mb-8 leading-relaxed">
  {isEditMode
    ? "Your application has been updated and is back under review. We'll get back to you within 3-5 business days."
    : "Thank you for applying to OnFocus. Our team will review your application and get back to you within 3-5 business days."}
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

           {/* Step 2 — About & Profile Details */}
{step === 2 && (
  <div className="bg-white rounded-3xl border border-border p-8 md:p-12">
    <h2 className="text-2xl font-bold mb-8">About & Profile Details</h2>
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">About Your Work *</label>
        <Textarea
          placeholder="Tell us about your experience, style, and what makes your work unique..."
          value={form.bio}
          onChange={e => updateForm("bio", e.target.value)}
          className="min-h-[150px] resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Price Range</label>
          <Input
            placeholder="e.g. ₹15,000 - ₹50,000"
            value={form.priceRange}
            onChange={e => updateForm("priceRange", e.target.value)}
            className="h-12"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Years Active</label>
          <Input
            type="number"
            placeholder="e.g. 5"
            value={form.yearsActive}
            onChange={e => updateForm("yearsActive", e.target.value)}
            className="h-12"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Events Completed</label>
          <Input
            type="number"
            placeholder="e.g. 120"
            value={form.eventsCompleted}
            onChange={e => updateForm("eventsCompleted", e.target.value)}
            className="h-12"
          />
        </div>
        {type === "venue" && (
          <div>
            <label className="text-sm font-medium mb-2 block">Guest Capacity</label>
            <Input
              type="number"
              placeholder="e.g. 500"
              value={form.capacity}
              onChange={e => updateForm("capacity", e.target.value)}
              className="h-12"
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          {type === "artist" ? "Languages / Genres / Tags" : type === "vendor" ? "Services / Tags" : "Venue Tags"}
        </label>
        <Textarea
          placeholder={"One per line, e.g.\nHindi\nWedding\nLive Performer"}
          value={form.tags}
          onChange={e => updateForm("tags", e.target.value)}
          className="min-h-[110px] resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          {type === "artist" ? "Suitable For" : type === "vendor" ? "Package Inclusions / Services" : "Amenities"}
        </label>
        <Textarea
          placeholder={"One per line, e.g.\nWeddings\nCorporate Events\nPrivate Parties"}
          value={form.amenities}
          onChange={e => updateForm("amenities", e.target.value)}
          className="min-h-[110px] resize-none"
        />
      </div>
    </div>

    <div className="flex justify-between mt-10">
      <Button variant="outline" className="rounded-full px-8 h-12" onClick={() => setStep(1)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>
      <Button className="rounded-full px-8 h-12 font-semibold" disabled={!form.bio} onClick={() => setStep(3)}>
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  </div>
)}

        {/* Step 3 — Media */}
{step === 3 && (
  <div className="bg-white rounded-3xl border border-border p-8 md:p-12">
    <h2 className="text-2xl font-bold mb-2">Profile Media</h2>
    <p className="text-muted-foreground mb-8">
      Upload a cover image, profile image, and a small gallery. Images are compressed before upload.
    </p>

    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Cover Image *</label>
          <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-center hover:border-foreground/40">
            {coverImage ? (
              <img src={coverImage.previewUrl} alt="Cover preview" className="h-44 w-full rounded-xl object-cover" />
            ) : (
              <>
                <Upload className="mb-3 h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Upload cover</span>
                <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP up to 5 MB</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => handleImagePick(event, "cover")}
            />
          </label>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Profile Image *</label>
          <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-center hover:border-foreground/40">
            {profileImage ? (
              <img src={profileImage.previewUrl} alt="Profile preview" className="h-44 w-44 rounded-full object-cover" />
            ) : (
              <>
                <ImageIcon className="mb-3 h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Upload profile</span>
                <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP up to 5 MB</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => handleImagePick(event, "profile")}
            />
          </label>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <label className="text-sm font-medium">Gallery Images</label>
          <span className="text-xs text-muted-foreground">{galleryImages.length}/{MAX_GALLERY_IMAGES}</span>
        </div>
        <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-center hover:border-foreground/40">
          <Upload className="mr-2 h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Add gallery images</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={galleryImages.length >= MAX_GALLERY_IMAGES}
            onChange={(event) => handleImagePick(event, "gallery")}
          />
        </label>

        {galleryImages.length > 0 && (
  <div className="mt-4 space-y-4">
    {galleryImages.map((item, index) => (
      <div key={item.previewUrl} className="rounded-2xl border border-border bg-muted/20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
            <img src={item.previewUrl} alt={`Gallery preview ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              title="Remove image"
              onClick={() => removeGalleryImage(index)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Event name"
              value={portfolioDrafts[index]?.eventName ?? ""}
              onChange={(event) => updatePortfolioDraft(index, "eventName", event.target.value)}
              className="h-11 bg-white"
            />
            <Input
              placeholder="Genre / style"
              value={portfolioDrafts[index]?.genre ?? ""}
              onChange={(event) => updatePortfolioDraft(index, "genre", event.target.value)}
              className="h-11 bg-white"
            />
            <Input
              type="number"
              min="0"
              placeholder="Attendees"
              value={portfolioDrafts[index]?.attendees ?? ""}
              onChange={(event) => updatePortfolioDraft(index, "attendees", event.target.value)}
              className="h-11 bg-white"
            />
            <Textarea
              placeholder="Short about this event"
              value={portfolioDrafts[index]?.about ?? ""}
              onChange={(event) => updatePortfolioDraft(index, "about", event.target.value)}
              className="min-h-[88px] resize-none bg-white md:col-span-2"
            />
          </div>
        </div>
      </div>
    ))}
  </div>
)}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <label className="text-sm font-medium">Optional Videos</label>
          <span className="text-xs text-muted-foreground">{videos.length}/{MAX_VIDEOS}</span>
        </div>
        <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-center hover:border-foreground/40">
          <Video className="mr-2 h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Add short videos</span>
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            multiple
            className="hidden"
            disabled={videos.length >= MAX_VIDEOS}
            onChange={handleVideoPick}
          />
        </label>

        {videos.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {videos.map((item, index) => (
              <div key={item.previewUrl} className="relative overflow-hidden rounded-xl border border-border bg-muted">
                <video src={item.previewUrl} className="aspect-video w-full object-cover" controls />
                <button
                  type="button"
                  title="Remove video"
                  onClick={() => removeVideo(index)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {isUploading && (
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Uploading media...
        </div>
      )}
    </div>

    <div className="flex justify-between mt-10">
      <Button variant="outline" className="rounded-full px-8 h-12" onClick={() => setStep(2)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>
      <Button
        className="rounded-full px-8 h-12 font-semibold"
        disabled={!coverImage?.uploaded || !profileImage?.uploaded || isUploading}
        onClick={() => setStep(4)}
      >
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
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
                    
                    { label: "Events Completed", value: form.eventsCompleted || "—" },
{ label: "Capacity", value: form.capacity || "—" },
{ label: "Tags", value: tags.length ? `${tags.length} added` : "—" },
{ label: "Amenities / Services", value: amenities.length ? `${amenities.length} added` : "—" },
                   { label: "Media", value: `${uploadedMediaCount} item(s)` },
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