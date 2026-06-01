import { Router, Request, Response } from "express";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const router = Router();

// POST /api/partner-applications
router.post("/", async (req: Request, res: Response) => {
  const { partnerType, businessName, contactName, email, phone, city, category, description, priceRange, portfolioUrls, website } = req.body;

  if (!partnerType || !businessName || !email || !city) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO partner_applications
         (name, email, phone, type, category, city, description, website, price_range, portfolio_urls, status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',NOW())
       RETURNING *`,
      [
        businessName,
        email,
        phone ?? null,
        partnerType,
        category ?? null,
        city,
        description ?? null,
        website ?? null,
        priceRange ?? null,
        portfolioUrls ?? [],
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
  const page   = parseInt((req.query.page as string) ?? "1", 10);
  const limit  = parseInt((req.query.limit as string) ?? "20", 10);
  const offset = (page - 1) * limit;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM partner_applications ${status ? "WHERE status=$1" : ""}`,
      status ? [status] : []
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query(
      `SELECT * FROM partner_applications
       ${status ? "WHERE status=$1" : ""}
       ORDER BY submitted_at DESC NULLS LAST
       LIMIT ${status ? "$2" : "$1"} OFFSET ${status ? "$3" : "$2"}`,
      status ? [status, limit, offset] : [limit, offset]
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
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM partner_applications WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// PATCH /api/partner-applications/:id/status
router.patch("/:id/status", async (req: Request, res: Response) => {
  const { status, adminNotes, reviewedBy } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const result = await pool.query(
      `UPDATE partner_applications
       SET status=$1, admin_notes=$2, reviewed_at=NOW(), reviewed_by=$3
       WHERE id=$4 RETURNING *`,
      [status, adminNotes ?? null, reviewedBy ?? null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
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