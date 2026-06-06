import React, { useEffect } from 'react';
import '../styles/forgot.css';

function ForgotPasswordPage({
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  stage,
  onVerify,
  onResetPassword,
  resetPassword,
  onResetPasswordChange,
  resetConfirmPassword,
  onResetConfirmPasswordChange,
  onBackToLogin,
  error,
  message,
}) {
  useEffect(() => {
    document.body.classList.add('auth-page');
    // Prevent browser back from leaving the SPA — go to login instead
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      onBackToLogin();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.body.classList.remove('auth-page');
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="auth-screen">
      <div className="auth-panel">

        {/* Left Hero */}
        <section className="auth-hero hero-forgot">
          <div className="hero-logo-block">
            <img src="/vendorbridge-logo.svg" alt="VendorBridge" className="hero-logo-img" />
          </div>
          <div className="hero-copy">
            <span className="hero-pill">VendorBridge</span>
            <h1>Recover access to your procurement workspace.</h1>
            <p>Verify your identity and reset your password to return to VendorBridge with confidence.</p>
            <div className="hero-features">
              <div className="hero-feature-item">
                <span className="hero-feature-dot" />
                Secure two-step identity verification
              </div>
              <div className="hero-feature-item">
                <span className="hero-feature-dot" />
                Instant password reset
              </div>
              <div className="hero-feature-item">
                <span className="hero-feature-dot" />
                All session data securely managed
              </div>
            </div>
          </div>
        </section>

        {/* Right Auth Card */}
        <div className="auth-card">
          <div className="auth-card-inner">
            <div className="brand-row">
              <img src="/vendorbridge-logo.svg" alt="VendorBridge" className="auth-brand-logo" />
            </div>

            <h1>{stage === 'verify' ? 'Recover account' : 'Set new password'}</h1>
            <p>
              {stage === 'verify'
                ? 'Enter your registered email and phone number to verify your identity.'
                : 'Choose a strong new password for your VendorBridge account.'}
            </p>

            <form onSubmit={stage === 'verify' ? onVerify : onResetPassword} className="auth-form">
              {stage === 'verify' ? (
                <>
                  <label>
                    Email Address
                    <input
                      type="email"
                      id="forgot-email"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="Enter your registered email"
                    />
                  </label>
                  <label>
                    Phone Number
                    <input
                      type="text"
                      id="forgot-phone"
                      value={phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                      placeholder="Enter your registered phone"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    New Password
                    <input
                      type="password"
                      id="forgot-new-password"
                      value={resetPassword}
                      onChange={(e) => onResetPasswordChange(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </label>
                  <label>
                    Confirm New Password
                    <input
                      type="password"
                      id="forgot-confirm-password"
                      value={resetConfirmPassword}
                      onChange={(e) => onResetConfirmPasswordChange(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </label>
                </>
              )}

              {message && <div className="form-message">{message}</div>}
              {error && <div className="form-error">{error}</div>}

              <button type="submit" id="forgot-submit" className="primary-btn">
                {stage === 'verify' ? 'Verify Identity' : 'Reset Password'}
              </button>
            </form>

            <div className="auth-footer">
              <span>Remember your password?</span>
              <button className="text-btn" onClick={onBackToLogin}>
                Back to Login
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ForgotPasswordPage;
