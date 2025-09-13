import React from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import "./MainDashboard.css";

// Pages
import SubscriptionHub from "./pages/SubscriptionHub";
import Marketplace from "./pages/Marketplace";
import Notifications from "./pages/Notifications";
import Recommendations from "./pages/Recommendations";
import Offers from "./pages/Offers";
import Profile from "./pages/Profile";
import Support from "./pages/Support";

export default function MainDashboard() {
  const location = useLocation();

  const sections = [
    { id: "subscription", name: "Subscription Hub", icon: "📊", path: "/subscription" },
    { id: "marketplace", name: "Plan Marketplace", icon: "🛒", path: "/marketplace" },
    { id: "notifications", name: "Notifications & Feed", icon: "🔔", path: "/notifications" },
    { id: "recommendations", name: "Recommendations", icon: "✨", path: "/recommendations" },
    { id: "offers", name: "Offers & Discounts", icon: "🎁", path: "/offers" },
    { id: "profile", name: "Profile & Preferences", icon: "👤", path: "/profile" },
    { id: "support", name: "Support", icon: "💬", path: "/support" },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">📌 Dashboard</h2>
        <ul className="sidebar-menu">
          {sections.map((section) => (
            <li
              key={section.id}
              className={`sidebar-item ${
                location.pathname === section.path ? "active" : ""
              }`}
            >
              <Link to={section.path} className="link">
                <span className="icon">{section.icon}</span>
                {section.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Content Area */}
      <main className="main-content">
        <Routes>
          {/* Redirect root "/" → SubscriptionHub */}
          <Route path="/" element={<Navigate to="/subscription" replace />} />

          <Route path="/subscription" element={<SubscriptionHub />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </main>
    </div>
  );
}
