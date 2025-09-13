# app.py
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
import joblib
import os
import io
import json
from datetime import datetime, timedelta

st.set_page_config(layout="wide", page_title="Admin Dashboard", initial_sidebar_state="expanded")

# -------------------------
# SAMPLE DATA GENERATOR
# -------------------------
@st.cache_data
def generate_sample_data(seed=42):
    np.random.seed(seed)
    # Users
    user_count = 103
    cities = ["Mumbai","Delhi","Bengaluru","Hyderabad","Chennai","Kolkata","Pune","Jaipur"]
    roles = ["user", "admin"]
    users = []
    for i in range(user_count):
        users.append({
            "id": i+1,
            "username": f"user{i+1:03d}",
            "name": f"User {i+1}",
            "email": f"user{i+1}@example.com",
            "city": np.random.choice(cities),
            "state": "Maharashtra" if i % 3 == 0 else np.random.choice(["Punjab","Karnataka","Tamil Nadu","West Bengal"]),
            "role": "user",
            "active": bool(np.random.choice([1,1,1,0])) # mostly active
        })

    users_df = pd.DataFrame(users)

    # Plans
    plans = [
        {"id":1,"name":"Basic Starter","speed_mbps":25,"data_limit_gb":50,"price":299,"plan_type":"basic"},
        {"id":2,"name":"Student Special","speed_mbps":50,"data_limit_gb":75,"price":399,"plan_type":"basic"},
        {"id":3,"name":"Home Essential","speed_mbps":100,"data_limit_gb":100,"price":499,"plan_type":"standard"},
        {"id":4,"name":"Power User","speed_mbps":300,"data_limit_gb":500,"price":1299,"plan_type":"premium"},
        {"id":5,"name":"Pro Unlimited","speed_mbps":500,"data_limit_gb":9999,"price":1999,"plan_type":"premium"},
        {"id":6,"name":"Gaming Pro","speed_mbps":800,"data_limit_gb":1500,"price":1799,"plan_type":"premium"},
        {"id":7,"name":"Enterprise","speed_mbps":1500,"data_limit_gb":5000,"price":2999,"plan_type":"elite"},
    ]
    plans_df = pd.DataFrame(plans)

    # Subscriptions (assign random plans to users)
    subs = []
    for i, u in users_df.iterrows():
        plan = plans_df.sample(weights=[4,2,5,2,1,1,0.5], replace=True).iloc[0]
        subs.append({
            "user_id": u["id"],
            "plan_id": plan["id"],
            "start_date": datetime.now() - pd.to_timedelta(np.random.randint(5,400), unit='d'),
            "active": bool(np.random.choice([1,1,1,0]))
        })
    subs_df = pd.DataFrame(subs)

    # Revenue series (90 days)
    days = 90
    end = datetime.now()
    dates = [end - timedelta(days=x) for x in range(days)][::-1]
    daily_revenue = np.abs(np.random.normal(loc=2500, scale=900, size=days).astype(int))
    revenue_df = pd.DataFrame({"date":dates, "revenue": daily_revenue})

    # Tickets
    categories = ["billing","speed_complaint","technical","plan_change","connection_issue","service"]
    statuses = ["closed","resolved","ongoing"]
    tickets = []
    for i in range(73): # approx
        tickets.append({
            "id": i+1,
            "subject": np.random.choice(["Speed issue","Installation query","Plan downgrade","Invoice clarification","Equipment malfunction","No internet"]),
            "category": np.random.choice(categories),
            "priority": np.random.choice(["low","medium","high"], p=[0.6,0.3,0.1]),
            "created_date": datetime.now() - pd.to_timedelta(np.random.randint(1,400), unit='d'),
            "status": np.random.choice(["closed","resolved","ongoing"], p=[0.6,0.3,0.1]),
            "user_email": f"user{np.random.randint(1,user_count+1)}@example.com"
        })
    tickets_df = pd.DataFrame(tickets)

    # Feature importance mock (for ML)
    feature_importance = pd.DataFrame({
        "feature": ["avg_daily_usage","max_daily_usage","weekend_avg","usage_std","days_since_signup","city_Mumbai","state_Delhi","usage_consistency","estimated_monthly_usage","weekday_avg"],
        "importance": np.random.rand(10)
    }).sort_values("importance", ascending=False)

    return users_df, plans_df, subs_df, revenue_df, tickets_df, feature_importance

USERS_DF, PLANS_DF, SUBS_DF, REVENUE_DF, TICKETS_DF, FEATURE_IMPORTANCE_DF = generate_sample_data()

# -------------------------
# Helpers
# -------------------------
def compute_kpis(users_df, subs_df, revenue_df, tickets_df):
    total_users = len(users_df)
    active_subs = subs_df[subs_df["active"]==True].shape[0]
    monthly_revenue = int(revenue_df.tail(30)["revenue"].sum())
    open_tickets = tickets_df[tickets_df["status"]!="closed"].shape[0]
    return {"total_users": total_users, "active_subscriptions": active_subs, "monthly_revenue": monthly_revenue, "open_tickets": open_tickets}

def format_inr(n):
    return "₹" + "{:,}".format(int(n))

# -------------------------
# LAYOUT: SIDEBAR NAV
# -------------------------
st.sidebar.title("Admin")
page = st.sidebar.radio("Go to", ["Dashboard","Plans","Users","Support","ML Model","Settings"])

# -------------------------
# DASHBOARD PAGE
# -------------------------
if page == "Dashboard":
    st.title("Admin Dashboard")
    # KPIs
    kpis = compute_kpis(USERS_DF, SUBS_DF, REVENUE_DF, TICKETS_DF)
    # KPI cards
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown("<div style='background:linear-gradient(135deg, #6D28D9 0%, #3B82F6 100%); padding:24px; border-radius:16px; color:white;'>"
                    f"<div style='font-size:14px;opacity:0.9'>Total Users</div>"
                    f"<div style='font-size:34px;font-weight:700;margin-top:8px'>{kpis['total_users']}</div>"
                    "</div>", unsafe_allow_html=True)
    with col2:
        st.markdown("<div style='background:linear-gradient(135deg, #6D28D9 0%, #3B82F6 100%); padding:24px; border-radius:16px; color:white;'>"
                    f"<div style='font-size:14px;opacity:0.9'>Active Subscriptions</div>"
                    f"<div style='font-size:34px;font-weight:700;margin-top:8px'>{kpis['active_subscriptions']}</div>"
                    "</div>", unsafe_allow_html=True)
    with col3:
        st.markdown("<div style='background:linear-gradient(135deg, #6D28D9 0%, #3B82F6 100%); padding:24px; border-radius:16px; color:white;'>"
                    f"<div style='font-size:14px;opacity:0.9'>Monthly Revenue</div>"
                    f"<div style='font-size:34px;font-weight:700;margin-top:8px'>{format_inr(kpis['monthly_revenue'])}</div>"
                    "</div>", unsafe_allow_html=True)
    with col4:
        st.markdown("<div style='background:linear-gradient(135deg, #6D28D9 0%, #3B82F6 100%); padding:24px; border-radius:16px; color:white;'>"
                    f"<div style='font-size:14px;opacity:0.9'>Open Tickets</div>"
                    f"<div style='font-size:34px;font-weight:700;margin-top:8px'>{kpis['open_tickets']}</div>"
                    "</div>", unsafe_allow_html=True)

    st.markdown("## Revenue Analytics")
    # revenue line chart (90 days)
    fig = px.line(REVENUE_DF, x="date", y="revenue", title="Daily Revenue Trend (Last 90 Days)", markers=False)
    fig.update_layout(margin=dict(l=20,r=20,t=30,b=10))
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("## Plan Popularity & User Growth")
    left, right = st.columns((2,1))
    with left:
        # Plan popularity: count subscriptions by plan
        merged = SUBS_DF.merge(PLANS_DF, left_on="plan_id", right_on="id", how="left")
        plan_counts = merged.groupby("name").size().reset_index(name="count").sort_values("count", ascending=True)
        fig2 = px.bar(plan_counts, x="count", y="name", orientation="h", title="Plan Popularity (Total Subscriptions)")
        st.plotly_chart(fig2, use_container_width=True)
    with right:
        # new users: simple histogram by week (mock)
        new_users_series = pd.Series(pd.to_datetime([d["start_date"] for d in SUBS_DF.to_dict("records")]))
        new_users = new_users_series.dt.to_period("W").value_counts().sort_index()
        new_df = new_users.reset_index()
        new_df.columns = ["week","new_users"]
        new_df["week"] = new_df["week"].astype(str)
        fig3 = px.line(new_df, x="week", y="new_users", title="New Users by Week", markers=True)
        st.plotly_chart(fig3, use_container_width=True)

# -------------------------
# PLANS PAGE
# -------------------------
elif page == "Plans":
    st.title("Enhanced Plans Management")
    st.markdown("### Current Plans")
    st.dataframe(PLANS_DF.style.format({"price":"{:,}"}), height=300)

    st.markdown("### Create / Edit Plan")
    with st.form("plan_form", clear_on_submit=False):
        cols = st.columns(4)
        name = cols[0].text_input("Plan Name")
        speed = cols[1].number_input("Download Speed (Mbps)", min_value=1, value=50)
        data_limit = cols[2].number_input("Data limit (GB)", min_value=1, value=100)
        price = cols[3].number_input("Price (₹)", min_value=0, value=499)
        validity = st.number_input("Validity (days)", min_value=1, value=30)
        plan_type = st.selectbox("Plan Type", ["basic","standard","premium","elite"])
        submitted = st.form_submit_button("Create Plan")
        if submitted:
            new_id = int(PLANS_DF["id"].max()) + 1
            new_plan = {"id": new_id, "name": name, "speed_mbps": speed, "data_limit_gb": data_limit, "price": price, "plan_type": plan_type, "validity_days":validity}
            PLANS_DF.loc[len(PLANS_DF)] = new_plan
            st.success(f"Created {name} (id {new_id})")

    st.markdown("### Bulk Plan Upload (CSV)")
    uploaded = st.file_uploader("Choose CSV file", type=['csv'])
    if uploaded:
        dfu = pd.read_csv(uploaded)
        st.dataframe(dfu.head())
        if st.button("Append Plans from CSV"):
            # naive append
            for _, r in dfu.iterrows():
                new_id = int(PLANS_DF["id"].max()) + 1
                row = r.to_dict()
                row["id"] = new_id
                PLANS_DF.loc[len(PLANS_DF)] = row
            st.success("Appended plans from CSV")

# -------------------------
# USERS PAGE
# -------------------------
elif page == "Users":
    st.title("User Management")
    st.markdown("### Create New User")
    with st.form("user_form"):
        ucols = st.columns(3)
        uname = ucols[0].text_input("Username")
        fullname = ucols[1].text_input("Full Name")
        email = ucols[2].text_input("Email")
        city = st.selectbox("City", sorted(USERS_DF["city"].unique()))
        role = st.selectbox("Role", ["user","admin"])
        create = st.form_submit_button("Create User")
        if create:
            new_id = int(USERS_DF["id"].max()) + 1
            USERS_DF.loc[len(USERS_DF)] = {"id":new_id,"username":uname,"name":fullname,"email":email,"city":city,"state":"Unknown","role":role,"active":True}
            st.success(f"User {fullname} created")

    st.markdown("### Existing Users")
    search = st.text_input("Search username or name")
    df_show = USERS_DF.copy()
    if search:
        df_show = df_show[df_show["username"].str.contains(search, case=False) | df_show["name"].str.contains(search, case=False)]
    st.dataframe(df_show, height=300)

# -------------------------
# SUPPORT PAGE
# -------------------------
elif page == "Support":
    st.title("Support Ticket Management")
    st.markdown("## Tickets Summary")
    st.metric("Resolved Tickets", int((TICKETS_DF["status"]=="resolved").sum()))
    st.metric("Closed Tickets", int((TICKETS_DF["status"]=="closed").sum()))
    st.metric("Open/Ongoing", int((TICKETS_DF["status"]!="closed").sum()))

    st.markdown("### Tickets by Category")
    cat_counts = TICKETS_DF["category"].value_counts().reset_index()
    cat_counts.columns = ["category","count"]
    fig_cat = px.bar(cat_counts, x="category", y="count", title="Tickets by Category")
    st.plotly_chart(fig_cat, use_container_width=True)

    st.markdown("### Browse Tickets by Status")
    status = st.selectbox("Status", ["All","closed","resolved","ongoing"])
    if status != "All":
        df_t = TICKETS_DF[TICKETS_DF["status"]==status]
    else:
        df_t = TICKETS_DF
    st.dataframe(df_t.sort_values("created_date", ascending=False), height=300)

# -------------------------
# ML MODEL PAGE
# -------------------------
elif page == "ML Model":
    st.title("Machine Learning Model Management")
    st.markdown("This panel trains a small model (mock) and displays performance and feature importances.")

    model_file = "rf_model.joblib"
    # quick synthetic dataset (use SUBS_DF + USERS_DF features to predict active subscription)
    st.markdown("## Train / Evaluate Model (Mock)")
    if st.button("Train New Model"):
        # create synthetic dataset
        df = SUBS_DF.merge(USERS_DF, left_on="user_id", right_on="id", suffixes=("","_user"))
        # create features
        df["city_mumbai"] = (df["city"]=="Mumbai").astype(int)
        df["days_since_start"] = (pd.Timestamp.now() - pd.to_datetime(df["start_date"])).dt.days
        X = df[["city_mumbai","days_since_start"]].fillna(0)
        y = df["active"].astype(int)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
        rf = RandomForestClassifier(n_estimators=50, random_state=42)
        rf.fit(X_train, y_train)
        preds = rf.predict(X_test)
        acc = accuracy_score(y_test, preds)
        f1 = f1_score(y_test, preds, zero_division=0)
        prec = precision_score(y_test, preds, zero_division=0)
        rec = recall_score(y_test, preds, zero_division=0)
        joblib.dump(rf, model_file)
        st.success("Model trained and saved.")
        st.metric("Accuracy", f"{acc:.2f}")
        st.write("F1:", f"{f1:.2f}", " Precision:", f"{prec:.2f}", " Recall:", f"{rec:.2f}")

    st.markdown("## Current Model Status")
    if os.path.exists(model_file):
        size = os.path.getsize(model_file) / (1024*1024)
        st.write("Model file:", model_file)
        st.write("Size (MB):", f"{size:.2f} MB")
        # load and show feature importances if available
        try:
            model = joblib.load(model_file)
            if hasattr(model, "feature_importances_"):
                st.write("Feature importances (mock):")
                fi = model.feature_importances_
                feats = ["city_mumbai","days_since_start"][:len(fi)]
                figfi = px.bar(x=feats, y=fi, labels={"x":"feature","y":"importance"}, title="Feature Importances")
                st.plotly_chart(figfi, use_container_width=True)
        except Exception as e:
            st.error(f"Error loading model: {e}")
    else:
        st.info("No trained model found. Click Train New Model.")

# -------------------------
# SETTINGS PAGE
# -------------------------
elif page == "Settings":
    st.title("Admin Settings & System Stats")
    st.markdown("System statistics (sample):")
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Subscriptions", f"{len(SUBS_DF)}")
    col2.metric("Total Payments", "249")  # sample
    col3.metric("Total Data Usage", f"{REVENUE_DF['revenue'].sum():,} GB")
    st.markdown("Generate sample data:")
    if st.button("Regenerate Sample Data"):
        # clear cache and regenerate (Streamlit doesn't allow clearing decorated cache easily)
        st.experimental_rerun()

# -------------------------
# END
# -------------------------