const express = require("express");

const prisma = require("../db");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// Log de auditoria das principais acoes administrativas, restrito ao ADMIN.
router.get("/", requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const limite = Math.min(Number(req.query.limite) || 50, 200);
  const logs = await prisma.logAuditoria.findMany({
    orderBy: { criadoEm: "desc" },
    take: limite
  });
  res.json(logs);
}));

module.exports = router;
