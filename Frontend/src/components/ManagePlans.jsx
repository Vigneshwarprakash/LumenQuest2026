// src/components/Admin/ManagePlans.jsx
import React, { useState } from "react";
import "./ManagePlans.css";

const ManagePlans = () => {
  const [plans, setPlans] = useState([
    { id: 1, name: "Basic Plan", price: 199, quota: "1.5GB/day", description: "28 days validity, Unlimited Calls, 100 SMS/day" },
    { id: 2, name: "Premium Plan", price: 499, quota: "2.5GB/day", description: "84 days validity, Unlimited Calls, Netflix Mobile Plan Included" },
  ]);

  const [newPlan, setNewPlan] = useState({ name: "", price: "", quota: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPlan({ ...newPlan, [name]: value });
  };

  // Add Plan
  const handleAdd = () => {
    if (!newPlan.name || !newPlan.price || !newPlan.quota || !newPlan.description) {
      return alert("Please fill all fields!");
    }
    setPlans([...plans, { ...newPlan, id: Date.now() }]);
    setNewPlan({ name: "", price: "", quota: "", description: "" });
  };

  // Delete Plan
  const handleDelete = (id) => {
    setPlans(plans.filter((plan) => plan.id !== id));
  };

  // Edit Plan
  const handleEdit = (plan) => {
    setEditingId(plan.id);
    setNewPlan({
      name: plan.name,
      price: plan.price,
      quota: plan.quota,
      description: plan.description,
    });
  };

  // Save Edited Plan
  const handleSave = () => {
    setPlans(
      plans.map((p) => (p.id === editingId ? { ...p, ...newPlan } : p))
    );
    setEditingId(null);
    setNewPlan({ name: "", price: "", quota: "", description: "" });
  };

  return (
    <div className="manage-plans">
      <h2>📊 Manage Subscription Plans</h2>

      {/* Form Section */}
      <div className="form-section">
        <input
          type="text"
          name="name"
          placeholder="Plan Name (e.g., Basic, Premium)"
          value={newPlan.name}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price (₹)"
          value={newPlan.price}
          onChange={handleChange}
        />
        <input
          type="text"
          name="quota"
          placeholder="Quota/Validity (e.g., 2GB/day, 28 days)"
          value={newPlan.quota}
          onChange={handleChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description (e.g., Unlimited Calls + Netflix)"
          value={newPlan.description}
          onChange={handleChange}
        />
        {editingId ? (
          <button className="btn save" onClick={handleSave}>
            💾 Save
          </button>
        ) : (
          <button className="btn add" onClick={handleAdd}>
            ➕ Add Plan
          </button>
        )}
      </div>

      {/* Plans Table */}
      <table className="plans-table">
        <thead>
          <tr>
            <th>Plan Name</th>
            <th>Price (₹)</th>
            <th>Quota/Validity</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id}>
              <td>{plan.name}</td>
              <td>{plan.price}</td>
              <td>{plan.quota}</td>
              <td>{plan.description}</td>
              <td>
                <button className="btn edit" onClick={() => handleEdit(plan)}>
                  ✏️ Edit
                </button>
                <button
                  className="btn delete"
                  onClick={() => handleDelete(plan.id)}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePlans;
