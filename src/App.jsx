import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import VendorPage from './pages/VendorPage.jsx';
import RFQPage from './pages/RFQPage.jsx';
import QuotationPage from './pages/QuotationPage.jsx';
import ApprovalPage from './pages/ApprovalPage.jsx';
import POInvoicePage from './pages/POInvoicePage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import ActivityPage from './pages/ActivityPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';

const dashboardStats = [
  { title: "Active RFQ's", value: 12 },
  { title: 'Pending Approvals', value: 5 },
  { title: 'POs this month', value: '$2.3L' },
  { title: 'Overdue invoices', value: 3 },
];

const recentOrders = [
  { po: 'PO1', vendor: 'Infra', amount: '87,000', status: 'Approved' },
  { po: 'PO2', vendor: 'Tech core', amount: '140,000', status: 'Pending' },
  { po: 'PO3', vendor: 'OfficeNeed Co', amount: '34,900', status: 'Draft' },
];

const API_BASE = 'http://localhost:4000/api';
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getDefaultPage = (role) => {
  if (role === 'Vendor') return 'quotations';
  if (role === 'Officer') return 'approvals';
  return 'dashboard';
};

function App() {
  const [page, setPage] = useState('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'Officer', country: '', password: '', confirmPassword: '', extra: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStage, setForgotStage] = useState('verify');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE.replace('/api', '')}/session`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setPage(getDefaultPage(data.user.role));
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const switchPage = (nextPage) => {
    setError('');
    setMessage('');
    setForgotStage('verify');
    setResetPassword('');
    setResetConfirmPassword('');
    setForgotPhone('');
    setPage(nextPage);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Login failed');
      return;
    }

    setUser(data.user);
    setForm({ email: '', password: '' });
    setPage(getDefaultPage(data.user.role));
  };

  const handleForgotVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const response = await fetch(`${API_BASE}/forgot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: forgotEmail, phone: forgotPhone }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Unable to verify your account');
      return;
    }

    setMessage(data.message || 'Account verified. Please reset your password.');
    setForgotStage('reset');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const response = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: forgotEmail,
        phone: forgotPhone,
        password: resetPassword,
        confirmPassword: resetConfirmPassword,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Unable to reset password');
      return;
    }

    setMessage(data.message || 'Password reset successfully. You can now login.');
    setForgotStage('verify');
    setForgotEmail('');
    setForgotPhone('');
    setResetPassword('');
    setResetConfirmPassword('');
    setPage('login');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signup),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Registration failed');
      return;
    }

    setMessage(data.message || 'Registration successful. You can now login.');
    setSignup({ firstName: '', lastName: '', email: '', phone: '', role: 'Officer', country: '', password: '', confirmPassword: '', extra: '' });
    setForm({ email: signup.email, password: '' });
    setPage('login');
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE.replace('/api', '')}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    setForm({ email: '', password: '' });
    setMessage('You have been logged out.');
    setPage('login');
  };

  return (
    <div className="app-shell">
      {page === 'login' && (
        <LoginPage
          form={form}
          onChange={setForm}
          onSubmit={handleLogin}
          onSwitchToSignup={() => switchPage('signup')}
          onForgotPassword={() => switchPage('forgot')}
          error={error}
          message={message}
        />
      )}

      {page === 'signup' && (
        <SignupPage
          signup={signup}
          onChange={setSignup}
          onSubmit={handleRegister}
          onSwitchToLogin={() => switchPage('login')}
          error={error}
          message={message}
        />
      )}

      {page === 'forgot' && (
        <ForgotPasswordPage
          email={forgotEmail}
          onEmailChange={setForgotEmail}
          phone={forgotPhone}
          onPhoneChange={setForgotPhone}
          stage={forgotStage}
          onVerify={handleForgotVerify}
          onResetPassword={handleResetPassword}
          resetPassword={resetPassword}
          onResetPasswordChange={setResetPassword}
          resetConfirmPassword={resetConfirmPassword}
          onResetConfirmPasswordChange={setResetConfirmPassword}
          onBackToLogin={() => switchPage('login')}
          error={error}
          message={message}
        />
      )}

      {page === 'dashboard' && user && (
        <DashboardPage
          user={user}
          stats={dashboardStats}
          orders={recentOrders}
          onLogout={handleLogout}
          onNavigate={switchPage}
        />
      )}

      {page === 'rfqs' && user && (
        <RFQPage
          apiBase={API_BASE}
          user={user}
          onNavigate={switchPage}
          onLogout={handleLogout}
        />
      )}

      {page === 'quotations' && user && (
        <QuotationPage
          apiBase={API_BASE}
          user={user}
          onNavigate={switchPage}
          onLogout={handleLogout}
        />
      )}

      {page === 'approvals' && user && (
        <ApprovalPage
          apiBase={API_BASE}
          user={user}
          onNavigate={switchPage}
          onLogout={handleLogout}
        />
      )}

      {page === 'vendors' && user && (
        <VendorPage
          apiBase={API_BASE}
          user={user}
          onNavigate={switchPage}
          onLogout={handleLogout}
        />
      )}

      {page === 'po-invoice' && user && (
        <POInvoicePage
          apiBase={API_BASE}
          user={user}
          onNavigate={switchPage}
          onLogout={handleLogout}
        />
      )}

      {page === 'reports' && user && (
        <ReportPage
          user={user}
          onNavigate={switchPage}
          onLogout={handleLogout}
        />
      )}

      {page === 'activity' && user && (
        <ActivityPage
          user={user}
          onNavigate={switchPage}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
