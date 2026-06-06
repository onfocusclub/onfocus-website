import { Router, Request, Response } from "express";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const router = Router();

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((item) => item.trim()).filter(Boolean);
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function toPortfolioItems(value: unknown) {
  if (typeof value === "string") {
    try {
      return toPortfolioItems(JSON.parse(value));
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;

      const raw = item as Record<string, unknown>;

      return {
        image: String(raw.image ?? "").trim(),
        eventName: String(raw.eventName ?? "").trim(),
        about: String(raw.about ?? "").trim(),
        genre: String(raw.genre ?? "").trim(),
        attendees: toNullableNumber(raw.attendees),
      };
    })
   .filter((item) => item && item.image && item.eventName && item.about && item.genre);
}

function firstImage(urls: string[]) {
  return urls.find((url) => /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url)) ?? urls[0] ?? "";
}

// POST /api/partner-applications
router.post("/", async (req: Request, res: Response): Promise<void> => {
 const {
  partnerType,
  businessName,
  email,
  phone,
  city,
  category,
  description,
  priceRange,
  portfolioUrls,
  website,
  yearsActive,
  eventsCompleted,
  capacity,
  tags,
  amenities,
  coverImage,
  profileImage,
  galleryUrls,
  videoUrls,
   mediaMetadata,
  portfolioItems,
} = req.body;

  if (!partnerType || !businessName || !email || !city || !category || !description) {
   res.status(400).json({ error: "Missing required fields" });
return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO partner_applications
        (
          name, email, phone, type, category, city, description, website,
          price_range, portfolio_urls, years_active, events_completed,
capacity, tags, amenities, cover_image, profile_image,
gallery_urls, video_urls, media_metadata, portfolio_items, status, submitted_at
        )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'pending',NOW())
       RETURNING *`,
      [
        businessName,
        email,
        phone ?? null,
        partnerType,
        category,
        city,
        description,
        website ?? null,
        priceRange ?? null,
        toStringArray(portfolioUrls),
        toNullableNumber(yearsActive),
        toNullableNumber(eventsCompleted),
        toNullableNumber(capacity),
        toStringArray(tags),
        toStringArray(amenities),
        coverImage ?? null,
profileImage ?? null,
toStringArray(galleryUrls),
toStringArray(videoUrls),
typeof mediaMetadata === "string" ? JSON.parse(mediaMetadata) : (mediaMetadata ?? {}),
JSON.stringify(toPortfolioItems(portfolioItems)),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting partner application:", err);
    res.status(500).json({ error: "Failed to save application" });
  }
});

// GET /api/partner-applications
router.get("/", async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const email = req.query.email as string | undefined;
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const offset = (page - 1) * limit;

  try {
    const whereParts: string[] = [];
    const queryParams: unknown[] = [];

    if (status) { whereParts.push(`status=$${queryParams.length + 1}`); queryParams.push(status); }
    if (email) { whereParts.push(`email=$${queryParams.length + 1}`); queryParams.push(email); }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM partner_applications ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query(
      `SELECT * FROM partner_applications
       ${whereClause}
       ORDER BY submitted_at DESC NULLS LAST
       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    );

    res.json({
      data: dataResult.rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// GET /api/partner-applications/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT * FROM partner_applications WHERE id = $1",
      [req.params.id]
    );
   if (result.rows.length === 0) {
  res.status(404).json({ error: "Not found" });
  return;
}
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// PATCH /api/partner-applications/:id/status
router.patch("/:id/status", async (req: Request, res: Response): Promise<void> => {
  const { status, adminNotes, reviewedBy } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
   res.status(400).json({ error: "Invalid status" });
return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE partner_applications
       SET status=$1, admin_notes=$2, reviewed_at=NOW(), reviewed_by=$3
       WHERE id=$4
       RETURNING *`,
      [status, adminNotes ?? null, reviewedBy ?? null, req.params.id]
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
     res.status(404).json({ error: "Not found" });
return;
    }

    const application = updateResult.rows[0];

    if (status === "approved") {
     const galleryUrls = toStringArray(application.gallery_urls);
const fallbackMediaUrls = toStringArray(application.portfolio_urls);
const listingImages = galleryUrls.length > 0 ? galleryUrls : fallbackMediaUrls;
const coverImage = application.cover_image ?? firstImage(listingImages);

           await client.query(
  `INSERT INTO listings
    (
      type, name, category, city, rating, review_count, bio,
      cover_image, profile_image, images, video_urls, media_metadata,
      portfolio_items, tags, verified, featured, years_active, events_completed,
      price_range, capacity, amenities, email
    )
   VALUES ($1,$2,$3,$4,4.5,0,$5,$6,$7,$8,$9,$10,$11,$12,true,false,$13,$14,$15,$16,$17,$18)
   ON CONFLICT DO NOTHING`,
  [
    application.type,
    application.name,
    application.category,
    application.city,
    application.description,
    coverImage,
    application.profile_image ?? null,
    listingImages,
    toStringArray(application.video_urls),
    application.media_metadata ?? {},
    JSON.stringify(toPortfolioItems(application.portfolio_items)),
    toStringArray(application.tags),
    application.years_active,
    application.events_completed,
    application.price_range,
    application.capacity,
    toStringArray(application.amenities),
    application.email,
  ]
);
    }

    await client.query("COMMIT");
    res.json(application);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  } finally {
    client.release();
  }
});

// PATCH /api/partner-applications/:id — edit & resubmit
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const {
    partnerType, businessName, email, phone, city, category,
    description, priceRange, portfolioUrls, website, yearsActive,
    eventsCompleted, capacity, tags, amenities, coverImage,
    profileImage, galleryUrls, videoUrls, mediaMetadata, portfolioItems,
  } = req.body;

  if (!partnerType || !businessName || !email || !city || !category || !description) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE partner_applications SET
        name=$1, email=$2, phone=$3, type=$4, category=$5, city=$6,
        description=$7, website=$8, price_range=$9, portfolio_urls=$10,
        years_active=$11, events_completed=$12, capacity=$13, tags=$14,
        amenities=$15, cover_image=$16, profile_image=$17, gallery_urls=$18,
        video_urls=$19, media_metadata=$20, portfolio_items=$21,
        status='pending', submitted_at=NOW(), admin_notes=NULL,
        reviewed_at=NULL, reviewed_by=NULL
       WHERE id=$22
       RETURNING *`,
      [
        businessName, email, phone ?? null, partnerType, category, city,
        description, website ?? null, priceRange ?? null,
        toStringArray(portfolioUrls),
        toNullableNumber(yearsActive), toNullableNumber(eventsCompleted),
        toNullableNumber(capacity), toStringArray(tags),
        toStringArray(amenities), coverImage ?? null, profileImage ?? null,
        toStringArray(galleryUrls), toStringArray(videoUrls),
        typeof mediaMetadata === "string" ? JSON.parse(mediaMetadata) : (mediaMetadata ?? {}),
        JSON.stringify(toPortfolioItems(portfolioItems)),
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).json({ error: "Failed to update application" });
  }
});

// DELETE /api/partner-applications/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM partner_applications WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete application" });
  }
});

export default router;