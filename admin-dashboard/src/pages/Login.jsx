import React, { useState } from "react";
import "../../src/App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://192.168.185.236:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        window.location.href = "/dashboard";
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative Background Elements */}
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>

      <div className="login-card glass">
        <div className="login-header">
          <div className="login-logo-icon">🌿</div>
          <h2 className="logo-text">Clean<span className="logo-accent">Alert</span></h2>
          <p className="login-subtitle">Admin Security Gateway</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input 
              type="email" 
              className="form-input"
              placeholder="admin@cleanalert.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Enter Dashboard"}
          </button>
        </form>
        
        <div className="login-footer">
          <p>© 2026 CleanAlert System • Secure Access Only</p>
        </div>
      </div>
    </div>
  );
}