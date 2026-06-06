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
        <section className="auth-hero">
          <div className="hero-copy">
            <span className="hero-pill">VendorBridge</span>
            <h1>Procurement intelligence for modern teams.</h1>
            <p>Secure login to manage approvals, suppliers, and spend from one polished procurement experience.</p>
          </div>
        </section>

        <div className="auth-card">
          <div className="brand-row">
            <img src="/vendorbridge-logo.svg" alt="VendorBridge" className="auth-brand-logo" />
          </div>
          <h1>Sign in</h1>
          <p>Enter your credentials to continue to the VendorBridge procurement suite.</p>
          <form onSubmit={onSubmit} className="auth-form">
            <label>
              Email Address
              <input
                type="email"
                value={form.email}
                onChange={(e) => onChange({ ...form, email: e.target.value })}
                placeholder="Enter your email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                placeholder="Enter password"
              />
            </label>
            {message && <div className="form-message">{message}</div>}
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="primary-btn">
              Login
            </button>
            <div className="auth-extra-row">
              <button type="button" className="text-btn" onClick={onForgotPassword}>
                Forgot password?
              </button>
            </div>
          </form>
          <div className="auth-footer">
            <span>Don't have an account?</span>
            <button className="text-btn" onClick={onSwitchToSignup}>
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
