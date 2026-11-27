import { Router, Request, Response } from "express";
import { Pool } from "pg";
import { eq, or, sql, asc } from "drizzle-orm";
import { db, eventCategoriesTable, eventsTable, type EventCategory } from "@workspace/db";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DEFAULT_CATEGORIES = [
  {
    name: "Music",
    slug: "music",
    description: "Live gigs, concerts, acoustic sets & indie performances",
    icon: "music",
    displayOrder: 1,
  },
  {
    name: "Comedy",
    slug: "comedy",
    description: "Standup comedy, open mics, roast & improv showcases",
    icon: "smile",
    displayOrder: 2,
  },
  {
    name: "Workshop",
    slug: "workshop",
    description: "Hands-on creative workshops, masterclasses & art sessions",
    icon: "palette",
    displayOrder: 3,
  },
  {
    name: "Theatre",
    slug: "theatre",
    description: "Stage plays, drama, storytelling & musicals",
    icon: "theater",
    displayOrder: 4,
  },
  {
    name: "Open Mic",
    slug: "open-mic",
    description: "Poetry, spoken word, storytelling & open stage sessions",
    icon: "mic",
    displayOrder: 5,
  },
  {
    name: "Exhibition",
    slug: "exhibition",
    description: "Art exhibitions, gallery showcases & design popups",
    icon: "image",
    displayOrder: 6,
  },
  {
    name: "Dance",
    slug: "dance",
    description: "Dance showcases, street battles, choreography & socials",
    icon: "activity",
    displayOrder: 7,
  },
  {
    name: "Meetup",
    slug: "meetup",
    description: "Community gatherings, creator mixers & networking",
    icon: "users",
    displayOrder: 8,
  },
];

let isTableInitialized = false;
async function ensureEventCategoriesTable(): Promise<void> {
  if (isTableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT,
        display_order INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    isTableInitialized = true;
  } catch (err) {
    console.warn("Could not auto-initialize event_categories table via pool:", err);
    isTableInitialized = true;
  }
}

// -----------------------------------------------------------------------------
// GET /api/event-categories — List all categories
// -----------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response): Promise<void> => {
  await ensureEventCategoriesTable();
  const includeInactive = req.query.all === "true" || req.query.includeInactive === "true";

  try {
    const query = db
      .select({
        id: eventCategoriesTable.id,
        name: eventCategoriesTable.name,
        slug: eventCategoriesTable.slug,
        description: eventCategoriesTable.description,
        icon: eventCategoriesTable.icon,
        displayOrder: eventCategoriesTable.displayOrder,
        isActive: eventCategoriesTable.isActive,
        createdAt: eventCategoriesTable.createdAt,
        updatedAt: eventCategoriesTable.updatedAt,
      })
      .from(eventCategoriesTable);

    if (!includeInactive) {
      query.where(eq(eventCategoriesTable.isActive, true));
    }

    query.orderBy(asc(eventCategoriesTable.displayOrder), asc(eventCategoriesTable.name));

    const categories = await query;

    // Attach event count per category for admin overview
    let countMap: Record<string, number> = {};
    try {
      const counts = await pool.query(
        "SELECT category, COUNT(*) as count FROM events GROUP BY category"
      );
      for (const row of counts.rows) {
        if (row.category) {
          countMap[row.category.toLowerCase()] = parseInt(row.count, 10);
        }
      }
    } catch {
      // ignore
    }

    const categoriesWithCount = categories.map((c) => ({
      ...c,
      eventsCount: countMap[c.name.toLowerCase()] || 0,
    }));

    res.json({ categories: categoriesWithCount });
  } catch (err) {
    console.error("Error fetching event categories:", err);
    res.status(500).json({ error: "Failed to fetch event categories" });
  }
});

// -----------------------------------------------------------------------------
// GET /api/event-categories/:id — Get category by ID or slug
// -----------------------------------------------------------------------------
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await ensureEventCategoriesTable();
  const rawParam = req.params.id;
  const param = String(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  const numericId = Number(param);
  const isNumeric = Number.isInteger(numericId) && numericId > 0;

  try {
    const condition = isNumeric
      ? or(eq(eventCategoriesTable.id, numericId), eq(eventCategoriesTable.slug, param))
      : eq(eventCategoriesTable.slug, param);

    const [category] = await db
      .select()
      .from(eventCategoriesTable)
      .where(condition)
      .limit(1);

    if (!category) {
      res.status(404).json({ error: "Event category not found" });
      return;
    }

    res.json(category);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ error: "Failed to fetch event category" });
  }
});

// -----------------------------------------------------------------------------
// POST /api/event-categories — Create a new category
// -----------------------------------------------------------------------------
router.post("/", async (req: Request, res: Response): Promise<void> => {
  await ensureEventCategoriesTable();
  const { name, slug, description, icon, displayOrder, isActive } = req.body;

  if (!name || !String(name).trim()) {
    res.status(400).json({ error: "Category name is required" });
    return;
  }

  const cleanName = String(name).trim();
  const finalSlug = (slug && String(slug).trim()) ? generateSlug(String(slug)) : generateSlug(cleanName);

  try {
    const [created] = await db
      .insert(eventCategoriesTable)
      .values({
        name: cleanName,
        slug: finalSlug,
        description: description ? String(description).trim() : null,
        icon: icon ? String(icon).trim() : null,
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .returning();

    res.status(201).json(created);
  } catch (err: any) {
    console.error("Error creating category:", err);
    if (err.code === "23505") {
      res.status(409).json({ error: "A category with this name or slug already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to create category" });
  }
});

// -----------------------------------------------------------------------------
// PATCH /api/event-categories/:id or PUT — Edit an existing category
// -----------------------------------------------------------------------------
async function updateCategoryHandler(req: Request, res: Response): Promise<void> {
  await ensureEventCategoriesTable();
  const rawParam = req.params.id;
  const param = String(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  const numericId = Number(param);
  const isNumeric = Number.isInteger(numericId) && numericId > 0;

  const { name, slug, description, icon, displayOrder, isActive } = req.body;

  try {
    const condition = isNumeric
      ? or(eq(eventCategoriesTable.id, numericId), eq(eventCategoriesTable.slug, param))
      : eq(eventCategoriesTable.slug, param);

    // Get current category
    const [existing] = await db.select().from(eventCategoriesTable).where(condition).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const updateData: Partial<Record<string, unknown>> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = String(name).trim();
    if (slug !== undefined) updateData.slug = generateSlug(String(slug));
    if (description !== undefined) updateData.description = String(description).trim();
    if (icon !== undefined) updateData.icon = String(icon).trim();
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const [updated] = await db
      .update(eventCategoriesTable)
      .set(updateData)
      .where(eq(eventCategoriesTable.id, existing.id))
      .returning();

    // If name changed, optionally update existing events that had the old category name
    if (name && String(name).trim() !== existing.name) {
      await db
        .update(eventsTable)
        .set({ category: String(name).trim() })
        .where(eq(eventsTable.category, existing.name));
    }

    res.json(updated);
  } catch (err: any) {
    console.error("Error updating category:", err);
    if (err.code === "23505") {
      res.status(409).json({ error: "Category name or slug already in use" });
      return;
    }
    res.status(500).json({ error: "Failed to update category" });
  }
}

router.patch("/:id", updateCategoryHandler);
router.put("/:id", updateCategoryHandler);

// -----------------------------------------------------------------------------
// DELETE /api/event-categories/:id — Delete a category
// -----------------------------------------------------------------------------
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await ensureEventCategoriesTable();
  const rawParam = req.params.id;
  const param = String(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  const numericId = Number(param);
  const isNumeric = Number.isInteger(numericId) && numericId > 0;

  try {
    const condition = isNumeric
      ? or(eq(eventCategoriesTable.id, numericId), eq(eventCategoriesTable.slug, param))
      : eq(eventCategoriesTable.slug, param);

    const [existing] = await db.select().from(eventCategoriesTable).where(condition).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    // Delete category
    await db.delete(eventCategoriesTable).where(eq(eventCategoriesTable.id, existing.id));

    res.json({
      success: true,
      deleted: true,
      id: existing.id,
      name: existing.name,
      message: `Category "${existing.name}" deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
