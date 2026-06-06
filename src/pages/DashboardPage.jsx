import Sidebar from '../components/Sidebar.jsx';
import '../styles/dashboard.css';

const STAT_CONFIGS = [
  {
    key: 'rfqs',
    color: '#1428a0',
    bg: 'rgba(20, 40, 160, 0.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    trend: '+3 this week',
    up: true,
  },
  {
    key: 'approvals',
    color: '#f39c12',
    bg: 'rgba(243, 156, 18, 0.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    trend: '2 urgent',
    up: false,
  },
  {
    key: 'pos',
    color: '#27ae60',
    bg: 'rgba(39, 174, 96, 0.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    trend: '+12% vs last month',
    up: true,
  },
  {
    key: 'invoices',
    color: '#e74c3c',
    bg: 'rgba(231, 76, 60, 0.08)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    trend: 'Action needed',
    up: false,
  },
];

const STATUS_CLASS = {
  Approved: 'po-status-approved',
  Pending: 'po-status-pending',
  Draft: 'po-status-draft',
};

function DashboardPage({ user, stats, orders, onLogout, onNavigate }) {
  return (
    <div className="dashboard-screen">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>VendorBridge</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item}
              className="nav-item"
              onClick={() => onNavigate && onNavigate(
                item === 'Vendors' ? 'vendors'
                  : item === "RFQ's" ? 'rfqs'
                    : 'dashboard'
              )}
            >
              <span className="nav-item-icon" aria-hidden="true"></span>
              <span>{item}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <h1>Dashboard</h1>
            <p>{`Welcome back, ${user?.firstName || 'Procurement Officer'} — Today's Overview`}</p>
          </div>
          <div className="dashboard-header-right">
            <span className="header-role-badge">{user?.role || 'Officer'}</span>
            <button className="logout-btn" onClick={onLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="dashboard-content">

          {/* Stats Grid */}
          <section className="stats-grid">
            {stats.map((item, idx) => {
              const cfg = STAT_CONFIGS[idx] || STAT_CONFIGS[0];
              return (
                <div
                  key={item.title}
                  className="stat-card"
                  style={{ '--stat-color': cfg.color, '--stat-bg': cfg.bg }}
                >
                  <div className="stat-card-icon" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.icon}
                  </div>
                  <p className="stat-card-label">{item.title}</p>
                  <div className="stat-card-value">{item.value}</div>
                  <div className={`stat-card-trend ${!cfg.up ? 'down' : ''}`}>
                    <span>{cfg.up ? '↑' : '↓'}</span>
                    {cfg.trend}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Content Row */}
          <section className="content-row">
            {/* Recent Purchase Orders */}
            <div className="recent-card">
              <div className="card-header">
                <h2 className="card-title">Recent Purchase Orders</h2>
                <span className="card-badge">{orders.length} Records</span>
              </div>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>PO #</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.po}>
                      <td>{order.po}</td>
                      <td>{order.vendor}</td>
                      <td>₹{order.amount}</td>
                      <td>
                        <span className={`po-status-badge ${STATUS_CLASS[order.status] || 'po-status-draft'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Spending Insights */}
            <div className="insights-card">
              <div className="card-header">
                <h2 className="card-title">Spending Trends</h2>
                <span className="card-badge">Last 6 Months</span>
              </div>
              <div className="insights-body">
                <div className="mini-chart">
                  <div className="chart-bar chart-bar-1" title="Jan" />
                  <div className="chart-bar chart-bar-2" title="Feb" />
                  <div className="chart-bar chart-bar-3" title="Mar" />
                  <div className="chart-bar chart-bar-4" title="Apr" />
                  <div className="chart-bar chart-bar-5" title="May" />
                  <div className="chart-bar chart-bar-6" title="Jun" />
                </div>
                <div className="chart-months">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>

                <div className="spending-breakdown">
                  {[
                    { label: 'IT & Technology', pct: 42, color: '#1428a0' },
                    { label: 'Infrastructure', pct: 28, color: '#4b7fff' },
                    { label: 'Logistics', pct: 18, color: '#27ae60' },
                    { label: 'Others', pct: 12, color: '#f39c12' },
                  ].map((item) => (
                    <div className="breakdown-item" key={item.label}>
                      <div className="breakdown-dot" style={{ background: item.color }} />
                      <span className="breakdown-label">{item.label}</span>
                      <div className="breakdown-bar-track">
                        <div className="breakdown-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                      </div>
                      <span className="breakdown-pct">{item.pct}%</span>
                    </div>
                  ))}
                </div>

                <p className="insight-desc">
                  Track purchase spending, approvals, and invoice turnaround in one unified place.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <button
              className="action-card"
              onClick={() => alert('New RFQ flow coming soon')}
            >
              <div className="action-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="action-label">New RFQ</span>
              <span className="action-desc">Create a new request for quotation</span>
            </button>

            <button
              className="action-card"
              onClick={() => onNavigate && onNavigate('vendors')}
            >
              <div className="action-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <span className="action-label">Add Vendor</span>
              <span className="action-desc">Register a new supplier profile</span>
            </button>

            <button
              className="action-card"
              onClick={() => alert('View invoices flow coming soon')}
            >
              <div className="action-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <span className="action-label">View Invoices</span>
              <span className="action-desc">Review all pending invoices</span>
            </button>
          </section>

        </div>
    </div>
    </div >
  );
}

export default DashboardPage;
