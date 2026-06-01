/**
 * artifacts/api-server/src/routes/partnerApplications.ts
 *
 * Express router for partner application CRUD.
 * Handles: submit, list, get by id, approve, reject, delete.
 *
 * Mount in your main server file:
 *   import partnerApplicationsRouter from "./routes/partnerApplications";
 *   app.use("/api/partner-applications", partnerApplicationsRouter);
 *
 * DB: uses the existing Neon PostgreSQL connection (pool/db from your db module).
 * Assumes you create the table with the migration at the bottom of this file.
 */

import { Router, Request, Response } from "express";
import { Pool } from "pg";

// Reuse the existing pool — adjust this import path to match your project
// e.g.  import { pool } from "../db";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const router = Router();

// ─── Types ────────────────────────────────────────────────────────────────────
type ApplicationStatus = "pending" | "approved" | "rejected";

interface PartnerApplication {
  id: number;
  partner_type: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  city: string;
  description: string | null;
  price_range: string | null;
  portfolio_urls: string[];
  status: ApplicationStatus;
  admin_notes: string | null;
  submitted_at: Date;
  reviewed_at: Date | null;
  reviewed_by: string | null;
}

// ─── POST /api/partner-applications ──────────────────────────────────────────
// Called by the Join.tsx form on submission
router.post("/", async (req: Request, res: Response) => {
  const {
    partnerType,
    businessName,
    contactName,
    email,
    phone,
    city,
    description,
    priceRange,
    portfolioUrls,
  } = req.body;

  if (!partnerType || !businessName || !contactName || !email || !city) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query<PartnerApplication>(
      `INSERT INTO partner_applications
         (partner_type, business_name, contact_name, email, phone,
          city, description, price_range, portfolio_urls, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending')
       RETURNING *`,
      [
        partnerType,
        businessName,
        contactName,
        email,
        phone ?? null,
        city,
        description ?? null,
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

// ─── GET /api/partner-applications ───────────────────────────────────────────
// Admin: list all applications, with optional ?status= filter & pagination
router.get("/", async (req: Request, res: Response) => {
  const status = req.query.status as ApplicationStatus | undefined;
  const page   = parseInt((req.query.page as string) ?? "1", 10);
  const limit  = parseInt((req.query.limit as string) ?? "20", 10);
  const offset = (page - 1) * limit;

  try {
    const where  = status ? "WHERE status = $1" : "";
    const params = status ? [status, limit, offset] : [limit, offset];
    const statusIdx = status ? "$1" : null; // only used in WHERE

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM partner_applications ${status ? "WHERE status=$1" : ""}`,
      status ? [status] : []
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query<PartnerApplication>(
      `SELECT * FROM partner_applications
       ${status ? "WHERE status=$1" : ""}
       ORDER BY submitted_at DESC
       LIMIT ${status ? "$2" : "$1"} OFFSET ${status ? "$3" : "$2"}`,
      params
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

// ─── GET /api/partner-applications/:id ───────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query<PartnerApplication>(
      "SELECT * FROM partner_applications WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// ─── PATCH /api/partner-applications/:id/status ──────────────────────────────
// Admin: approve or reject
router.patch("/:id/status", async (req: Request, res: Response) => {
  const { status, adminNotes, reviewedBy } = req.body as {
    status: ApplicationStatus;
    adminNotes?: string;
    reviewedBy?: string;
  };

  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const result = await pool.query<PartnerApplication>(
      `UPDATE partner_applications
       SET status=$1, admin_notes=$2, reviewed_at=NOW(), reviewed_by=$3
       WHERE id=$4
       RETURNING *`,
      [status, adminNotes ?? null, reviewedBy ?? null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ─── DELETE /api/partner-applications/:id ────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM partner_applications WHERE id=$1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete application" });
  }
});

export default router;

