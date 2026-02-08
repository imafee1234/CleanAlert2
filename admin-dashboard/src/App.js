import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login"; // Ensure this path is correct
import Dashboard from "./pages/Dashboard"; // Ensure this path is correct

// A helper function to check if the user is allowed in
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
  
  // If not logged in, force them to the Login page
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. THE STARTING PAGE: Set path to "/" */}
        <Route path="/" element={<Login />} />

        {/* 2. THE PROTECTED PAGE: Only accessible after login */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* 3. CATCH-ALL: Redirect any unknown URL back to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;