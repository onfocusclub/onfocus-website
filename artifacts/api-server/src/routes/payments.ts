import { Router, type Request, type Response } from "express";
import { Pool } from "pg";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, eventBookingsTable, type EventBooking } from "@workspace/db";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let isTableInitialized = false;
async function ensureEventBookingsTable(): Promise<void> {
  if (isTableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_bookings (
        id SERIAL PRIMARY KEY,
        idempotency_key TEXT NOT NULL UNIQUE,
        event_id TEXT NOT NULL,
        event_title TEXT NOT NULL,
        ticket_type TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT NOT NULL,
        city TEXT,
        performance_type TEXT,
        companion_option TEXT,
        performer_count INT NOT NULL DEFAULT 0,
        audience_count INT NOT NULL DEFAULT 0,
        amount INT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        discount_amount INT NOT NULL DEFAULT 0,
        coupon_code TEXT,
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        razorpay_signature TEXT,
        status TEXT NOT NULL DEFAULT 'created',
        ticket_code TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_event_bookings_idempotency ON event_bookings(idempotency_key);
      CREATE INDEX IF NOT EXISTS idx_event_bookings_rzp_order ON event_bookings(razorpay_order_id);
    `);
    isTableInitialized = true;
  } catch (err) {
    console.warn("Could not ensure event_bookings table:", err);
    isTableInitialized = true;
  }
}

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured on the server.");
  }

  return {
    keyId,
    keySecret,
    authHeader: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
  };
}

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// POST /api/payments/create-order
// Creates a Razorpay Order with Idempotency Key support for Performer & Audience Tickets
// -----------------------------------------------------------------------------
router.post("/create-order", async (req: Request, res: Response): Promise<void> => {
  await ensureEventBookingsTable();

  try {
    const idempotencyKey =
      (req.headers["x-idempotency-key"] || req.headers["idempotency-key"] || req.body.idempotencyKey) as string;

    if (!idempotencyKey || typeof idempotencyKey !== "string" || !idempotencyKey.trim()) {
      res.status(400).json({ error: "Idempotency key is required to create a ticket payment order." });
      return;
    }

    const {
      eventId,
      eventTitle,
      ticketType, // "Performer" | "Audience"
      customerName,
      customerEmail,
      customerPhone,
      city,
      performanceType,
      companionOption,
      performerCount = ticketType === "Performer" ? 1 : 0,
      audienceCount = 0,
      amount, // Total amount in INR
      discountAmount = 0,
      couponCode,
    } = req.body;

    if (!eventId || !eventTitle || !ticketType || !customerName || !customerPhone) {
      res.status(400).json({
        error: "Missing required booking details: eventId, eventTitle, ticketType, customerName, customerPhone are required.",
      });
      return;
    }

    const totalAmount = Math.max(0, Number(amount) || 0);

    // 1. Check existing booking with this Idempotency Key (IDEMPOTENCY CHECK)
    const existingBookings = await db
      .select()
      .from(eventBookingsTable)
      .where(eq(eventBookingsTable.idempotencyKey, idempotencyKey))
      .limit(1);

    if (existingBookings.length > 0) {
      const existing = existingBookings[0];

      // If already paid, return confirmed booking without recharging
      if (existing.status === "paid") {
        res.status(200).json({
          success: true,
          alreadyPaid: true,
          isFree: existing.amount === 0,
          ticketCode: existing.ticketCode,
          booking: existing,
          message: "Ticket is already confirmed and paid for this request.",
        });
        return;
      }

      // If order already created in Razorpay, return existing order details
      if (existing.razorpayOrderId) {
        const { keyId } = getRazorpayCredentials();
        res.status(200).json({
          success: true,
          idempotentReplay: true,
          orderId: existing.razorpayOrderId,
          amount: existing.amount * 100, // paise
          currency: existing.currency,
          key: keyId,
          ticketCode: existing.ticketCode,
          bookingId: existing.id,
        });
        return;
      }
    }

    const ticketCode = `OF-${Math.floor(100000 + Math.random() * 900000)}`;

    // 2. Handle Free Tickets / 0 Amount RSVP
    if (totalAmount === 0) {
      const [freeBooking] = await db
        .insert(eventBookingsTable)
        .values({
          idempotencyKey,
          eventId: String(eventId),
          eventTitle,
          ticketType,
          customerName,
          customerEmail: customerEmail || "",
          customerPhone,
          city: city || "",
          performanceType: performanceType || "",
          companionOption: companionOption || "",
          performerCount: Number(performerCount) || 0,
          audienceCount: Number(audienceCount) || 0,
          amount: 0,
          currency: "INR",
          discountAmount: Number(discountAmount) || 0,
          couponCode: couponCode || null,
          status: "paid", // Instantly confirmed for free entry
          ticketCode,
        })
        .returning();

      res.status(200).json({
        success: true,
        isFree: true,
        ticketCode,
        booking: freeBooking,
      });
      return;
    }

    // 3. Paid Ticket: Call Razorpay API to create Order
    const { keyId, authHeader } = getRazorpayCredentials();
    const amountInPaise = Math.round(totalAmount * 100);

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        "X-Razorpay-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: ticketCode,
        notes: {
          eventId: String(eventId),
          eventTitle: String(eventTitle).substring(0, 40),
          ticketType,
          customerName,
          customerPhone,
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errorData = (await rzpResponse.json().catch(() => ({}))) as any;
      console.error("Razorpay order creation failed:", errorData);
      res.status(rzpResponse.status).json({
        error: errorData?.error?.description || "Failed to create Razorpay payment order. Please try again.",
      });
      return;
    }

    const rzpOrder: any = await rzpResponse.json();

    // 4. Save Booking record with created Razorpay order
    const [booking] = await db
      .insert(eventBookingsTable)
      .values({
        idempotencyKey,
        eventId: String(eventId),
        eventTitle,
        ticketType,
        customerName,
        customerEmail: customerEmail || "",
        customerPhone,
        city: city || "",
        performanceType: performanceType || "",
        companionOption: companionOption || "",
        performerCount: Number(performerCount) || 0,
        audienceCount: Number(audienceCount) || 0,
        amount: totalAmount,
        currency: "INR",
        discountAmount: Number(discountAmount) || 0,
        couponCode: couponCode || null,
        razorpayOrderId: rzpOrder.id,
        status: "created",
        ticketCode,
      })
      .returning();

    res.status(200).json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency,
      key: keyId,
      ticketCode,
      bookingId: booking.id,
    });
  } catch (err: any) {
    console.error("Payment create-order error:", err);
    res.status(500).json({ error: err?.message || "Internal server error during order creation." });
  }
});

// -----------------------------------------------------------------------------
// POST /api/payments/verify-payment
// Verifies Razorpay HMAC SHA256 Signature and marks ticket as paid
// -----------------------------------------------------------------------------
router.post("/verify-payment", async (req: Request, res: Response): Promise<void> => {
  await ensureEventBookingsTable();

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, idempotencyKey, bookingId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({
        error: "Missing payment verification parameters: razorpayOrderId, razorpayPaymentId, and razorpaySignature are required.",
      });
      return;
    }

    // 1. Look up booking
    let bookingQuery = db.select().from(eventBookingsTable);
    if (bookingId) {
      bookingQuery.where(eq(eventBookingsTable.id, Number(bookingId)));
    } else if (razorpayOrderId) {
      bookingQuery.where(eq(eventBookingsTable.razorpayOrderId, razorpayOrderId));
    } else if (idempotencyKey) {
      bookingQuery.where(eq(eventBookingsTable.idempotencyKey, idempotencyKey));
    }

    const bookings = await bookingQuery.limit(1);
    if (bookings.length === 0) {
      res.status(404).json({ error: "Booking record not found for this order." });
      return;
    }

    const booking = bookings[0];

    // Idempotent verification check: if already marked paid, return success immediately
    if (booking.status === "paid" && booking.razorpayPaymentId === razorpayPaymentId) {
      res.status(200).json({
        success: true,
        verified: true,
        ticketCode: booking.ticketCode,
        booking,
        message: "Payment already verified successfully.",
      });
      return;
    }

    // 2. Cryptographic Signature Verification
    const { keySecret } = getRazorpayCredentials();
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, keySecret);

    if (!isValid) {
      await db
        .update(eventBookingsTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(eventBookingsTable.id, booking.id));

      res.status(400).json({
        error: "Payment verification failed: Invalid cryptographic signature.",
      });
      return;
    }

    // 3. Mark Booking as Paid
    const [updatedBooking] = await db
      .update(eventBookingsTable)
      .set({
        status: "paid",
        razorpayPaymentId,
        razorpaySignature,
        updatedAt: new Date(),
      })
      .where(eq(eventBookingsTable.id, booking.id))
      .returning();

    res.status(200).json({
      success: true,
      verified: true,
      ticketCode: updatedBooking.ticketCode,
      booking: updatedBooking,
    });
  } catch (err: any) {
    console.error("Payment verification error:", err);
    res.status(500).json({ error: err?.message || "Internal server error during payment verification." });
  }
});

// -----------------------------------------------------------------------------
// GET /api/payments/booking/:ticketCode
// Fetch ticket booking details
// -----------------------------------------------------------------------------
router.get("/booking/:ticketCode", async (req: Request, res: Response): Promise<void> => {
  await ensureEventBookingsTable();

  try {
    const ticketCode = String(req.params.ticketCode || "");
    const bookings = await db
      .select()
      .from(eventBookingsTable)
      .where(eq(eventBookingsTable.ticketCode, ticketCode))
      .limit(1);

    if (bookings.length === 0) {
      res.status(404).json({ error: "Ticket booking not found." });
      return;
    }

    res.status(200).json({ success: true, booking: bookings[0] });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch booking details." });
  }
});

// -----------------------------------------------------------------------------
// GET /api/payments/bookings (Admin list of all bookings)
// -----------------------------------------------------------------------------
router.get("/bookings", async (req: Request, res: Response): Promise<void> => {
  await ensureEventBookingsTable();

  try {
    const bookings = await db
      .select()
      .from(eventBookingsTable)
      .orderBy(eventBookingsTable.createdAt);

    res.status(200).json({ success: true, bookings });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch bookings list." });
  }
});

export default router;
