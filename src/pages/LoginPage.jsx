import React, { useEffect } from 'react';
import '../styles/login.css';

function LoginPage({ form, onChange, onSubmit, onSwitchToSignup, onForgotPassword, error, message }) {
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  return (
    <div className="auth-screen">
      <div className="auth-panel">

        {/* Left Hero */}
        <section className="auth-hero">
          <div className="hero-copy">
            <span className="hero-pill">VendorBridge</span>
            <h1>Procurement intelligence for modern teams.</h1>
            <p>Secure login to manage approvals, suppliers, and spend from one polished procurement experience.</p>
            <div className="hero-features">
              <div className="hero-feature-item">
                <span className="hero-feature-dot" />
                Manage RFQs and vendor quotations
              </div>
              <div className="hero-feature-item">
                <span className="hero-feature-dot" />
                Track approvals and purchase orders
              </div>
              <div className="hero-feature-item">
                <span className="hero-feature-dot" />
                Real-time spend analytics & reports
              </div>
            </div>
          </div>
        </section>

        {/* Right Auth Card */}
        <div className="auth-card">
          <div className="brand-row">
            <img src="/vendorbridge-logo.svg" alt="VendorBridge" className="auth-brand-logo" />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your VendorBridge account to continue.</p>

          <form onSubmit={onSubmit} className="auth-form">
            <label>
              Email Address
              <input
                type="email"
                id="login-email"
                value={form.email}
                onChange={(e) => onChange({ ...form, email: e.target.value })}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                id="login-password"
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </label>

            <div className="auth-extra-row">
              <button type="button" className="text-btn" onClick={onForgotPassword}>
                Forgot password?
              </button>
            </div>

            {message && <div className="form-message">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <button type="submit" id="login-submit" className="primary-btn">
              Sign In
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <button className="text-btn" onClick={onSwitchToSignup}>
              Create account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
