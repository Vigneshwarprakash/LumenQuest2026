import React from "react";
import "./dashboard.css";

export default function UserDashboard() {
  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>My Dashboard</h1>
        <div className="header-actions">
          <button className="btn secondary">🔔 Notifications</button>
          <button className="btn primary">⚙️ Settings</button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="dashboard-grid">
        
        {/* Subscription Hub */}
        <div className="card subscription-card">
          <h2>Current Subscription</h2>
          <p><strong>Plan:</strong> Premium Plus</p>
          <p className="renew-date">Renews on: 25 Sep 2025</p>

          {/* Usage Meter */}
          <div className="usage">
            <p>Usage this month</p>
            <div className="progress-bar">
              <div className="progress"></div>
            </div>
            <span>60% of your plan used</span>
          </div>
        </div>

        {/* Upgrade / Downgrade / Cancel as separate cards */}
        <div className="card action-card upgrade">
          <h2>⬆ Upgrade Plan</h2>
          <p>Switch to a higher tier for more features and benefits.</p>
          <button className="btn primary">Upgrade</button>
        </div>

        <div className="card action-card downgrade">
          <h2>⬇ Downgrade Plan</h2>
          <p>Move to a lower plan that fits your lighter usage needs.</p>
          <button className="btn secondary">Downgrade</button>
        </div>

        <div className="card action-card cancel">
          <h2>❌ Cancel Subscription</h2>
          <p>Not satisfied? Cancel anytime without extra charges.</p>
          <button className="btn danger">Cancel</button>
        </div>

        {/* Recommendations */}
        <div className="card recommend-card">
          <h2>Recommended for You</h2>
          <p>
            Based on your last 3 months, the <strong>Elite Plan</strong> saves you
            <span className="highlight"> 20%</span>.
          </p>
          <button className="btn primary">View Details</button>
        </div>

        {/* Activity Feed */}
        <div className="card activity-card">
          <h2>Activity Feed</h2>
          <ul>
            <li>✅ Renewed Premium Plus Plan (Sep 2025)</li>
            <li>⬆️ Upgraded from Standard Plan (Aug 2025)</li>
            <li>📢 Received 2 promotional offers (Jul 2025)</li>
          </ul>
        </div>

        {/* Offers & Discounts */}
        <div className="card offers-card">
          <h2>🎁 Offers & Discounts</h2>
          <ul>
            <li>🎉 30% Off on Annual Upgrade (Exp: Sep 20)</li>
            <li>🔥 Holiday Bundle: Save ₹200/month</li>
            <li>💎 Exclusive Coupon: EXTRA10</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
