import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const plans = [
    { id: 1, name: "Basic Plan", price: 499, discount: "10% OFF", speed: 50, description: "Perfect for browsing and social media.", details: "Includes unlimited browsing, 24/7 support, optional router." },
    { id: 2, name: "Standard Plan", price: 799, discount: "15% OFF", speed: 100, description: "Ideal for streaming and online classes.", details: "Supports multiple devices, HD streaming, router included." },
    { id: 3, name: "Premium Plan", price: 1299, discount: "20% OFF", speed: 200, description: "Great for gaming and 4K streaming.", details: "Ultra-fast speeds, low latency, priority support, free router." },
    { id: 4, name: "Ultra Plan", price: 1999, discount: "25% OFF", speed: 500, description: "For heavy streaming, smart homes, and multiple users.", details: "Supports multiple 4K streams, smart home devices, premium support." },
    { id: 5, name: "Family Plan", price: 1499, discount: "18% OFF", speed: 250, description: "Perfect for households with multiple users.", details: "Parental controls, free router, 24/7 support, multiple devices." },
    { id: 6, name: "Pro Gamer Plan", price: 2499, discount: "30% OFF", speed: 1000, description: "Ultimate speed for gaming and streaming.", details: "Optimized for low-latency online gaming, ultra HD streaming." },
    { id: 7, name: "Business Plan", price: 3499, discount: "35% OFF", speed: 2000, description: "Ideal for offices and remote teams.", details: "Supports cloud apps, video conferencing, secure networking." },
  ];

  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [filterSpeed, setFilterSpeed] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const navigate = useNavigate();

  const toggleDetails = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubscribe = (planName) => {
    navigate("/dashboard/payment", { state: { plan: plans.find(p => p.name === planName) } });
  };

  const filteredPlans = plans.filter((plan) => {
    const matchSearch = plan.name.toLowerCase().includes(search.toLowerCase());
    const matchSpeed =
      filterSpeed === "all" || plan.speed <= parseInt(filterSpeed);
    const matchPrice =
      filterPrice === "all" || plan.price <= parseInt(filterPrice);
    return matchSearch && matchSpeed && matchPrice;
  });

  return (
    <div className="dashboard">
      <h1>Broadband Subscription Plans</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by plan name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filterSpeed}
          onChange={(e) => setFilterSpeed(e.target.value)}
        >
          <option value="all">All Speeds</option>
          <option value="100">≤ 100 Mbps</option>
          <option value="250">≤ 250 Mbps</option>
          <option value="500">≤ 500 Mbps</option>
          <option value="1000">≤ 1 Gbps</option>
          <option value="2000">≤ 2 Gbps</option>
        </select>

        <select
          value={filterPrice}
          onChange={(e) => setFilterPrice(e.target.value)}
        >
          <option value="all">All Prices</option>
          <option value="1000">≤ ₹1000</option>
          <option value="2000">≤ ₹2000</option>
          <option value="3000">≤ ₹3000</option>
          <option value="4000">≤ ₹4000</option>
        </select>
      </div>

      <div className="plans">
        {filteredPlans.map((plan) => (
          <div className="plan-card" key={plan.id}>
            <h2>{plan.name}</h2>
            <p className="price">₹{plan.price}/month</p>
            <span className="discount">{plan.discount}</span>
            <p className="speed">{plan.speed} Mbps</p>

            <div className="details-dropdown">
              <button onClick={() => toggleDetails(plan.id)}>
                {expanded[plan.id] ? "Hide Details" : "See More"}
                {expanded[plan.id] ? (
                  <ChevronUp className="arrow" />
                ) : (
                  <ChevronDown className="arrow" />
                )}
              </button>
              {expanded[plan.id] && <p className="details">{plan.details}</p>}
            </div>

            <button className="subscribe" onClick={() => handleSubscribe(plan.name)}>
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
