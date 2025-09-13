import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# ---- Example Training Data ----
data = {
    "Price": [57, 15, 73, 27, 42],
    "Auto Renewal Allowed": [0, 1, 1, 1, 1],
    "subscription_age_days": [120, 45, 300, 200, 100],
    "time_since_last_renewal": [30, 60, 5, 10, 90],
    "time_since_last_billing": [28, 55, 7, 12, 85],
    "churned": [0, 1, 0, 0, 1],  # 1 = churn, 0 = not churn
}
df = pd.DataFrame(data)

X = df.drop("churned", axis=1)
y = df["churned"]

# Train model
model = RandomForestClassifier()
model.fit(X, y)

# Save model + features
joblib.dump(model, "churn_model.pkl")
joblib.dump(list(X.columns), "churn_features.pkl")

print("✅ Model trained & saved")
