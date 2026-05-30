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
    GetFeaturedListingsResponse.parse({ artists, vendors, venues })
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

  res.json(ListListingsResponse.parse({ listings, total, limit, offset }));
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

  res.json(GetListingResponse.parse(listing));
});

export default router;
