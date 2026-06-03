import { pgTable, text, serial, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // artist | vendor | venue
  name: text("name").notNull(),
  category: text("category").notNull(),
  city: text("city").notNull(),
  rating: real("rating").notNull().default(4.5),
  reviewCount: integer("review_count").notNull().default(0),
  bio: text("bio").notNull(),
  coverImage: text("cover_image").notNull().default(""),
  profileImage: text("profile_image"),
  images: text("images").array().notNull().default([]),
  videoUrls: text("video_urls").array().notNull().default([]),
  mediaMetadata: jsonb("media_metadata").$type<Record<string, unknown>>().notNull().default({}),
  tags: text("tags").array().notNull().default([]),
  verified: boolean("verified").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  yearsActive: integer("years_active"),
  eventsCompleted: integer("events_completed"),
  priceRange: text("price_range"),
  capacity: integer("capacity"),
  amenities: text("amenities").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
