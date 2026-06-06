import React, { useEffect } from 'react';
import '../styles/signup.css';

function SignupPage({ signup, onChange, onSubmit, onSwitchToLogin, error, message }) {
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  return (
    <div className="auth-screen">
      <div className="auth-panel">

        {/* Left Hero */}
        <section className="auth-hero hero-signup">
          <div className="hero-copy">
            <span className="hero-pill">VendorBridge</span>
            <h1>Build procurement speed with confidence.</h1>
            <p>Create your VendorBridge account and access supplier workflows, approvals, and spend analytics in one polished workspace.</p>
            <div className="hero-features">
              <div className="hero-feature-item">
                <span className="hero-feature-dot" />
                Role-based access: Admin, Manager, Officer, Vendor
              </div>
              <div className="hero-feature-item">
                <span className="hero-feature-dot" />
                Unified procurement dashboard
              </div>
              <div className="hero-feature-item">
                <span className="hero-feature-dot" />
                Full audit trail &amp; activity logs
              </div>
            </div>
          </div>
        </section>

        {/* Right Auth Card */}
        <div className="auth-card">
          <div className="brand-row">
            <img src="/vendorbridge-logo.svg" alt="VendorBridge" className="auth-brand-logo" />
          </div>
          <h1>Create your account</h1>
          <p>Join VendorBridge to manage procurement, suppliers, and spend from one dashboard.</p>

          <form onSubmit={onSubmit} className="signup-form">
            <div className="split-row">
              <label>
                First Name
                <input
                  type="text"
                  id="signup-firstname"
                  value={signup.firstName}
                  onChange={(e) => onChange({ ...signup, firstName: e.target.value })}
                  placeholder="First name"
                />
              </label>
              <label>
                Last Name
                <input
                  type="text"
                  id="signup-lastname"
                  value={signup.lastName}
                  onChange={(e) => onChange({ ...signup, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </label>
            </div>

            <div className="split-row">
              <label>
                Email Address
                <input
                  type="email"
                  id="signup-email"
                  value={signup.email}
                  onChange={(e) => onChange({ ...signup, email: e.target.value })}
                  placeholder="Email address"
                />
              </label>
              <label>
                Phone Number
                <input
                  type="text"
                  id="signup-phone"
                  value={signup.phone}
                  onChange={(e) => onChange({ ...signup, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </label>
            </div>

            <div className="split-row">
              <label>
                Password
                <input
                  type="password"
                  id="signup-password"
                  value={signup.password}
                  onChange={(e) => onChange({ ...signup, password: e.target.value })}
                  placeholder="Create password"
                />
              </label>
              <label>
                Confirm Password
                <input
                  type="password"
                  id="signup-confirm-password"
                  value={signup.confirmPassword}
                  onChange={(e) => onChange({ ...signup, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                />
              </label>
            </div>

            <div className="split-row">
              <label>
                Role
                <select
                  id="signup-role"
                  value={signup.role}
                  onChange={(e) => onChange({ ...signup, role: e.target.value })}
                >
                  <option>Manager</option>
                  <option>Officer</option>
                  <option>Vendor</option>
                  <option>Admin</option>
                </select>
              </label>
              <label>
                Country
                <input
                  type="text"
                  id="signup-country"
                  value={signup.country}
                  onChange={(e) => onChange({ ...signup, country: e.target.value })}
                  placeholder="Country"
                />
              </label>
            </div>

            <label>
              Additional Information
              <textarea
                id="signup-extra"
                value={signup.extra}
                onChange={(e) => onChange({ ...signup, extra: e.target.value })}
                placeholder="Additional information (optional)..."
              />
            </label>

            {message && <div className="form-message">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <button type="submit" id="signup-submit" className="primary-btn">
              Create Account
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <button className="text-btn" onClick={onSwitchToLogin}>
              Sign in
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SignupPage;
