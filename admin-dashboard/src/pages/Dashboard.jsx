import React, { useEffect, useState } from "react";
import { getReports, getAdminStats } from "../services/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import "../../src/App.css"; // Ensure your CSS is pasted here or in this file
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 16, { animate: true });
    }
  }, [coords, map]);
  return null;
}

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([6.5244, 3.3792]);
  const [locationInput, setLocationInput] = useState("");

  const BASE_URL = "http://192.168.185.236:5000";

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    loadData();
    fetchUsers();
  }, []);

  const loadData = async () => {
    try {
      const repRes = await getReports();
      const statRes = await getAdminStats();
      if (repRes?.success) setReports(repRes.data);
      if (statRes?.success) setStats(statRes.stats);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/reports/users`);
    const data = await res.json();
    console.log("User Data:", data); // <-- ADD THIS to see what is actually coming back
    
    // If data is already the array, use: setUsers(data);
    // If it's wrapped, use: setUsers(data.data);
    if (Array.isArray(data)) {
      setUsers(data);
    } else if (data.success && data.data) {
      setUsers(data.data);
    }
  } catch (err) { console.error(err); }
};

  const handleJumpToLocation = () => {
    const coords = locationInput.split(',').map(Number);
    if (coords.length === 2 && !isNaN(coords[0])) {
      setMapCenter(coords);
    } else {
      alert("Please enter coordinates in 'lat, lng' format");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) { console.error(err); }
  };

  const exportToCSV = () => {
    const headers = "ID,Issue,Status,Date\n";
    const rows = reports.map(r => `${r.id},${r.title},${r.status},${r.created_at}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CleanAlert_Export_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-ring">
          <div></div><div></div><div></div><div></div>
        </div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
        <div className="mobile-header-bar" style={{
        display: 'none', // Hidden by default, shown via media query below
        width: '100%',
        padding: '15px 20px',
        background: '#1a1a2e',
        color: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        zIndex: 1100
      }}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <h2 style={{ fontSize: '18px', margin: 0 }}>Clean<span className="logo-accent">Alert</span></h2>
        <div style={{ width: '24px' }}></div> {/* Spacer for centering */}
        </div>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">🌿</div>
            <div>
              <h2 className="logo-text">Clean<span className="logo-accent">Alert</span></h2>
              <p className="logo-subtext">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'reports', icon: '📋', label: 'Reports' },
            { id: 'users', icon: '👥', label: 'Users' }
          ].map(item => (
            <button
              key={item.id}
              className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activeTab === item.id && <div className="nav-indicator"></div>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer" style={{padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          <button
            className="nav-btn"
            style={{width: '100%', color: '#ff4444'}}
            onClick={() => {
              localStorage.removeItem("isAdminLoggedIn");
              window.location.href = "/login";
            }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === "dashboard" && (
          <div className="tab-container">
            <div className="content-header">
              <div>
                <h1 className="page-title">System Overview</h1>
                <p className="page-subtitle">Real-time environmental monitoring</p>
              </div>
              <div className="header-actions" style={{display: 'flex', gap: '15px'}}>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Lat, Lng"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="search-input"
                  />
                </div>
                <button onClick={exportToCSV} className="export-btn">📥 Export</button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                   <div className="stat-icon" style={{background: '#E8F5E9', color: '#2E7D32'}}>📊</div>
                   <div className="stat-badge" style={{background: '#2E7D32'}}>↗</div>
                </div>
                <h2 className="stat-value" style={{color: '#2E7D32'}}>{stats.total}</h2>
                <p className="stat-label">Total Reports</p>
                <div className="stat-progress" style={{background: '#E8F5E9'}}><div className="stat-progress-bar" style={{width: '70%', background: '#2E7D32'}}></div></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                   <div className="stat-icon" style={{background: '#E3F2FD', color: '#1976D2'}}>✅</div>
                   <div className="stat-badge" style={{background: '#1976D2'}}>↗</div>
                </div>
                <h2 className="stat-value" style={{color: '#1976D2'}}>{stats.resolved}</h2>
                <p className="stat-label">Resolved</p>
                <div className="stat-progress" style={{background: '#E3F2FD'}}><div className="stat-progress-bar" style={{width: '40%', background: '#1976D2'}}></div></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                   <div className="stat-icon" style={{background: '#FFF3E0', color: '#F57C00'}}>⏳</div>
                   <div className="stat-badge" style={{background: '#F57C00'}}>↗</div>
                </div>
                <h2 className="stat-value" style={{color: '#F57C00'}}>{stats.pending}</h2>
                <p className="stat-label">Pending</p>
                <div className="stat-progress" style={{background: '#FFF3E0'}}><div className="stat-progress-bar" style={{width: '90%', background: '#F57C00'}}></div></div>
              </div>
            </div>

            <div className="map-wrapper">
              <div className="map-header">
                <h3 className="map-title">Incident Hotspots</h3>
                <div className="map-legend">
                   <div className="legend-item"><div className="legend-dot" style={{background: '#2E7D32'}}></div>Active</div>
                </div>
              </div>
              <div className="map-container">
                <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <RecenterMap coords={mapCenter} />
                  {reports.map((report) => {
                    const coords = report.location?.split(',').map(Number);
                    if (coords?.length === 2) {
                      return (
                        <Marker key={report.id} position={coords}>
                          <Popup>
                            <strong>{report.title}</strong><br/>
                            Status: {report.status}
                          </Popup>
                        </Marker>
                      );
                    }
                    return null;
                  })}
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="tab-container">
            <h1 className="page-title">Reports</h1>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => (
                    <tr key={report.id}>
                      <td><div className="id-badge">#{report.id}</div></td>
                      <td>
                        <div className="report-title">{report.title}</div>
                        <div className="report-desc">{report.description?.substring(0, 30)}...</div>
                      </td>
                      <td><span className="status-pill" style={{background: report.status === 'resolved' ? '#4CAF50' : '#FF9800', color: '#fff'}}>{report.status}</span></td>
                      <td>
                        <div className="action-btns">
                           <button className="action-btn view" onClick={() => setSelectedReport(report)}>👁️</button>
                           <button className="action-btn delete" onClick={() => handleDelete(report.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="tab-container">
            <h1 className="page-title">Users</h1>
            <div className="users-grid">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-avatar">{user.fullname?.charAt(0)}</div>
                  <h3 className="user-name">{user.fullname}</h3>
                  <p className="user-email">{user.email}</p>
                  <div className="user-badge">ID: #{user.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedReport(null)}>✕</button>
            <div className="modal-body">
              <div className="modal-image">
                {selectedReport.image && <img src={`${BASE_URL}/uploads/${selectedReport.image}`} alt="Report" />}
              </div>
              <div className="modal-details">
                <h2 className="modal-title">{selectedReport.title}</h2>
                <div className="info-item">
                  <span className="info-label">Description</span>
                  <p className="info-value">{selectedReport.description}</p>
                </div>
                <button className="map-view-btn" onClick={() => {
                   const coords = selectedReport.location?.split(',').map(Number);
                   setMapCenter(coords);
                   setActiveTab('dashboard');
                   setSelectedReport(null);
                }}>🗺️ View on Map</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}