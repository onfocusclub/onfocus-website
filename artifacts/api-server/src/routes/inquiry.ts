import { Router, type IRouter } from "express";
import { db, inquiriesTable, partnerApplicationsTable } from "@workspace/db";
import { SubmitInquiryBody, SubmitPartnerApplicationBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/inquiry", async (req, res): Promise<void> => {
  const parsed = SubmitInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(inquiriesTable).values(parsed.data);

  res.status(201).json({
    success: true,
    message: "Your message has been received. We'll be in touch shortly.",
  });
});

router.post("/partner-applications", async (req, res): Promise<void> => {
  const parsed = SubmitPartnerApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(partnerApplicationsTable).values(parsed.data);

  res.status(201).json({
    success: true,
    message: "Application received! Our team will review your profile and reach out within 3-5 business days.",
  });
});

export default router;
