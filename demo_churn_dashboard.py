# demo_churn_dashboard.py
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px

st.set_page_config(page_title="Churn Analytics Demo", layout="wide")
st.title("Churn Prediction & Analytics Demo")

# -------------------------------
# Sample data simulation
# -------------------------------
np.random.seed(42)
sample_users = 100
predictions = pd.DataFrame({
    "User Id": range(1, sample_users+1),
    "Name": [f"User {i}" for i in range(1, sample_users+1)],
    "Email": [f"user{i}@example.com" for i in range(1, sample_users+1)],
    "Status_x": np.random.choice(["active", "inactive", "paused"], sample_users),
    "Price": np.random.choice([299, 399, 499, 1299, 1799], sample_users),
    "sub_age_days": np.random.randint(1, 400, sample_users),
    "days_since_billing": np.random.randint(0, 120, sample_users),
    "days_since_renewal": np.random.randint(0, 120, sample_users),
    "auto_renewal": np.random.choice([0, 1], sample_users),
    "churn": np.random.choice([0, 1], sample_users),
    "churn_risk": np.random.rand(sample_users)
})

# -------------------------------
# KPI Cards
# -------------------------------
st.markdown("### Churn KPIs")
total_users = len(predictions)
churned_users = predictions['churn'].sum()
avg_churn_risk = predictions['churn_risk'].mean()

col1, col2, col3 = st.columns(3)
col1.metric("Total Users", total_users)
col2.metric("Total Churned", churned_users)
col3.metric("Avg Churn Risk", f"{avg_churn_risk:.2%}")

# -------------------------------
# Sample Predictions Table
# -------------------------------
st.markdown("### Sample Predictions")
st.dataframe(predictions.head(), height=300)

# -------------------------------
# Churn by Plan Chart
# -------------------------------
st.markdown("### Churn Rate by Plan")
churn_by_plan = predictions.groupby("Price")["churn"].mean().reset_index()
fig = px.bar(churn_by_plan, x="Price", y="churn",
             title="Churn Rate by Subscription Plan",
             labels={"churn": "Churn Rate", "Price": "Plan Price (₹)"},
             text=churn_by_plan["churn"].apply(lambda x: f"{x:.0%}"))
fig.update_traces(textposition='outside')
st.plotly_chart(fig, use_container_width=True)

# -------------------------------
# Feature Importance Chart (Mock)
# -------------------------------
st.markdown("### Feature Importance (Demo)")
features = ["Price", "sub_age_days", "days_since_billing",
            "days_since_renewal", "auto_renewal", "Grace Time"]
importance = np.random.rand(len(features))
feat_df = pd.DataFrame({"feature": features, "importance": importance}).sort_values(
    "importance", ascending=True)
fig2 = px.bar(feat_df, x="importance", y="feature",
              orientation='h', title="Feature Importance")
st.plotly_chart(fig2, use_container_width=True)

# -------------------------------
# Download Sample Predictions
# -------------------------------
csv = predictions.to_csv(index=False)
st.download_button("📥 Download Sample Predictions CSV", csv,
                   "churn_predictions_demo.csv", "text/csv")
