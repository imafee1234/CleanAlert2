import db from "../config/db.js";

export const createReport = (req, res) => {
  const { user_id, title, description, image, location } = req.body;

  const sql = `
    INSERT INTO reports (user_id, title, description, image, location)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [user_id, title, description, image, location], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Report submitted successfully" });
  });
};

export const getReports = (req, res) => {
  const sql = `
    SELECT reports.*, users.fullname 
    FROM reports 
    LEFT JOIN users ON reports.user_id = users.id
    ORDER BY reports.created_at DESC
  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

export const updateStatus = (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const sql = "UPDATE reports SET status = ? WHERE id = ?";

  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Status updated successfully" });
  });
};
const db = require("../config/db");

// SHARED: Get reports (Users see feed, Admin sees list)
exports.getAllReports = (req, res) => {
  const { status, priority } = req.query; // Admin uses these filters
  
  let sql = `
    SELECT r.*, u.fullname as reporter_name,
    (SELECT COUNT(*) FROM likes WHERE report_id = r.id) as total_likes
    FROM reports r
    JOIN users u ON r.user_id = u.id
    WHERE 1=1
  `;
  
  const params = [];
  if (status) { sql += " AND r.status = ?"; params.push(status); }
  if (priority) { sql += " AND r.priority = ?"; params.push(priority); }

  sql += " ORDER BY r.created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
};

exports.getAdminStats = (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'pending' OR status IS NULL THEN 1 ELSE 0 END) as pending
    FROM reports`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ success: false });
    
    // We send result[0] because SQL returns an array, 
    // but we want the single object inside it.
    res.json({ 
      success: true, 
      stats: result[0] 
    });
  });
};