import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
  const { fullname, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)";

  db.query(sql, [fullname, email, hashedPassword], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User registered successfully" });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;
  console.log("Login Attempt:", email); // ADD THIS LINE

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, data) => {
    if (err) return res.status(500).json({ success: false, message: "DB Error" });
    
    if (data.length === 0) {
      console.log("Email not found in DB"); // ADD THIS LINE
      return res.status(404).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = bcrypt.compareSync(password, data[0].password);
    if (!isMatch) {
      console.log("Password mismatch for:", email); // ADD THIS LINE
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Inside login function in authController.js
const token = jwt.sign({ id: data[0].id }, "secretkey");

res.json({ 
  success: true, 
  token, 
  user: {
    id: data[0].id,
    name: data[0].fullname, // DB column is fullname, frontend uses name
    email: data[0].email
  } 
});
  });
};