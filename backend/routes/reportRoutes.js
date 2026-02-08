import express from "express";
import multer from "multer";
import db from "../config/db.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// ==========================================
// 1. FIXED & SPECIAL ADMIN ROUTES
// ==========================================

// Get Admin Stats
router.get("/admin/stats", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'pending' OR status IS NULL THEN 1 ELSE 0 END) as pending
    FROM reports`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, stats: result[0] || { total: 0, resolved: 0, pending: 0 } });
  });
});

// Get User List (Moved UP so it's not caught by /:id)
router.get("/users", (req, res) => {
  db.query("SELECT id, fullname, email, created_at FROM users ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: result });
  });
});

// Get Leaderboard
router.get("/leaderboard", (req, res) => {
  const sql = `
    SELECT u.fullname as name, COUNT(r.id) as count 
    FROM users u 
    JOIN reports r ON u.id = r.user_id 
    GROUP BY u.id 
    ORDER BY count DESC 
    LIMIT 5`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: result });
  });
});

// ==========================================
// 2. REPORT CRUD OPERATIONS
// ==========================================

// GET All Reports (Used by Dashboard)
router.get("/", (req, res) => {
  const sql = `
    SELECT r.*, 
    (SELECT COUNT(*) FROM likes WHERE report_id = r.id) as likeCount
    FROM reports r 
    ORDER BY created_at DESC`;
    
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: result });
  });
});

// GET Specific User Reports
router.get("/user/:userId", (req, res) => {
  const userId = req.params.userId;
  db.query("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: result });
  });
});

// POST New Report
router.post("/", upload.single("image"), (req, res) => {
  const { title, description, location, user_id } = req.body;
  const image = req.file?.filename;
  if (!user_id) return res.status(400).json({ success: false, message: "Missing user_id" });

  const sql = "INSERT INTO reports (title, description, location, image, user_id, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', NOW())";
  db.query(sql, [title, description, location, image, user_id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Report submitted" });
  });
});

// PUT Resolve Report
router.put("/resolve/:id", (req, res) => {
  const { id } = req.params;
  const { admin_message } = req.body;
  const sql = "UPDATE reports SET status = 'resolved', admin_notes = ?, resolved_at = NOW() WHERE id = ?";
  db.query(sql, [admin_message, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Report resolved" });
  });
});

// DELETE Report (Moved to BOTTOM to avoid hijacking other routes)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM reports WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Report deleted" });
  });
});

export default router;