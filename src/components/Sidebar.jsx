import '../styles/sidebar.css';

const NAV_ICONS = {
  'Dashboard': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  'Vendors': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  "RFQ's": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  'Quotations': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  'Approvals': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  'Purchase orders': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  'Invoices': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  'Reports': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  'Activity': (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

function Sidebar({ user, activePage, onNavigate }) {
  const navItems = user?.role === 'Admin'
    ? ['Dashboard', 'Vendors', "RFQ's", 'Quotations', 'Approvals', 'Purchase orders', 'Invoices', 'Reports', 'Activity']
    : ['Dashboard', 'Vendors', "RFQ's", 'Quotations', 'Purchase orders', 'Invoices', 'Reports', 'Activity'];

  const getRoute = (item) => {
    if (item === 'Vendors') return 'vendors';
    if (item === "RFQ's") return 'rfqs';
    return 'dashboard';
  };

  const isActive = (item) => {
    if (activePage === 'vendors' && item === 'Vendors') return true;
    if (activePage === 'rfqs' && item === "RFQ's") return true;
    if (activePage === 'dashboard' && item === 'Dashboard') return true;
    return false;
  };

  return (
    <div className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">VendorBridge</span>
          <span className="brand-tagline">Procurement Portal</span>
        </div>
      </div>

      {user && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {(user.firstName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user.firstName} {user.lastName}</span>
            <span className="user-role-badge">{user.role || 'Officer'}</span>
          </div>
        </div>
      )}

      <div className="sidebar-section-label">Navigation</div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item}
            className={`nav-item ${isActive(item) ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate(getRoute(item))}
          >
            <span className="nav-icon">{NAV_ICONS[item]}</span>
            <span className="nav-label">{item}</span>
            {isActive(item) && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">© 2025 VendorBridge</div>
      </div>
    </div>
  );
}

export default Sidebar;
