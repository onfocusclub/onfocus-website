import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Save, Check, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import imageCompression from "browser-image-compression";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

type PortfolioItem = {
  image: string;
  eventName: string;
  about: string;
  genre: string;
  attendees?: number | null;
};

type Listing = {
  id: number;
  name: string;
  type: string;
  category: string;
  city: string;
  bio: string;
  coverImage: string;
  profileImage: string;
  images: string[];
  priceRange: string | null;
  yearsActive: number | null;
  eventsCompleted: number | null;
  capacity: number | null;
  tags: string[];
  amenities: string[];
  portfolioItems: PortfolioItem[];
};

type UploadedMedia = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
};

async function prepareImage(file: File) {
  if (file.size > IMAGE_MAX_BYTES) throw new Error("Image too large. Max 5MB.");
  return imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1400, useWebWorker: true });
}

async function uploadFiles(files: File[]): Promise<UploadedMedia[]> {
  const body = new FormData();
  files.forEach(f => body.append("files", f));
  const res = await fetch(`${API_BASE}/api/uploads/media`, { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.media as UploadedMedia[];
}

export function EditListing() {
  const params = useParams();
  const id = Number(params.id);
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    bio: "",
    priceRange: "",
    yearsActive: "",
    eventsCompleted: "",
    capacity: "",
    tags: "",
    amenities: "",
  });

  const [coverImage, setCoverImage] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  const coverRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`${API_BASE}/api/listings/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setListing(data);
        setForm({
          name: data.name ?? "",
          bio: data.bio ?? "",
          priceRange: data.priceRange ?? "",
          yearsActive: data.yearsActive?.toString() ?? "",
          eventsCompleted: data.eventsCompleted?.toString() ?? "",
          capacity: data.capacity?.toString() ?? "",
          tags: (data.tags ?? []).join("\n"),
          amenities: (data.amenities ?? []).join("\n"),
        });
        setCoverImage(data.coverImage ?? "");
        setProfileImage(data.profileImage ?? "");
        setGalleryImages(data.images ?? []);
        setPortfolioItems(data.portfolioItems ?? []);
      } catch {
        setError("Listing not found");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchListing();
  }, [id]);

  async function handleImageUpload(
    e: ChangeEvent<HTMLInputElement>,
    target: "cover" | "profile" | "gallery"
  ) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    try {
      setUploading(true);
      const compressed = await Promise.all(files.slice(0, target === "gallery" ? 5 : 1).map(prepareImage));
      const uploaded = await uploadFiles(compressed);

      if (target === "cover") setCoverImage(uploaded[0].url);
      else if (target === "profile") setProfileImage(uploaded[0].url);
      else setGalleryImages(prev => [...prev, ...uploaded.map(u => u.url)].slice(0, 8));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function updatePortfolio(index: number, key: keyof PortfolioItem, value: string | number | null) {
    setPortfolioItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          priceRange: form.priceRange || null,
          yearsActive: form.yearsActive ? Number(form.yearsActive) : null,
          eventsCompleted: form.eventsCompleted ? Number(form.eventsCompleted) : null,
          capacity: form.capacity ? Number(form.capacity) : null,
          tags: form.tags.split("\n").map(t => t.trim()).filter(Boolean),
          amenities: form.amenities.split("\n").map(a => a.trim()).filter(Boolean),
          coverImage,
          profileImage,
          images: galleryImages,
          portfolioItems,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center">Please login first.</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (error && !listing) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">

        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href={`/listing/${id}`}><ArrowLeft className="w-4 h-4 mr-1" /> Back to Profile</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-sm text-muted-foreground capitalize">{listing?.type}</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-3xl border border-border p-8 space-y-6">
            <h2 className="text-lg font-bold">Basic Information</h2>

            <div>
              <label className="text-sm font-medium mb-2 block">Stage / Business Name</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name or stage name" className="h-12" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">About Your Work *</label>
              <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="min-h-[150px] resize-none" placeholder="Tell people about your work..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <Input value={form.priceRange} onChange={e => setForm(f => ({ ...f, priceRange: e.target.value }))} placeholder="e.g. ₹15,000 - ₹50,000" className="h-12" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Years Active</label>
                <Input type="number" value={form.yearsActive} onChange={e => setForm(f => ({ ...f, yearsActive: e.target.value }))} placeholder="e.g. 5" className="h-12" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Events Completed</label>
                <Input type="number" value={form.eventsCompleted} onChange={e => setForm(f => ({ ...f, eventsCompleted: e.target.value }))} placeholder="e.g. 120" className="h-12" />
              </div>
              {listing?.type === "venue" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Guest Capacity</label>
                  <Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="e.g. 500" className="h-12" />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags / Languages / Genres <span className="text-muted-foreground">(one per line)</span></label>
              <Textarea value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="min-h-[100px] resize-none" placeholder={"Hindi\nWedding\nLive Performer"} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {listing?.type === "venue" ? "Amenities" : listing?.type === "vendor" ? "Services / Inclusions" : "Suitable For"}
                <span className="text-muted-foreground"> (one per line)</span>
              </label>
              <Textarea value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} className="min-h-[100px] resize-none" placeholder={"Weddings\nCorporate Events\nPrivate Parties"} />
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-3xl border border-border p-8 space-y-6">
            <h2 className="text-lg font-bold">Photos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Image */}
              <div>
                <label className="text-sm font-medium mb-2 block">Cover Image</label>
                <div className="relative rounded-2xl overflow-hidden border border-dashed border-border bg-muted/30 aspect-video cursor-pointer hover:border-foreground/40 transition-colors" onClick={() => coverRef.current?.click()}>
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload cover</span>
                    </div>
                  )}
                  <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleImageUpload(e, "cover")} />
                </div>
              </div>

              {/* Profile Image */}
              <div>
                <label className="text-sm font-medium mb-2 block">Profile Image</label>
                <div className="relative rounded-2xl overflow-hidden border border-dashed border-border bg-muted/30 aspect-video cursor-pointer hover:border-foreground/40 transition-colors" onClick={() => profileRef.current?.click()}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload profile</span>
                    </div>
                  )}
                  <input ref={profileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleImageUpload(e, "profile")} />
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <label className="text-sm font-medium mb-2 block">Gallery Images</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {galleryImages.map((url, i) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                    <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => setGalleryImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {galleryImages.length < 8 && (
                  <div onClick={() => galleryRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center cursor-pointer hover:border-foreground/40 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => handleImageUpload(e, "gallery")} />
                  </div>
                )}
              </div>
            </div>

            {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          </div>

          {/* Portfolio Items */}
          {portfolioItems.length > 0 && (
            <div className="bg-white rounded-3xl border border-border p-8 space-y-6">
              <h2 className="text-lg font-bold">Portfolio Events</h2>
              <p className="text-sm text-muted-foreground">Edit details for each event in your portfolio.</p>

              <div className="space-y-6">
                {portfolioItems.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-border p-4 space-y-3">
                    <div className="flex gap-4">
                      <img src={item.image} alt={item.eventName} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input placeholder="Event name" value={item.eventName} onChange={e => updatePortfolio(index, "eventName", e.target.value)} className="h-10" />
                        <Input placeholder="Genre / style" value={item.genre} onChange={e => updatePortfolio(index, "genre", e.target.value)} className="h-10" />
                        <Input type="number" placeholder="Attendees" value={item.attendees?.toString() ?? ""} onChange={e => updatePortfolio(index, "attendees", e.target.value ? Number(e.target.value) : null)} className="h-10" />
                      </div>
                    </div>
                    <Textarea placeholder="About this event..." value={item.about} onChange={e => updatePortfolio(index, "about", e.target.value)} className="min-h-[80px] resize-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 px-2">{error}</p>}

          <Button onClick={handleSave} disabled={saving || uploading || !form.bio} className="w-full rounded-full h-12 font-semibold">
            {saving ? "Saving..." : saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>
    </div>
  );
}