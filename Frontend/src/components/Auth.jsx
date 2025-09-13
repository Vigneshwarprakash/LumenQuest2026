import React, { useState } from "react";
import "./Auth.css"; // import css file

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!form.username) newErrors.username = "Username is required";
    if (!validateEmail(form.email)) newErrors.email = "Invalid email format";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!validatePhone(form.phone))
      newErrors.phone = "Phone number must be exactly 10 digits";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Signup successful (frontend only)");
      console.log("Form data:", form);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Please enter email and password");
      return;
    }
    if (!validateEmail(form.email)) {
      alert("Invalid email format");
      return;
    }
    alert("Login successful (frontend only)");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="title">Subscription Management</h1>

        {/* Tabs */}
        <div className="tabs">
          <button
            onClick={() => setIsLogin(true)}
            className={`tab ${isLogin ? "active" : ""}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`tab ${!isLogin ? "active" : ""}`}
          >
            Signup
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form className="form" onSubmit={handleLogin}>
            <h2 className="form-title">Login Form</h2>
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input"
            />
            <div className="text-right">
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
            <button className="btn">Login</button>
          </form>
        ) : (
          <form className="form" onSubmit={handleSignup}>
            <h2 className="form-title">Signup Form</h2>

            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className="input"
              />
              {errors.username && <p className="error">{errors.username}</p>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="input"
              />
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={form.password}
                onChange={handleChange}
                className="input"
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input"
              />
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="input"
              />
              {errors.phone && <p className="error">{errors.phone}</p>}
            </div>

            <button className="btn">Signup</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
