import { Router, Request, Response } from "express";
import { Pool } from "pg";
import { eq, or, ilike, and, sql, desc } from "drizzle-orm";
import { db, eventsTable, type Event } from "@workspace/db";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(String).map((s) => s.trim()).filter(Boolean);
      } catch {
        return value.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  }
  return value.map(String).map((item) => item.trim()).filter(Boolean);
}

function toNullableNumber(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined || value === "") return defaultValue;
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
}

function generateSlug(title: string): string {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${clean || "event"}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Ensure the `events` table exists in PostgreSQL
let isTableInitialized = false;
async function ensureEventsTable(): Promise<void> {
  if (isTableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        subtitle TEXT,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        display_date TEXT,
        venue TEXT NOT NULL,
        address TEXT,
        city TEXT NOT NULL,
        price TEXT NOT NULL DEFAULT 'Free',
        performer_price INT NOT NULL DEFAULT 0,
        audience_price INT NOT NULL DEFAULT 0,
        image TEXT NOT NULL DEFAULT '',
        banner_image TEXT,
        tag TEXT,
        genre TEXT,
        language TEXT,
        duration TEXT,
        artist_lineup TEXT[] NOT NULL DEFAULT '{}',
        about TEXT NOT NULL,
        guidelines TEXT[] NOT NULL DEFAULT '{}',
        featured BOOLEAN NOT NULL DEFAULT false,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    isTableInitialized = true;
  } catch (err) {
    console.error("Failed to ensure events table:", err);
  }
}

// -----------------------------------------------------------------------------
// GET /api/events — List all events with optional filters
// -----------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response): Promise<void> => {
  await ensureEventsTable();

  const category = req.query.category as string | undefined;
  const city = req.query.city as string | undefined;
  const search = req.query.search as string | undefined;
  const featured = req.query.featured ? req.query.featured === "true" : undefined;
  const limit = parseInt((req.query.limit as string) ?? "50", 10);
  const offset = parseInt((req.query.offset as string) ?? "0", 10);

  try {
    const conditions = [];

    if (category && category !== "All Events") {
      conditions.push(ilike(eventsTable.category, `%${category}%`));
    }
    if (city && city !== "All Cities") {
      conditions.push(ilike(eventsTable.city, `%${city}%`));
    }
    if (featured !== undefined) {
      conditions.push(eq(eventsTable.featured, featured));
    }
    if (search) {
      conditions.push(
        or(
          ilike(eventsTable.title, `%${search}%`),
          ilike(eventsTable.venue, `%${search}%`),
          ilike(eventsTable.genre, `%${search}%`),
          ilike(eventsTable.city, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const events = await db
      .select()
      .from(eventsTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(eventsTable.featured), desc(eventsTable.createdAt));

    const [{ count: total }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(eventsTable)
      .where(whereClause);

    res.json({
      events,
      total,
      limit,
      offset,
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// -----------------------------------------------------------------------------
// GET /api/events/:id — Get event by numeric ID or string slug
// -----------------------------------------------------------------------------
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await ensureEventsTable();

  const rawParam = req.params.id;
  const param = String(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  const numericId = Number(param);
  const isNumeric = Number.isInteger(numericId) && numericId > 0;

  try {
    const condition = isNumeric
      ? or(eq(eventsTable.id, numericId), eq(eventsTable.slug, param))
      : eq(eventsTable.slug, param);

    const [event] = await db
      .select()
      .from(eventsTable)
      .where(condition)
      .limit(1);

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// -----------------------------------------------------------------------------
// POST /api/events — Create a new event
// -----------------------------------------------------------------------------
router.post("/", async (req: Request, res: Response): Promise<void> => {
  await ensureEventsTable();

  const {
    slug,
    title,
    subtitle,
    category,
    date,
    time,
    displayDate,
    venue,
    address,
    city,
    price,
    performerPrice,
    audiencePrice,
    image,
    bannerImage,
    tag,
    genre,
    language,
    duration,
    artistLineup,
    about,
    guidelines,
    featured,
    status,
  } = req.body;

  if (!title || !category || !date || !time || !venue || !city || !about) {
    res.status(400).json({
      error: "Missing required fields: title, category, date, time, venue, city, about",
    });
    return;
  }

  const finalSlug = (slug && String(slug).trim()) || generateSlug(title);

  try {
    const [createdEvent] = await db
      .insert(eventsTable)
      .values({
        slug: finalSlug,
        title: String(title).trim(),
        subtitle: subtitle ? String(subtitle).trim() : null,
        category: String(category).trim(),
        date: String(date).trim(),
        time: String(time).trim(),
        displayDate: displayDate ? String(displayDate).trim() : null,
        venue: String(venue).trim(),
        address: address ? String(address).trim() : null,
        city: String(city).trim(),
        price: price ? String(price).trim() : "Free",
        performerPrice: toNullableNumber(performerPrice, 0),
        audiencePrice: toNullableNumber(audiencePrice, 0),
        image: image ? String(image).trim() : "",
        bannerImage: bannerImage ? String(bannerImage).trim() : null,
        tag: tag ? String(tag).trim() : null,
        genre: genre ? String(genre).trim() : null,
        language: language ? String(language).trim() : null,
        duration: duration ? String(duration).trim() : null,
        artistLineup: toStringArray(artistLineup),
        about: String(about).trim(),
        guidelines: toStringArray(guidelines),
        featured: Boolean(featured),
        status: status ? String(status).trim() : "active",
      })
      .returning();

    res.status(201).json(createdEvent);
  } catch (err: any) {
    console.error("Error creating event:", err);
    if (err.code === "23505") {
      res.status(409).json({ error: "An event with this slug already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to create event" });
  }
});

// -----------------------------------------------------------------------------
// PATCH /api/events/:id or PUT /api/events/:id — Edit an existing event
// -----------------------------------------------------------------------------
async function updateEventHandler(req: Request, res: Response): Promise<void> {
  await ensureEventsTable();

  const rawParam = req.params.id;
  const param = String(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  const numericId = Number(param);
  const isNumeric = Number.isInteger(numericId) && numericId > 0;

  const {
    slug,
    title,
    subtitle,
    category,
    date,
    time,
    displayDate,
    venue,
    address,
    city,
    price,
    performerPrice,
    audiencePrice,
    image,
    bannerImage,
    tag,
    genre,
    language,
    duration,
    artistLineup,
    about,
    guidelines,
    featured,
    status,
  } = req.body;

  try {
    const condition = isNumeric
      ? or(eq(eventsTable.id, numericId), eq(eventsTable.slug, param))
      : eq(eventsTable.slug, param);

    const updateData: Partial<Record<string, unknown>> = {
      updatedAt: new Date(),
    };

    if (slug !== undefined) updateData.slug = String(slug).trim();
    if (title !== undefined) updateData.title = String(title).trim();
    if (subtitle !== undefined) updateData.subtitle = String(subtitle).trim();
    if (category !== undefined) updateData.category = String(category).trim();
    if (date !== undefined) updateData.date = String(date).trim();
    if (time !== undefined) updateData.time = String(time).trim();
    if (displayDate !== undefined) updateData.displayDate = String(displayDate).trim();
    if (venue !== undefined) updateData.venue = String(venue).trim();
    if (address !== undefined) updateData.address = String(address).trim();
    if (city !== undefined) updateData.city = String(city).trim();
    if (price !== undefined) updateData.price = String(price).trim();
    if (performerPrice !== undefined) updateData.performerPrice = toNullableNumber(performerPrice, 0);
    if (audiencePrice !== undefined) updateData.audiencePrice = toNullableNumber(audiencePrice, 0);
    if (image !== undefined) updateData.image = String(image).trim();
    if (bannerImage !== undefined) updateData.bannerImage = String(bannerImage).trim();
    if (tag !== undefined) updateData.tag = String(tag).trim();
    if (genre !== undefined) updateData.genre = String(genre).trim();
    if (language !== undefined) updateData.language = String(language).trim();
    if (duration !== undefined) updateData.duration = String(duration).trim();
    if (artistLineup !== undefined) updateData.artistLineup = toStringArray(artistLineup);
    if (about !== undefined) updateData.about = String(about).trim();
    if (guidelines !== undefined) updateData.guidelines = toStringArray(guidelines);
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (status !== undefined) updateData.status = String(status).trim();

    const [updatedEvent] = await db
      .update(eventsTable)
      .set(updateData)
      .where(condition)
      .returning();

    if (!updatedEvent) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json(updatedEvent);
  } catch (err: any) {
    console.error("Error updating event:", err);
    if (err.code === "23505") {
      res.status(409).json({ error: "Slug is already taken by another event" });
      return;
    }
    res.status(500).json({ error: "Failed to update event" });
  }
}

router.patch("/:id", updateEventHandler);
router.put("/:id", updateEventHandler);

// -----------------------------------------------------------------------------
// DELETE /api/events/:id — Delete an event
// -----------------------------------------------------------------------------
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await ensureEventsTable();

  const rawParam = req.params.id;
  const param = String(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  const numericId = Number(param);
  const isNumeric = Number.isInteger(numericId) && numericId > 0;

  try {
    const condition = isNumeric
      ? or(eq(eventsTable.id, numericId), eq(eventsTable.slug, param))
      : eq(eventsTable.slug, param);

    const [deleted] = await db
      .delete(eventsTable)
      .where(condition)
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json({
      success: true,
      message: "Event deleted successfully",
      deletedId: deleted.id,
      deletedSlug: deleted.slug,
    });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
