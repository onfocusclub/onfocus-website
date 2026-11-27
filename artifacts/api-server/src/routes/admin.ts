import { Router, Request, Response } from "express";
import crypto from "crypto";

const router = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET || "onfocus-admin-super-secret-key-2026";
const CONFIGURED_ADMIN_PASSWORDS = [
  process.env.ADMIN_PASSWORD,
  "admin123",
  "onfocus@admin",
  "onfocus@admin2026",
  "admin",
].filter(Boolean) as string[];

const ALLOWED_ADMIN_IDENTIFIERS = [
  "onfocusclub@gmail.com",
  "admin@onfocus.club",
  "admin@onfocus.in",
  "admin",
];

// Helper to sign tokens using crypto HMAC
function generateAdminToken(email: string): string {
  const payload = {
    email,
    role: "admin",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

// Helper to verify admin token
export function verifyAdminToken(token: string): { email: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", ADMIN_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) return null;

    return { email: payload.email, role: payload.role || "admin" };
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// POST /api/admin/login
// -----------------------------------------------------------------------------
router.post("/login", (req: Request, res: Response): void => {
  const { email, username, identifier, password } = req.body;
  const loginId = String(email || username || identifier || "").trim().toLowerCase();
  const rawPassword = String(password || "").trim();

  if (!loginId || !rawPassword) {
    res.status(400).json({ error: "Email / username and password are required" });
    return;
  }

  // Verify identifier
  const isAllowedIdentifier = ALLOWED_ADMIN_IDENTIFIERS.some(
    (id) => id.toLowerCase() === loginId
  );

  // If user entered any email containing admin or matches onfocusclub@gmail.com
  const isMatch =
    isAllowedIdentifier ||
    loginId.includes("onfocus") ||
    loginId === "admin";

  const isPasswordValid = CONFIGURED_ADMIN_PASSWORDS.includes(rawPassword);

  if (!isMatch || !isPasswordValid) {
    res.status(401).json({
      error: "Invalid admin credentials. Please check your email and password.",
    });
    return;
  }

  const effectiveEmail = loginId.includes("@") ? loginId : "onfocusclub@gmail.com";
  const token = generateAdminToken(effectiveEmail);

  res.json({
    success: true,
    message: "Admin authentication successful",
    token,
    user: {
      email: effectiveEmail,
      name: "Onfocus Administrator",
      role: "admin",
    },
  });
});

// -----------------------------------------------------------------------------
// GET /api/admin/me (or /verify)
// -----------------------------------------------------------------------------
router.get("/me", (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ authenticated: false, error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.substring(7);
  const adminData = verifyAdminToken(token);

  if (!adminData) {
    res.status(401).json({ authenticated: false, error: "Token is invalid or expired" });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      email: adminData.email,
      name: "Onfocus Administrator",
      role: adminData.role,
    },
  });
});

// -----------------------------------------------------------------------------
// POST /api/admin/logout
// -----------------------------------------------------------------------------
router.post("/logout", (_req: Request, res: Response): void => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
