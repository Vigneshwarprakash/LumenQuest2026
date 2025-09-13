# churn_model_utils.py
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import plotly.express as px


def train_churn_model(file="SubscriptionUseCase_Dataset.xlsx"):
    """
    Train a churn prediction model using the subscription dataset.
    Returns:
        - trained model
        - feature importance dataframe
        - predictions dataframe with churn risk
        - evaluation metrics dictionary
    """

    # -----------------------------
    # 1. Load Excel File
    # -----------------------------
    user_df = pd.read_excel(file, sheet_name="User_data")
    subs_df = pd.read_excel(file, sheet_name="Subscriptions")
    plans_df = pd.read_excel(file, sheet_name="Subscription_plans")
    billing_df = pd.read_excel(file, sheet_name="billing_info")

    # -----------------------------
    # 2. Merge Data
    # -----------------------------
    merged = subs_df.merge(user_df, left_on="User Id",
                           right_on="User Id", how="left")
    merged = merged.merge(plans_df, left_on="Product Id",
                          right_on="Product Id", how="left")
    merged = merged.merge(billing_df, left_on="Subscription Id",
                          right_on="subscription_id", how="left")

    # -----------------------------
    # 3. Feature Engineering
    # -----------------------------
    today = datetime.now()

    # subscription age
    merged["start_date"] = pd.to_datetime(
        merged["Start Date"], errors="coerce")
    merged["sub_age_days"] = (today - merged["start_date"]).dt.days.fillna(0)

    # time since last billing
    merged["last_billed_date"] = pd.to_datetime(
        merged["Last Billed Date"], errors="coerce")
    merged["days_since_billing"] = (
        today - merged["last_billed_date"]).dt.days.fillna(999)

    # time since last renewal
    merged["last_renewed_date"] = pd.to_datetime(
        merged["Last Renewed Date"], errors="coerce")
    merged["days_since_renewal"] = (
        today - merged["last_renewed_date"]).dt.days.fillna(999)

    # is auto renewal allowed
    merged["auto_renewal"] = (
        merged["Auto Renewal Allowed"] == "Yes").astype(int)

    # churn label (rule-based)
    # churn = 1 if inactive / paused / terminated / not billed for > 60 days
    merged["churn"] = 0
    merged.loc[merged["Status_x"].isin(
        ["inactive", "paused", "terminated"]), "churn"] = 1
    merged.loc[merged["days_since_billing"] > 60, "churn"] = 1

    # -----------------------------
    # 4. Select Features
    # -----------------------------
    features = ["Price", "sub_age_days", "days_since_billing",
                "days_since_renewal", "auto_renewal", "Grace Time"]
    X = merged[features].fillna(0)
    y = merged["churn"]

    # -----------------------------
    # 5. Train/Test Split
    # -----------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)

    # -----------------------------
    # 6. Train Model
    # -----------------------------
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)

    # -----------------------------
    # 7. Evaluate
    # -----------------------------
    y_pred = rf.predict(X_test)
    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, zero_division=0),
        "recall": recall_score(y_test, y_pred, zero_division=0),
        "f1_score": f1_score(y_test, y_pred, zero_division=0)
    }

    # Feature importance
    importances = rf.feature_importances_
    feat_imp = pd.DataFrame({"feature": features, "importance": importances}).sort_values(
        "importance", ascending=False)

    # -----------------------------
    # 8. Save Model
    # -----------------------------
    joblib.dump(rf, "churn_model.joblib")

    # -----------------------------
    # 9. Predict churn risk for all users
    # -----------------------------
    merged["churn_risk"] = rf.predict_proba(X)[:, 1]
    final_output = merged[["User Id", "Name", "Email", "Status_x", "Price", "sub_age_days",
                           "days_since_billing", "days_since_renewal", "auto_renewal", "churn", "churn_risk"]]

    # -----------------------------
    # 10. Optional: Plot Feature Importance for Streamlit
    # -----------------------------
    fig = px.bar(feat_imp, x="importance", y="feature", orientation="h",
                 title="Feature Importance")

    return rf, feat_imp, final_output, metrics, fig
