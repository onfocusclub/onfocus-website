import { Router, type IRouter } from "express";
import { eq, and, ilike, sql } from "drizzle-orm";
import { db, listingsTable } from "@workspace/db";
import {
  ListListingsQueryParams,
  CreateListingBody,
  GetListingParams,
  GetListingResponse,
  ListListingsResponse,
  GetFeaturedListingsResponse,
  GetPlatformStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
function normalizeListing<T extends { portfolioItems?: unknown }>(listing: T) {
  return {
    ...listing,
    portfolioItems: Array.isArray(listing.portfolioItems) ? listing.portfolioItems : [],
  };
}

router.get("/listings/featured", async (_req, res): Promise<void> => {
  const artists = await db
    .select()
    .from(listingsTable)
    .where(and(eq(listingsTable.type, "artist"), eq(listingsTable.featured, true)))
    .limit(4);

  const vendors = await db
    .select()
    .from(listingsTable)
    .where(and(eq(listingsTable.type, "vendor"), eq(listingsTable.featured, true)))
    .limit(4);

  const venues = await db
    .select()
    .from(listingsTable)
    .where(and(eq(listingsTable.type, "venue"), eq(listingsTable.featured, true)))
    .limit(4);

  res.json(
    GetFeaturedListingsResponse.parse({
  artists: artists.map(normalizeListing),
  vendors: vendors.map(normalizeListing),
  venues: venues.map(normalizeListing),
})
  );
});

router.get("/listings/stats", async (_req, res): Promise<void> => {
  const [{ count: totalProfessionals }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(listingsTable);

  const [{ count: verifiedProfiles }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(listingsTable)
    .where(eq(listingsTable.verified, true));

  res.json(
    GetPlatformStatsResponse.parse({
      totalProfessionals: Math.max(totalProfessionals, 500),
      eventsSupported: 1000,
      citiesCovered: 50,
      verifiedProfiles: Math.max(verifiedProfiles, 400),
    })
  );
});

router.get("/listings", async (req, res): Promise<void> => {
  // Email filter — bypass Drizzle for this
  const emailFilter = req.query.email as string | undefined;
  if (emailFilter) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query(
      `SELECT * FROM listings WHERE email = $1 LIMIT 5`,
      [emailFilter]
    );
    await pool.end();
    res.json({
      listings: result.rows.map(row => ({
        ...row,
        portfolioItems: Array.isArray(row.portfolio_items) ? row.portfolio_items : [],
        coverImage: row.cover_image,
        profileImage: row.profile_image,
        reviewCount: row.review_count,
        yearsActive: row.years_active,
        eventsCompleted: row.events_completed,
        priceRange: row.price_range,
        videoUrls: row.video_urls ?? [],
        mediaMetadata: row.media_metadata ?? {},
      })),
      total: result.rows.length,
      limit: 5,
      offset: 0,
    });
    return;
  }

  const query = ListListingsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { type, category, city, search, featured, limit = 12, offset = 0 } = query.data;

  const conditions = [];
  if (type) conditions.push(eq(listingsTable.type, type));
  if (category) conditions.push(ilike(listingsTable.category, `%${category}%`));
  if (city) conditions.push(ilike(listingsTable.city, `%${city}%`));
  if (featured !== undefined) conditions.push(eq(listingsTable.featured, featured));
  if (search) {
    conditions.push(
      sql`(${listingsTable.name} ilike ${"%" + search + "%"} or ${listingsTable.bio} ilike ${"%" + search + "%"})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const listings = await db
    .select()
    .from(listingsTable)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(listingsTable.featured, listingsTable.rating);

  const [{ count: total }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(listingsTable)
    .where(whereClause);

 res.json(ListListingsResponse.parse({
  listings: listings.map(normalizeListing),
  total,
  limit,
  offset,
}));
});

router.post("/listings", async (req, res): Promise<void> => {
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [listing] = await db
    .insert(listingsTable)
    .values({
      ...parsed.data,
      coverImage: "",
      images: [],
      tags: parsed.data.tags ?? [],
      verified: false,
      featured: false,
    })
    .returning();

  res.status(201).json(GetListingResponse.parse(listing));
});

router.patch("/listings/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

 const { name, bio, priceRange, yearsActive, eventsCompleted, capacity, tags, amenities, coverImage, profileImage, images, portfolioItems } = req.body;

  const [updated] = await db
    .update(listingsTable)
    .set({
      ...(bio !== undefined && { bio }),
      ...(priceRange !== undefined && { priceRange }),
      ...(yearsActive !== undefined && { yearsActive }),
      ...(eventsCompleted !== undefined && { eventsCompleted }),
      ...(capacity !== undefined && { capacity }),
      ...(tags !== undefined && { tags }),
      ...(amenities !== undefined && { amenities }),
      ...(name !== undefined && { name }),
      ...(coverImage !== undefined && { coverImage }),
      ...(profileImage !== undefined && { profileImage }),
      ...(images !== undefined && { images }),
      ...(portfolioItems !== undefined && { portfolioItems: JSON.stringify(portfolioItems) }),
    })
    .where(eq(listingsTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(normalizeListing(updated));
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetListingParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, params.data.id));

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  res.json(GetListingResponse.parse(normalizeListing(listing)));
});

export default router;
