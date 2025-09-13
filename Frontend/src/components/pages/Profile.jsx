import React from "react";

export default function Profile() {
  return (
    <div>
      <h2>👤 Profile & Preferences</h2>
      <p>Control your preferences, billing, and renewals.</p>

      <div className="grid">
        <div className="card">⚙️ Preference Center</div>
        <div className="card">🔄 Auto-Renew Toggle</div>
        <div className="card">💳 Billing & Payment History</div>
      </div>
    </div>
  );
}
