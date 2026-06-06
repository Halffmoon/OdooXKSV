import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/approval.css';

function ApprovalPage({ apiBase, user, onNavigate, onLogout }) {
  const [approvals, setApprovals] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [status, setStatus] = useState('Approved');
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchApprovals = async () => {
    try {
      const res = await fetch(`${apiBase}/approvals`);
      const data = await res.json();
      if (res.ok) {
        setApprovals(data.approvals || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${apiBase}/quotations`);
      const data = await res.json();
      if (res.ok) {
        setQuotations(data.quotations || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApprovals();
    fetchQuotations();
  }, []);

  const selectedQuotation = useMemo(
    () => quotations.find((quotation) => quotation.id === Number(selectedQuotationId)),
    [quotations, selectedQuotationId],
  );

  const selectedApprovals = useMemo(
    () => approvals.filter((approval) => approval.quotation_id === Number(selectedQuotationId)),
    [approvals, selectedQuotationId],
  );

  const summaryStats = useMemo(() => ({
    total: approvals.length,
    approved: approvals.filter((item) => item.status === 'Approved').length,
    rejected: approvals.filter((item) => item.status === 'Rejected').length,
    pending: approvals.filter((item) => item.status === 'Pending' || item.status === 'Submitted').length,
  }), [approvals]);

  const latestApproval = selectedApprovals.length > 0 ? selectedApprovals[0] : null;
  const activeStep = latestApproval?.status === 'Approved'
    ? 3
    : latestApproval?.status === 'Rejected'
      ? 2
      : 1;

  const createApproval = async (action) => {
    if (!selectedQuotationId) {
      setError('Please select a quotation before submitting approval.');
      setMessage('');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const approvalId = `APR-${Date.now()}`;
      const res = await fetch(`${apiBase}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotation_id: Number(selectedQuotationId),
          approval_id: approvalId,
          status: action,
          remarks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to submit approval.');
        return;
      }
      setMessage(`Approval ${action.toLowerCase()} successfully submitted.`);
      setRemarks('');
      setStatus('Approved');
      fetchApprovals();
    } catch (err) {
      console.error(err);
      setError('Unable to submit approval.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="approval-container">
      <Sidebar user={user} activePage="approvals" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="approval-main">
        <div className="approval-page">
          <header className="approval-header">
            <div>
              <h2>Approval Workflow</h2>
              <p>Review quotations, approve supplier bids, and track each approval stage in a modern procurement experience.</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => onNavigate('dashboard')}>Back to dashboard</button>
            </div>
          </header>

      <section className="approval-stats-grid">
        <article className="approval-stat-card">
          <span>Total approvals</span>
          <strong>{summaryStats.total}</strong>
        </article>
        <article className="approval-stat-card">
          <span>Approved</span>
          <strong>{summaryStats.approved}</strong>
        </article>
        <article className="approval-stat-card">
          <span>Rejected</span>
          <strong>{summaryStats.rejected}</strong>
        </article>
        <article className="approval-stat-card">
          <span>Pending review</span>
          <strong>{summaryStats.pending}</strong>
        </article>
      </section>

      <section className="approval-grid">
        <div className="approval-workflow-card">
          <div className="approval-card-title">Approval details</div>
          <div className="approval-selection-row">
            <div>
              <label>Quotation</label>
              <select value={selectedQuotationId} onChange={(e) => setSelectedQuotationId(e.target.value)}>
                <option value="">Select quotation</option>
                {quotations.map((quotation) => (
                  <option key={quotation.id} value={quotation.id}>
                    #{quotation.id} — {quotation.vendor?.company_name || 'Vendor'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Approval status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Approved">Approve</option>
                <option value="Rejected">Reject</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="workflow-steps">
            {[
              { label: 'Submitted', description: 'Request created and awaiting review' },
              { label: 'L2 approval', description: 'Procurement and finance validation' },
              { label: 'Generate PO', description: 'Ready to convert to purchase order' },
            ].map((step, index) => {
              const stepIndex = index + 1;
              const isActive = stepIndex <= activeStep;
              return (
                <div key={step.label} className={`workflow-step ${isActive ? 'active' : ''}`}>
                  <div className="workflow-step-badge">{stepIndex}</div>
                  <div>
                    <strong>{step.label}</strong>
                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="approval-chain-panel">
            <div className="panel-title">Approval chain</div>
            {selectedApprovals.length === 0 ? (
              <div className="empty-state">Select a quotation to view approval history and comments.</div>
            ) : (
              selectedApprovals.map((approval) => (
                <div key={approval.id} className="approval-chain-item">
                  <div className="approval-chain-icon">✓</div>
                  <div>
                    <div className="approval-chain-title">{approval.status}</div>
                    <div className="approval-chain-meta">{new Date(approval.created_at).toLocaleString()}</div>
                    <p>{approval.remarks || 'No remarks provided.'}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="approval-form-card">
            <div className="panel-title">Approval remarks</div>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add comments, conditions, or next steps..."
            />
            <div className="approval-actions-row">
              <button type="button" disabled={loading} className="btn-primary" onClick={() => createApproval('Approved')}>
                {loading ? 'Saving...' : 'Approve'}
              </button>
              <button type="button" disabled={loading} className="btn-secondary" onClick={() => createApproval('Rejected')}>
                Reject
              </button>
              <button type="button" disabled={loading} className="btn-ghost" onClick={() => { setRemarks(''); setError(''); setMessage(''); }}>
                Clear
              </button>
            </div>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        <aside className="approval-summary-card">
          <div className="approval-card-title">Quotation summary</div>
          {selectedQuotation ? (
            <div className="summary-block">
              <div className="summary-row">
                <span>RFQ</span>
                <strong>#{selectedQuotation.rfq_id} — {selectedQuotation.rfq?.title || 'N/A'}</strong>
              </div>
              <div className="summary-row">
                <span>Vendor</span>
                <strong>{selectedQuotation.vendor?.company_name || 'Unknown'}</strong>
              </div>
              <div className="summary-row">
                <span>Total</span>
                <strong>₹{Number(selectedQuotation.total_amount).toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <strong>{selectedQuotation.delivery_days} days</strong>
              </div>
              <div className="summary-row">
                <span>Status</span>
                <strong>{latestApproval?.status || selectedQuotation.status || 'Submitted'}</strong>
              </div>
              <div className="summary-row summary-rating">
                <span>Rating</span>
                <strong>4.5/5</strong>
              </div>
            </div>
          ) : (
            <div className="empty-state">Choose a quotation to preview approval details, vendor, and timeline.</div>
          )}

          <div className="summary-callout">
            <h3>Approval action ready</h3>
            <p>Use this screen to validate quotation details and finalize the procurement approval chain in one central workflow.</p>
          </div>
        </aside>
      </section>

      <section className="approval-table-card">
        <div className="card-title">Approval history</div>
        <div className="approval-table-wrapper">
          <table className="approval-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Quotation</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {approvals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">No approval records yet.</td>
                </tr>
              ) : (
                approvals.map((approval) => (
                  <tr key={approval.id}>
                    <td>{approval.approval_id}</td>
                    <td>#{approval.quotation_id}</td>
                    <td>{approval.quotation?.vendor?.company_name || 'Vendor'}</td>
                    <td>{approval.status}</td>
                    <td>{approval.remarks || '—'}</td>
                    <td>{new Date(approval.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}

export default ApprovalPage;
