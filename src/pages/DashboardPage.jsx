function DashboardPage({ user, stats, orders, onLogout, onNavigate }) {
  const navItems = user?.role === 'Admin'
    ? ['Dashboard', 'Vendors', "RFQ's", 'Quotations', 'Approvals', 'Purchase orders', 'Invoices', 'Reports', 'Activity']
    : ['Dashboard', 'Vendors', "RFQ's", 'Quotations', 'Purchase orders', 'Invoices', 'Reports', 'Activity'];

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
              onClick={() => onNavigate && onNavigate(item === 'Vendors' ? 'vendors' : 'dashboard')}
            >
              <span className="nav-item-icon" aria-hidden="true"></span>
              <span>{item}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <div className="dashboard-title-row">
              <h2>Dashboard</h2>
              <span className="role-badge">{user?.role || 'Officer'}</span>
            </div>
            <p>{`Welcome back, ${user?.firstName || 'Procurement Officer'} - Today's Overview`}</p>
          </div>
          <button className="secondary-btn" onClick={onLogout}>
            Logout
          </button>
        </header>

        <section className="stats-grid">
          {stats.map((item) => (
            <div key={item.title} className="stat-card">
              <p>{item.title}</p>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className="content-row">
          <div className="recent-card">
            <div className="card-title">Recent Purchase Orders</div>
            <table>
              <thead>
                <tr>
                  <th>PO#</th>
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
                    <td>{order.amount}</td>
                    <td>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="insights-card">
            <div className="card-title">Spending Trends (last 6 months)</div>
            <div className="trend-box">
              <div className="trend-bar"></div>
              <div className="trend-pie"></div>
            </div>
            <p className="trend-description">
              Track purchase spending, approvals, and invoice turnaround in one place.
            </p>
          </div>
        </section>

        <section className="dashboard-actions">
          <button className="ghost-btn" onClick={() => alert('New RFQ flow coming soon')}>
            + New RFQ
          </button>
          <button className="ghost-btn" onClick={() => onNavigate && onNavigate('vendors')}>
            Add Vendor
          </button>
          <button className="ghost-btn" onClick={() => alert('View invoices flow coming soon')}>
            View Invoices
          </button>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
