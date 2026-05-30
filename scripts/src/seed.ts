import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { listingsTable } from "../../lib/db/src/schema/listings";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const listings = [
  // Artists
  { type: "artist", name: "Riya Sharma", category: "Classical Dancer", city: "Mumbai", rating: 4.9, reviewCount: 124, bio: "Award-winning Bharatanatyam dancer with 15 years of experience performing at weddings and cultural events.", coverImage: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=800", images: [], tags: ["Bharatanatyam", "Classical", "Wedding"], verified: true, featured: true, yearsActive: 15, eventsCompleted: 200, priceRange: "₹15,000 - ₹50,000" },
  { type: "artist", name: "Arjun Mehta", category: "Bollywood Singer", city: "Delhi", rating: 4.7, reviewCount: 98, bio: "Live Bollywood performer bringing energy and emotion to every event.", coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", images: [], tags: ["Bollywood", "Live Music", "Singer"], verified: true, featured: true, yearsActive: 10, eventsCompleted: 150, priceRange: "₹20,000 - ₹80,000" },
  { type: "artist", name: "Priya Nair", category: "Mehendi Artist", city: "Jaipur", rating: 4.8, reviewCount: 210, bio: "Intricate mehendi designs for bridal and festive occasions.", coverImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800", images: [], tags: ["Mehendi", "Bridal", "Festive"], verified: true, featured: false, yearsActive: 8, eventsCompleted: 400, priceRange: "₹5,000 - ₹20,000" },
  { type: "artist", name: "DJ Rohan", category: "DJ", city: "Bangalore", rating: 4.6, reviewCount: 76, bio: "High energy DJ specializing in Bollywood, EDM and fusion sets.", coverImage: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800", images: [], tags: ["DJ", "EDM", "Bollywood"], verified: true, featured: false, yearsActive: 6, eventsCompleted: 120, priceRange: "₹25,000 - ₹1,00,000" },
  { type: "artist", name: "Kavita Rao", category: "Photographer", city: "Hyderabad", rating: 4.9, reviewCount: 180, bio: "Candid wedding photographer capturing timeless moments.", coverImage: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800", images: [], tags: ["Photography", "Wedding", "Candid"], verified: true, featured: true, yearsActive: 12, eventsCompleted: 300, priceRange: "₹30,000 - ₹1,50,000" },
  { type: "artist", name: "Sameer Khan", category: "Stand-up Comedian", city: "Pune", rating: 4.5, reviewCount: 55, bio: "Corporate and wedding entertainer with a clean, hilarious act.", coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", images: [], tags: ["Comedy", "Entertainment", "Corporate"], verified: false, featured: false, yearsActive: 4, eventsCompleted: 80, priceRange: "₹10,000 - ₹40,000" },

  // Vendors
  { type: "vendor", name: "Bloom & Blossom", category: "Florist", city: "Mumbai", rating: 4.8, reviewCount: 145, bio: "Luxury floral decorations for weddings and corporate events.", coverImage: "https://images.unsplash.com/photo-1487530811015-780d30deabc9?w=800", images: [], tags: ["Flowers", "Decoration", "Wedding"], verified: true, featured: true, yearsActive: 9, eventsCompleted: 250, priceRange: "₹20,000 - ₹2,00,000" },
  { type: "vendor", name: "Royal Caterers", category: "Catering", city: "Delhi", rating: 4.7, reviewCount: 320, bio: "Multi-cuisine catering with authentic flavors for all occasions.", coverImage: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800", images: [], tags: ["Catering", "Food", "Multi-cuisine"], verified: true, featured: true, yearsActive: 20, eventsCompleted: 1000, priceRange: "₹800 - ₹2,500 per plate" },
  { type: "vendor", name: "Fairy Lights Co.", category: "Lighting & Decor", city: "Bangalore", rating: 4.6, reviewCount: 88, bio: "Creative lighting solutions transforming any space into a magical setting.", coverImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800", images: [], tags: ["Lighting", "Decor", "Events"], verified: true, featured: false, yearsActive: 5, eventsCompleted: 180, priceRange: "₹15,000 - ₹1,00,000" },
  { type: "vendor", name: "Sweet Moments Bakery", category: "Wedding Cakes", city: "Chennai", rating: 4.9, reviewCount: 200, bio: "Custom wedding and celebration cakes made with love.", coverImage: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800", images: [], tags: ["Cakes", "Bakery", "Wedding"], verified: true, featured: true, yearsActive: 7, eventsCompleted: 500, priceRange: "₹5,000 - ₹50,000" },

  // Venues
  { type: "venue", name: "The Grand Mahal", category: "Banquet Hall", city: "Mumbai", rating: 4.9, reviewCount: 412, bio: "A luxurious banquet hall with world-class amenities for your dream wedding.", coverImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800", images: [], tags: ["Banquet", "Wedding", "Luxury"], verified: true, featured: true, capacity: 1000, priceRange: "₹5,00,000 - ₹20,00,000", amenities: ["AC", "Parking", "Catering", "Stage"] },
  { type: "venue", name: "Garden of Dreams", category: "Outdoor Venue", city: "Jaipur", rating: 4.7, reviewCount: 189, bio: "Stunning open-air venue surrounded by lush gardens.", coverImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800", images: [], tags: ["Outdoor", "Garden", "Wedding"], verified: true, featured: true, capacity: 500, priceRange: "₹2,00,000 - ₹8,00,000", amenities: ["Parking", "Lawn", "Generator"] },
  { type: "venue", name: "Sky Lounge", category: "Rooftop Venue", city: "Delhi", rating: 4.6, reviewCount: 95, bio: "Trendy rooftop venue with panoramic city views.", coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", images: [], tags: ["Rooftop", "Corporate", "Cocktail"], verified: true, featured: false, capacity: 200, priceRange: "₹1,00,000 - ₹5,00,000", amenities: ["AC", "Bar", "Parking"] },
];

async function seed() {
  console.log("Seeding database...");
  await db.insert(listingsTable).values(listings as any);
  console.log(`✅ Inserted ${listings.length} listings successfully!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});