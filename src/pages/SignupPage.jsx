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
        <section className="auth-hero hero-signup">
          <div className="hero-copy">
            <span className="hero-pill">VendorBridge</span>
            <h1>Build procurement speed with confidence.</h1>
            <p>Create your VendorBridge account and access supplier workflows, approvals, and spend analytics in one polished workspace.</p>
          </div>
        </section>

        <div className="auth-card">
          <div className="brand-row">
            <img src="/vendorbridge-logo.svg" alt="VendorBridge" className="auth-brand-logo" />
          </div>
          <h1>Create your VendorBridge Management account</h1>
          <p>Create your VendorBridge account to manage procurement, suppliers, approvals, and spend from a single, polished dashboard.</p>
          <form onSubmit={onSubmit} className="signup-form">
            <div className="split-row">
              <label>
                First Name
                <input
                  type="text"
                  value={signup.firstName}
                  onChange={(e) => onChange({ ...signup, firstName: e.target.value })}
                  placeholder="First name"
                />
              </label>
              <label>
                Last Name
                <input
                  type="text"
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
                  value={signup.email}
                  onChange={(e) => onChange({ ...signup, email: e.target.value })}
                  placeholder="Email address"
                />
              </label>
              <label>
                Phone Number
                <input
                  type="text"
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
                  value={signup.password}
                  onChange={(e) => onChange({ ...signup, password: e.target.value })}
                  placeholder="Create password"
                />
              </label>
              <label>
                Confirm Password
                <input
                  type="password"
                  value={signup.confirmPassword}
                  onChange={(e) => onChange({ ...signup, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                />
              </label>
            </div>
            <div className="split-row">
              <label>
                Role
                <select value={signup.role} onChange={(e) => onChange({ ...signup, role: e.target.value })}>
                  <option>Officer</option>
                  <option>Admin</option>
                </select>
              </label>
              <label>
                Country
                <input
                  type="text"
                  value={signup.country}
                  onChange={(e) => onChange({ ...signup, country: e.target.value })}
                  placeholder="Country"
                />
              </label>
            </div>
            <label>
              Additional Information
              <textarea
                value={signup.extra}
                onChange={(e) => onChange({ ...signup, extra: e.target.value })}
                placeholder="Additional information..."
              />
            </label>
            {message && <div className="form-message">{message}</div>}
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="primary-btn">
              Create account
            </button>
          </form>
          <div className="auth-footer">
            <span>Already have an account?</span>
            <button className="text-btn" onClick={onSwitchToLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
