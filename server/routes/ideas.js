const express = require("express");
const validate = require("../middleware/validate");
const { createIdeaSchema } = require("../schemas/ideaSchemas");

const router = express.Router();

// All routes here already passed requireAuth in index.js, so req.user is set.

// GET /api/ideas -> only this user's ideas
router.get("/", async (req, res) => {
  // TODO: replace with a query, e.g. Idea.find({ userId: req.user.uid })
  res.json({ ideas: [], userId: req.user.uid });
});

// POST /api/ideas -> validated input, owned by the signed-in user
router.post("/", validate(createIdeaSchema), async (req, res) => {
  const idea = {
    ...req.body,
    userId: req.user.uid, // ownership comes from the verified token, never from the client
    createdAt: new Date(),
  };
  // TODO: save `idea` to MongoDB here
  res.status(201).json({ idea });
});

module.exports = router;
