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
    return () => document.body.classList.remove('auth-page');
  }, []);
  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <section className="auth-hero hero-forgot">
          <div className="hero-copy">
            <span className="hero-pill">VendorBridge</span>
            <h1>Recover access to your procurement workspace.</h1>
            <p>Verify your account and set a new password to return to VendorBridge with confidence.</p>
          </div>
        </section>

        <div className="auth-card">
          <div className="brand-row">
            <div className="brand-circle">VB</div>
          </div>
          <h1>Recover account</h1>
          <p>Enter the details below to verify your identity and reset your VendorBridge password.</p>
          <form onSubmit={stage === 'verify' ? onVerify : onResetPassword} className="auth-form">
            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="Enter your registered email"
                disabled={stage === 'reset'}
              />
            </label>
            <label>
              Phone Number
              <input
                type="text"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="Enter your registered phone number"
                disabled={stage === 'reset'}
              />
            </label>
            {stage === 'reset' && (
              <>
                <label>
                  New Password
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => onResetPasswordChange(e.target.value)}
                    placeholder="Enter new password"
                  />
                </label>
                <label>
                  Confirm Password
                  <input
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(e) => onResetConfirmPasswordChange(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </label>
              </>
            )}
            {message && <div className="form-message">{message}</div>}
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="primary-btn">
              {stage === 'verify' ? 'Verify Account' : 'Reset Password'}
            </button>
          </form>
          <div className="auth-footer">
            <span>Back to</span>
            <button className="text-btn" onClick={onBackToLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
