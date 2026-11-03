import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { makeIdea, makeVisual } from "./gemini.js";
import { buildIdeaPrompt, buildVisualPrompt, STYLES } from "./prompts.js";
import { db, FieldValue } from "./firebase.js";
import { uploadImage } from "./cloud.js";

const app = express();
const PORT = process.env.PORT || 5000;
const origins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.set("trust proxy", 1);
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "15mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp)$/.test(file.mimetype);
    cb(ok ? null : new Error("Please upload a JPG, PNG or WebP photo"), ok);
  },
});

// Protect the Gemini quota: 15 AI calls per minute per IP
const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Wait a minute and try again." },
});

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const needDb = (req, res, next) =>
  db
    ? next()
    : res.status(503).json({
        error: "Gallery is not set up yet (Firebase credentials missing)",
      });

const clean = (s, max) =>
  String(s || "")
    .trim()
    .slice(0, max);
const pickStyle = (s) => (STYLES[s] ? s : "boho");
const pickMode = (m) => (m === "space" ? "space" : "object");

app.get("/api/health", (req, res) =>
  res.json({ ok: true, gallery: Boolean(db) })
);

// 1) Idea (fast) -----------------------------------------------------------
app.post(
  "/api/idea",
  aiLimiter,
  upload.single("image"),
  wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Please add a photo" });
    const budget = Math.min(20000, Math.max(0, Number(req.body.budget) || 0));
    const prompt = buildIdeaPrompt({
      mode: pickMode(req.body.mode),
      context: clean(req.body.context, 300),
      style: pickStyle(req.body.style),
      budget,
      lang: ["en", "ur", "roman"].includes(req.body.lang)
        ? req.body.lang
        : "en",
      avoid: clean(req.body.avoid, 100),
    });
    const idea = await makeIdea({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      prompt,
    });
    res.json({ idea });
  })
);

// 2) Picture of the finished result (slower) ---------------------------------
app.post(
  "/api/visualize",
  aiLimiter,
  upload.single("image"),
  wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Please add a photo" });
    const visualPrompt = clean(req.body.visualPrompt, 1500);
    if (!visualPrompt)
      return res
        .status(400)
        .json({ error: "Missing description of the result" });
    const prompt = buildVisualPrompt({
      visualPrompt,
      mode: pickMode(req.body.mode),
      style: pickStyle(req.body.style),
    });
    const image = await makeVisual({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      prompt,
    });
    res.json({ image });
  })
);

// 3) Gallery (Firestore) -----------------------------------------------------
const toJson = (doc, hideOwner) => {
  const d = doc.data();
  const out = { id: doc.id, ...d, createdAt: d.createdAt?.toMillis?.() ?? 0 };
  if (hideOwner) delete out.clientId;
  return out;
};

app.post(
  "/api/gallery",
  needDb,
  wrap(async (req, res) => {
    const { clientId, idea, imageDataUrl, originalDataUrl, isPublic } =
      req.body || {};
    if (!clientId || typeof clientId !== "string")
      return res.status(400).json({ error: "Missing clientId" });
    if (!idea || typeof idea !== "object" || !String(idea.title || "").trim())
      return res.status(400).json({ error: "Missing idea" });
    if (!String(imageDataUrl || "").startsWith("data:image/"))
      return res.status(400).json({ error: "Missing result picture" });

    const [imageUrl, originalUrl] = await Promise.all([
      uploadImage(imageDataUrl),
      String(originalDataUrl || "").startsWith("data:image/")
        ? uploadImage(originalDataUrl)
        : null,
    ]);

    const safeIdea = {
      title: clean(idea.title, 120),
      summary: clean(idea.summary, 600),
      difficulty: clean(idea.difficulty, 20),
      timeMinutes: Number(idea.timeMinutes) || 0,
      estimatedCostPKR: Number(idea.estimatedCostPKR) || 0,
      haveMaterials: (idea.haveMaterials || [])
        .slice(0, 15)
        .map((s) => clean(s, 120)),
      toBuy: (idea.toBuy || []).slice(0, 15).map((b) => ({
        item: clean(b.item, 120),
        pricePKR: Number(b.pricePKR) || 0,
      })),
      steps: (idea.steps || []).slice(0, 12).map((s) => clean(s, 400)),
      tip: clean(idea.tip, 400),
    };

    const ref = await db.collection("creations").add({
      clientId: clean(clientId, 80),
      idea: safeIdea,
      imageUrl,
      originalUrl,
      public: Boolean(isPublic),
      madeCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.status(201).json({ id: ref.id, imageUrl });
  })
);

app.get(
  "/api/gallery",
  needDb,
  wrap(async (req, res) => {
    const clientId = clean(req.query.clientId, 80);
    if (!clientId) return res.status(400).json({ error: "Missing clientId" });
    const snap = await db
      .collection("creations")
      .where("clientId", "==", clientId)
      .limit(100)
      .get();
    const items = snap.docs
      .map((d) => toJson(d, false))
      .sort((a, b) => b.createdAt - a.createdAt);
    res.json({ items });
  })
);

app.get(
  "/api/community",
  needDb,
  wrap(async (req, res) => {
    const snap = await db
      .collection("creations")
      .where("public", "==", true)
      .limit(100)
      .get();
    const items = snap.docs
      .map((d) => toJson(d, true))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 60);
    res.json({ items });
  })
);

app.post(
  "/api/gallery/:id/made",
  needDb,
  wrap(async (req, res) => {
    const ref = db.collection("creations").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists || !doc.data().public)
      return res.status(404).json({ error: "Not found" });
    await ref.update({ madeCount: FieldValue.increment(1) });
    res.json({ madeCount: (doc.data().madeCount || 0) + 1 });
  })
);

app.delete(
  "/api/gallery/:id",
  needDb,
  wrap(async (req, res) => {
    const ref = db.collection("creations").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "Not found" });
    if (doc.data().clientId !== clean(req.query.clientId, 80))
      return res.status(403).json({ error: "Not yours to delete" });
    await ref.delete();
    res.json({ ok: true });
  })
);

// Errors ---------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error(err);
  let status =
    err instanceof multer.MulterError || /Please upload/.test(err.message)
      ? 400
      : 500;
  let message = err.message || "Something went wrong";
  if (err.code === "LIMIT_FILE_SIZE") message = "Photo is too big (max 8 MB)";
  if (err.status === 429 || /quota|RESOURCE_EXHAUSTED/i.test(message)) {
    status = 429;
    message =
      "The AI is busy or the free quota is used up. Try again in a minute.";
  }
  if (status === 500 && /API key|API_KEY/i.test(message))
    message = "AI key problem on the server. Check GEMINI_API_KEY.";
  res.status(status).json({ error: message });
});

app.listen(PORT, () =>
  console.log(`Scrapture API on http://localhost:${PORT}`)
);
