import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/activity.css';

const ALL_LOGS = [
  {
    id: 1,
    type: 'Quotations',
    icon: 'check',
    iconColor: '#059669',
    title: 'Quotation selected — Infra supplies pvt ltd selected for office furniture Q2',
    date: '23 May 2025, 9:15 PM',
  },
  {
    id: 2,
    type: 'Approvals',
    icon: 'clock',
    iconColor: '#d97706',
    title: 'Approval pending — PO-2024 awaiting L2 approval by Priya Shah',
    date: '22 May 2025, 09:15 AM',
  },
  {
    id: 3,
    type: 'RFQ',
    icon: 'file',
    iconColor: '#1428a0',
    title: 'RFQ published — Office furniture Q2 sent to 3 vendors',
    date: '19 May 2025',
  },
  {
    id: 4,
    type: 'Vendors',
    icon: 'user',
    iconColor: '#dc2626',
    title: 'Vendor added — FastLog transport registered and pending verification',
    date: '18 May 2025, 3:20 PM',
  },
  {
    id: 5,
    type: 'Invoices',
    icon: 'invoice',
    iconColor: '#7c3aed',
    title: 'Invoice INV-0031 raised — ₹1,42,000 from TechCore Ltd, due in 14 days',
    date: '17 May 2025, 11:00 AM',
  },
  {
    id: 6,
    type: 'Approvals',
    icon: 'check',
    iconColor: '#059669',
    title: 'PO-2023 approved — Final sign-off by Rahul Mehta',
    date: '15 May 2025, 4:45 PM',
  },
];

const FILTERS = ['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'];

const LogIcon = ({ type, color }) => {
  const style = { color };
  if (type === 'check') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
  if (type === 'clock') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
  if (type === 'file') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
  if (type === 'user') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
  // invoice
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
};

function ActivityPage({ user, onNavigate, onLogout }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? ALL_LOGS
    : ALL_LOGS.filter((l) => l.type === activeFilter);

  return (
    <div className="activity-container">
      <Sidebar user={user} activePage="activity" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="activity-main">
        <div className="activity-page">
          {/* Header */}
          <header className="activity-header">
            <div>
              <h2>Activity &amp; Logs</h2>
              <p>Procurement audit trail</p>
            </div>
            <span className="activity-role-badge">{user?.role || 'Officer'}</span>
          </header>

          {/* Filter Tabs */}
          <div className="activity-filter-bar">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`activity-filter-btn ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Log List */}
          <div className="activity-log-list">
            {filtered.length === 0 ? (
              <div className="activity-empty">No activity found for this filter.</div>
            ) : (
              filtered.map((log, i) => (
                <div key={log.id} className="activity-log-item">
                  <div className="log-icon-wrap" style={{ background: `${log.iconColor}14`, borderColor: `${log.iconColor}30` }}>
                    <LogIcon type={log.icon} color={log.iconColor} />
                  </div>
                  <div className="log-content">
                    <div className="log-type-badge" style={{ color: log.iconColor, background: `${log.iconColor}12` }}>
                      {log.type}
                    </div>
                    <p className="log-title">{log.title}</p>
                    <span className="log-date">{log.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;
