import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventBookingsTable = pgTable("event_bookings", {
  id: serial("id").primaryKey(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  eventId: text("event_id").notNull(),
  eventTitle: text("event_title").notNull(),
  ticketType: text("ticket_type").notNull(), // "Performer" | "Audience"
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  city: text("city"),
  performanceType: text("performance_type"),
  companionOption: text("companion_option"),
  performerCount: integer("performer_count").notNull().default(0),
  audienceCount: integer("audience_count").notNull().default(0),
  amount: integer("amount").notNull(), // Total amount in INR
  currency: text("currency").notNull().default("INR"),
  discountAmount: integer("discount_amount").notNull().default(0),
  couponCode: text("coupon_code"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  status: text("status").notNull().default("created"), // "created" | "paid" | "failed"
  ticketCode: text("ticket_code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(eventBookingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type EventBooking = typeof eventBookingsTable.$inferSelect;
