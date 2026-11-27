import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  category: text("category").notNull(), // Concerts | Open Mics | Comedy | Community | Festivals
  date: text("date").notNull(),
  time: text("time").notNull(),
  displayDate: text("display_date"),
  venue: text("venue").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  price: text("price").notNull().default("Free"),
  performerPrice: integer("performer_price").notNull().default(0),
  audiencePrice: integer("audience_price").notNull().default(0),
  image: text("image").notNull().default(""),
  bannerImage: text("banner_image"),
  tag: text("tag"),
  genre: text("genre"),
  language: text("language"),
  duration: text("duration"),
  artistLineup: text("artist_lineup").array().notNull().default([]),
  about: text("about").notNull(),
  guidelines: text("guidelines").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
