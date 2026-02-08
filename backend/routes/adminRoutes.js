import db from "../config/db.js";
import express from "express";
const router = express.Router();
// Admin resolves a report and leaves a message for the user
router.put("/resolve/:id", (req, res) => {
  const { id } = req.params;
  const { admin_message } = req.body; // e.g., "Trash collected by City Zone A"

  const sql = `
    UPDATE reports 
    SET status = 'resolved', 
        admin_notes = ?, 
        resolved_at = NOW() 
    WHERE id = ?`;

  db.query(sql, [admin_message, id], (err, result) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, message: "User notified and status updated!" });
  });
});

// --- AUTHENTICATION (Add to your reportRoutes.js) ---
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  // In a real app, use bcrypt to compare hashed passwords!
  const sql = "SELECT * FROM admins WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err || result.length === 0) return res.status(401).json({ success: false });
    res.json({ success: true, admin: result[0] });
  });
});

// --- EXPORT DATA ROUTE ---
router.get("/export", (req, res) => {
  const sql = "SELECT id, title, location, status, created_at FROM reports";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result); 
  });
});

// GET Admin Stats - This is what the dashboard needs!
router.get("/stats", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'pending' OR status IS NULL OR status = '' THEN 1 ELSE 0 END) as pending
    FROM reports`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Stats Error:", err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
    // Result[0] contains the counts. If no reports exist, default to 0.
    const stats = result[0] || { total: 0, resolved: 0, pending: 0 };
    res.json({ success: true, stats: stats });
  });
});

export default router;