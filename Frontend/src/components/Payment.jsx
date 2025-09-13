import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || {};

  const [method, setMethod] = useState("Credit Card");

  if (!plan) 
    return <p>No plan selected. Go back to <span onClick={() => navigate("/")} style={{color:"blue", cursor:"pointer"}}>Dashboard</span>.</p>;

  const handlePayment = () => {
    alert(`Payment of ₹${plan.price} for ${plan.name} using ${method} successful!`);
  };

  return (
    <div className="payment-page">
      <h1>Payment for {plan.name}</h1>

      {/* Subscription Details Card */}
      <div className="plan-card">
        <p className="plan-name">{plan.name}</p>
        <p className="plan-price">₹{plan.price}/month</p>
        <p className="plan-speed">{plan.speed} Mbps</p>
        <p className="plan-discount">{plan.discount}</p>
        <p className="plan-desc">{plan.description}</p>
      </div>

      {/* Payment Methods */}
      <div className="payment-methods">
        <label>
          <input type="radio" name="payment" value="Credit Card" checked={method==="Credit Card"} onChange={(e)=>setMethod(e.target.value)} />
          Credit Card
        </label>
        <label>
          <input type="radio" name="payment" value="UPI" checked={method==="UPI"} onChange={(e)=>setMethod(e.target.value)} />
          UPI
        </label>
        <label>
          <input type="radio" name="payment" value="PayPal" checked={method==="PayPal"} onChange={(e)=>setMethod(e.target.value)} />
          PayPal
        </label>
        <label>
          <input type="radio" name="payment" value="Net Banking" checked={method==="Net Banking"} onChange={(e)=>setMethod(e.target.value)} />
          Net Banking
        </label>
      </div>

      {/* Action Buttons */}
      <div className="buttons">
        <button className="pay-btn" onClick={handlePayment}>Pay Now</button>
        <button className="back-btn" onClick={()=>navigate("/dashboard")}>Back to Plans</button>
      </div>
    </div>
  );
}

export default Payment;
