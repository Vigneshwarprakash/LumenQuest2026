import React from "react";

export default function Recommendations() {
  return (
    <div>
      <h2>✨ Personalized Recommendations</h2>
      <p>Get the best plan suggestions based on your usage.</p>

      <div className="grid">
        <div className="card">💡 AI Suggestions → Save 20%</div>
        <div className="card">📈 Usage-to-Value Score</div>
        <div className="card">🎉 Seasonal Offers</div>
      </div>
    </div>
  );
}
