import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/approval.css';

function ApprovalPage({ apiBase, user, onNavigate, onLogout }) {
  const [quotations, setQuotations] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('quotations'); // 'quotations' | 'bills'
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [remarks, setRemarks] = useState({});      // keyed by quotation_id
  const [loadingId, setLoadingId] = useState(null); // which quotation / bill is being actioned
  const [toast, setToast] = useState(null);         // { type: 'success'|'error', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = async () => {
    try {
      const [qRes, rRes, aRes, iRes] = await Promise.all([
        fetch(`${apiBase}/quotations`),
        fetch(`${apiBase}/rfqs`),
        fetch(`${apiBase}/approvals`),
        fetch(`${apiBase}/invoices`),
      ]);
      const [qData, rData, aData, iData] = await Promise.all([
        qRes.json(),
        rRes.json(),
        aRes.json(),
        iRes.json(),
      ]);
      if (qRes.ok) setQuotations(qData.quotations || []);
      if (rRes.ok) setRfqs(rData.rfqs || []);
      if (aRes.ok) setApprovals(aData.approvals || []);
      if (iRes.ok) setInvoices(iData.invoices || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Group quotations by RFQ
  const quotationsByRfq = useMemo(() => {
    const map = {};
    quotations.forEach((q) => {
      if (!map[q.rfq_id]) map[q.rfq_id] = [];
      map[q.rfq_id].push(q);
    });
    return map;
  }, [quotations]);

  // RFQs that have at least one quotation
  const rfqsWithQuotations = useMemo(
    () => rfqs.filter((r) => quotationsByRfq[r.id]?.length > 0),
    [rfqs, quotationsByRfq]
  );

  const selectedRfq = rfqs.find((r) => String(r.id) === String(selectedRfqId));
  const compareQuotations = selectedRfqId ? (quotationsByRfq[selectedRfqId] || []) : [];

  // Latest approval for a quotation
  const latestApproval = (quotationId) =>
    approvals
      .filter((a) => a.quotation_id === quotationId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

  // Lowest total among compared quotations
  const lowestTotal = compareQuotations.length
    ? Math.min(...compareQuotations.map((q) => q.total_amount))
    : null;

  const summaryStats = useMemo(() => ({
    totalQuotations: quotations.length,
    approved: quotations.filter((q) => q.status === 'Approved').length,
    rejected: quotations.filter((q) => q.status === 'Rejected').length,
    pending: quotations.filter((q) => q.status !== 'Approved' && q.status !== 'Rejected').length,
  }), [quotations]);

  const billStats = useMemo(() => ({
    totalBills: invoices.length,
    pending: invoices.filter((i) => i.status === 'Pending Approval').length,
    approved: invoices.filter((i) => i.status === 'Pending Payment' || i.status === 'Paid').length,
    rejected: invoices.filter((i) => i.status === 'Rejected').length,
  }), [invoices]);

  const handleApprove = async (quotationId) => {
    setLoadingId(quotationId);
    try {
      const res = await fetch(`${apiBase}/quotations/${quotationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: remarks[quotationId] || '' }),
      });
      const data = await res.json();
      if (!res.ok) { showToast('error', data.error || 'Approval failed.'); return; }
      showToast('success', `✅ Quotation #${quotationId} approved! PO & Bill auto-generated.`);
      setRemarks((r) => ({ ...r, [quotationId]: '' }));
      fetchAll();
    } catch (err) {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (quotationId) => {
    setLoadingId(quotationId);
    try {
      const res = await fetch(`${apiBase}/quotations/${quotationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: remarks[quotationId] || '' }),
      });
      const data = await res.json();
      if (!res.ok) { showToast('error', data.error || 'Rejection failed.'); return; }
      showToast('success', `❌ Quotation #${quotationId} rejected.`);
      setRemarks((r) => ({ ...r, [quotationId]: '' }));
      fetchAll();
    } catch (err) {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleApproveBill = async (invoiceId) => {
    setLoadingId(invoiceId);
    try {
      const res = await fetch(`${apiBase}/invoices/${invoiceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) { showToast('error', data.error || 'Bill approval failed.'); return; }
      showToast('success', `✅ Bill #${invoiceId} approved and generated!`);
      fetchAll();
    } catch (err) {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectBill = async (invoiceId) => {
    setLoadingId(invoiceId);
    try {
      const res = await fetch(`${apiBase}/invoices/${invoiceId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) { showToast('error', data.error || 'Bill rejection failed.'); return; }
      showToast('success', `❌ Bill #${invoiceId} rejected.`);
      fetchAll();
    } catch (err) {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusInfo = (q) => {
    const appr = latestApproval(q.id);
    const status = appr?.status || q.status || 'Pending';
    return status;
  };

  const statusClass = (status) => {
    if (status === 'Approved' || status === 'Paid' || status === 'Pending Payment') return 'apv-badge apv-badge-approved';
    if (status === 'Rejected') return 'apv-badge apv-badge-rejected';
    return 'apv-badge apv-badge-pending';
  };

  return (
    <div className="approval-container">
      <Sidebar user={user} activePage="approvals" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="approval-main">
        <div className="approval-page">

          {/* Toast */}
          {toast && (
            <div className={`apv-toast apv-toast-${toast.type}`}>{toast.msg}</div>
          )}

          {/* Header */}
          <header className="approval-header">
            <div>
              <h2>Approval Workflow</h2>
              <p>Compare vendor quotations per RFQ and approve or reject each bid. Approved quotations auto-generate a PO and Invoice.</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => onNavigate('po-invoice')}>
                📄 View PO &amp; Invoices
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('dashboard')}>Back to Dashboard</button>
            </div>
          </header>

          {/* Tabs */}
          <div className="apv-tabs">
            <button className={`apv-tab ${activeTab === 'quotations' ? 'active' : ''}`} onClick={() => setActiveTab('quotations')}>
              📋 Quotation Approvals ({summaryStats.pending} pending)
            </button>
            <button className={`apv-tab ${activeTab === 'bills' ? 'active' : ''}`} onClick={() => setActiveTab('bills')}>
              🧾 Bill Approvals ({billStats.pending} pending)
            </button>
          </div>

          {/* Stats */}
          <section className="approval-stats-grid">
            {activeTab === 'quotations' ? (
              <>
                <article className="approval-stat-card">
                  <span>Total Quotations</span>
                  <strong>{summaryStats.totalQuotations}</strong>
                </article>
                <article className="approval-stat-card apv-stat-approved">
                  <span>Approved</span>
                  <strong>{summaryStats.approved}</strong>
                </article>
                <article className="approval-stat-card apv-stat-rejected">
                  <span>Rejected</span>
                  <strong>{summaryStats.rejected}</strong>
                </article>
                <article className="approval-stat-card apv-stat-pending">
                  <span>Pending Review</span>
                  <strong>{summaryStats.pending}</strong>
                </article>
              </>
            ) : (
              <>
                <article className="approval-stat-card">
                  <span>Total Bills</span>
                  <strong>{billStats.totalBills}</strong>
                </article>
                <article className="approval-stat-card apv-stat-approved">
                  <span>Approved Bills</span>
                  <strong>{billStats.approved}</strong>
                </article>
                <article className="approval-stat-card apv-stat-rejected">
                  <span>Rejected Bills</span>
                  <strong>{billStats.rejected}</strong>
                </article>
                <article className="approval-stat-card apv-stat-pending">
                  <span>Pending Approval</span>
                  <strong>{billStats.pending}</strong>
                </article>
              </>
            )}
          </section>

          {/* ── Quotation Approvals Tab ── */}
          {activeTab === 'quotations' && (
            <>
              {/* RFQ Selector */}
              <section className="apv-rfq-selector-card">
                <div className="apv-rfq-selector-left">
                  <span className="apv-rfq-icon">📋</span>
                  <div>
                    <div className="apv-rfq-selector-label">Select RFQ to Compare Quotations</div>
                    <div className="apv-rfq-selector-hint">Choose an RFQ to view all vendor quotations side-by-side</div>
                  </div>
                </div>
                <select
                  className="apv-rfq-select"
                  value={selectedRfqId}
                  onChange={(e) => setSelectedRfqId(e.target.value)}
                >
                  <option value="">— Select RFQ —</option>
                  {rfqsWithQuotations.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} — {r.title} ({quotationsByRfq[r.id]?.length || 0} quotations)
                    </option>
                  ))}
                </select>
              </section>

              {/* Comparison Table */}
              {selectedRfqId && compareQuotations.length > 0 && (
                <section className="apv-compare-section">
                  <div className="apv-compare-header">
                    <div>
                      <h3 className="apv-compare-title">Quotation Comparison</h3>
                      {selectedRfq && (
                        <p className="apv-compare-sub">
                          RFQ: <strong>{selectedRfq.title}</strong> &nbsp;|&nbsp;
                          Category: <strong>{selectedRfq.category}</strong> &nbsp;|&nbsp;
                          Deadline: <strong>{new Date(selectedRfq.deadline).toLocaleDateString('en-GB')}</strong> &nbsp;|&nbsp;
                          {compareQuotations.length} vendor{compareQuotations.length !== 1 ? 's' : ''} responded
                        </p>
                      )}
                    </div>
                    <span className="apv-lowest-hint">
                      <span className="apv-green-dot" /> Green highlight = Lowest price
                    </span>
                  </div>

                  {/* Side-by-side vendor cards */}
                  <div className="apv-cards-grid" style={{ gridTemplateColumns: `repeat(${Math.min(compareQuotations.length, 3)}, 1fr)` }}>
                    {compareQuotations.map((q) => {
                      const status = getStatusInfo(q);
                      const isLowest = q.total_amount === lowestTotal;
                      const appr = latestApproval(q.id);
                      const isApproved = status === 'Approved';
                      const isRejected = status === 'Rejected';
                      const isPending = !isApproved && !isRejected;
                      const cgst = q.total_amount * 0.09;
                      const sgst = q.total_amount * 0.09;
                      const grandTotal = q.total_amount + cgst + sgst;

                      return (
                        <div
                          key={q.id}
                          className={`apv-vendor-card ${isLowest ? 'apv-vendor-card-best' : ''} ${isApproved ? 'apv-vendor-card-approved' : ''} ${isRejected ? 'apv-vendor-card-rejected' : ''}`}
                        >
                          <div className="apv-vc-top">
                            <div className="apv-vc-vendor-name">
                              <div className="apv-vc-avatar">
                                {(q.vendor?.company_name || 'V').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="apv-vc-name">{q.vendor?.company_name || `Vendor ${q.vendor_id}`}</div>
                                <div className="apv-vc-gst">{q.vendor?.gst_number || '—'}</div>
                              </div>
                            </div>
                            <div className="apv-vc-badges">
                              {isLowest && <span className="apv-lowest-tag">🏆 Lowest</span>}
                              <span className={statusClass(status)}>{status}</span>
                            </div>
                          </div>

                          <div className="apv-vc-metrics">
                            <div className="apv-vc-metric">
                              <span className="apv-vc-metric-label">Subtotal</span>
                              <span className="apv-vc-metric-val">₹{q.total_amount.toLocaleString()}</span>
                            </div>
                            <div className="apv-vc-metric">
                              <span className="apv-vc-metric-label">CGST (9%)</span>
                              <span className="apv-vc-metric-val">₹{Math.round(cgst).toLocaleString()}</span>
                            </div>
                            <div className="apv-vc-metric">
                              <span className="apv-vc-metric-label">SGST (9%)</span>
                              <span className="apv-vc-metric-val">₹{Math.round(sgst).toLocaleString()}</span>
                            </div>
                            <div className="apv-vc-metric apv-vc-metric-grand">
                              <span className="apv-vc-metric-label">Grand Total</span>
                              <span className="apv-vc-metric-val apv-grand-val">₹{Math.round(grandTotal).toLocaleString()}</span>
                            </div>
                            <div className="apv-vc-metric">
                              <span className="apv-vc-metric-label">Delivery</span>
                              <span className="apv-vc-metric-val">{q.delivery_days || '—'} days</span>
                            </div>
                            <div className="apv-vc-metric">
                              <span className="apv-vc-metric-label">Quotation #</span>
                              <span className="apv-vc-metric-val">#{q.id}</span>
                            </div>
                          </div>

                          {appr && (
                            <div className="apv-vc-hist">
                              <span className="apv-vc-hist-label">Last Action</span>
                              <div className="apv-vc-hist-row">
                                <span className={statusClass(appr.status)}>{appr.status}</span>
                                <span className="apv-vc-hist-date">{new Date(appr.created_at).toLocaleDateString('en-GB')}</span>
                              </div>
                              {appr.remarks && <p className="apv-vc-hist-remarks">"{appr.remarks}"</p>}
                            </div>
                          )}

                          {isPending && (
                            <div className="apv-vc-action">
                              <textarea
                                className="apv-vc-remarks"
                                placeholder="Add remarks (optional)…"
                                value={remarks[q.id] || ''}
                                onChange={(e) => setRemarks((r) => ({ ...r, [q.id]: e.target.value }))}
                                rows={2}
                              />
                              <div className="apv-vc-btns">
                                <button
                                  className="apv-btn-approve"
                                  disabled={loadingId === q.id}
                                  onClick={() => handleApprove(q.id)}
                                >
                                  {loadingId === q.id ? '…' : '✓ Approve'}
                                </button>
                                <button
                                  className="apv-btn-reject"
                                  disabled={loadingId === q.id}
                                  onClick={() => handleReject(q.id)}
                                >
                                  {loadingId === q.id ? '…' : '✕ Reject'}
                                </button>
                              </div>
                            </div>
                          )}

                          {isApproved && (
                            <div className="apv-vc-approved-info">
                              <span>🎉 PO &amp; Bill auto-generated</span>
                              <button className="apv-link-btn" onClick={() => onNavigate('po-invoice')}>
                                View PO &amp; Bill →
                              </button>
                            </div>
                          )}

                          {isRejected && (
                            <div className="apv-vc-rejected-info">
                              <span>❌ This quotation was rejected</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="apv-compare-table-wrap">
                    <table className="apv-compare-table">
                      <thead>
                        <tr>
                          <th className="apv-th-crit">Criteria</th>
                          {compareQuotations.map((q) => (
                            <th key={q.id} className={q.total_amount === lowestTotal ? 'apv-th-best' : ''}>
                              {q.vendor?.company_name || `Vendor ${q.vendor_id}`}
                              {q.total_amount === lowestTotal && <span className="apv-lowest-tag apv-lowest-tag-sm">Lowest</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Subtotal', key: (q) => `₹${q.total_amount.toLocaleString()}` },
                          { label: 'CGST (9%)', key: (q) => `₹${Math.round(q.total_amount * 0.09).toLocaleString()}` },
                          { label: 'SGST (9%)', key: (q) => `₹${Math.round(q.total_amount * 0.09).toLocaleString()}` },
                          { label: 'Grand Total (incl. GST)', key: (q) => `₹${Math.round(q.total_amount * 1.18).toLocaleString()}`, bold: true },
                          { label: 'Delivery (days)', key: (q) => q.delivery_days || '—' },
                          { label: 'Status', key: (q) => getStatusInfo(q) },
                        ].map((row) => (
                          <tr key={row.label}>
                            <td className="apv-td-crit">{row.label}</td>
                            {compareQuotations.map((q) => (
                              <td
                                key={q.id}
                                className={`${q.total_amount === lowestTotal ? 'apv-td-best' : ''} ${row.bold ? 'apv-td-bold' : ''}`}
                              >
                                {row.key(q)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {selectedRfqId && compareQuotations.length === 0 && (
                <div className="apv-empty-compare">
                  <span>📭</span>
                  <p>No quotations received for this RFQ yet.</p>
                </div>
              )}

              {!selectedRfqId && (
                <div className="apv-empty-compare">
                  <span>📋</span>
                  <p>Select an RFQ above to compare vendor quotations and take action.</p>
                </div>
              )}

              {/* All Quotations Table */}
              <section className="approval-table-card">
                <div className="card-title">All Quotations</div>
                <div className="approval-table-wrapper">
                  <table className="approval-table">
                    <thead>
                      <tr>
                        <th>Quot. #</th>
                        <th>RFQ</th>
                        <th>Vendor</th>
                        <th>Subtotal</th>
                        <th>Grand Total (18% GST)</th>
                        <th>Delivery</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.length === 0 ? (
                        <tr><td colSpan="8" className="empty-state">No quotations yet.</td></tr>
                      ) : (
                        quotations.map((q) => {
                          const status = getStatusInfo(q);
                          const isPending = status !== 'Approved' && status !== 'Rejected';
                          const grandTotal = Math.round(q.total_amount * 1.18);
                          return (
                            <tr key={q.id} className={status === 'Approved' ? 'apv-row-approved' : status === 'Rejected' ? 'apv-row-rejected' : ''}>
                              <td><strong>#{q.id}</strong></td>
                              <td>#{q.rfq_id} {q.rfq?.title ? `— ${q.rfq.title}` : ''}</td>
                              <td>{q.vendor?.company_name || `Vendor ${q.vendor_id}`}</td>
                              <td>₹{q.total_amount.toLocaleString()}</td>
                              <td><strong>₹{grandTotal.toLocaleString()}</strong></td>
                              <td>{q.delivery_days} days</td>
                              <td><span className={statusClass(status)}>{status}</span></td>
                              <td>
                                {isPending ? (
                                  <div className="apv-tbl-btns">
                                    <button
                                      className="apv-tbl-approve"
                                      disabled={loadingId === q.id}
                                      onClick={() => handleApprove(q.id)}
                                    >
                                      {loadingId === q.id ? '…' : '✓ Approve'}
                                    </button>
                                    <button
                                      className="apv-tbl-reject"
                                      disabled={loadingId === q.id}
                                      onClick={() => handleReject(q.id)}
                                    >
                                      {loadingId === q.id ? '…' : '✕ Reject'}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="apv-tbl-done">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* ── Bill Approvals Tab ── */}
          {activeTab === 'bills' && (
            <section className="approval-table-card">
              <div className="card-title">Pending Bills &amp; Invoices Approval</div>
              <div className="approval-table-wrapper">
                <table className="approval-table">
                  <thead>
                    <tr>
                      <th>Bill #</th>
                      <th>PO Ref</th>
                      <th>Vendor</th>
                      <th>Subtotal</th>
                      <th>Grand Total</th>
                      <th>Date Created</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr><td colSpan="8" className="empty-state">No bills or invoices found.</td></tr>
                    ) : (
                      invoices.map((inv) => {
                        const status = inv.status;
                        const isPending = status === 'Pending Approval';
                        return (
                          <tr key={inv.id} className={status === 'Pending Payment' || status === 'Paid' ? 'apv-row-approved' : status === 'Rejected' ? 'apv-row-rejected' : ''}>
                            <td><strong>{inv.invoice_number}</strong></td>
                            <td>{inv.purchase_order?.po_number || '—'}</td>
                            <td>{inv.purchase_order?.quotation?.vendor?.company_name || '—'}</td>
                            <td>₹{Math.round(inv.subtotal).toLocaleString()}</td>
                            <td><strong>₹{Math.round(inv.grand_total).toLocaleString()}</strong></td>
                            <td>{new Date(inv.created_at).toLocaleDateString('en-GB')}</td>
                            <td><span className={statusClass(status)}>{status}</span></td>
                            <td>
                              {isPending ? (
                                <div className="apv-tbl-btns">
                                  <button
                                    className="apv-tbl-approve"
                                    disabled={loadingId === inv.id}
                                    onClick={() => handleApproveBill(inv.id)}
                                  >
                                    {loadingId === inv.id ? '…' : '✓ Approve'}
                                  </button>
                                  <button
                                    className="apv-tbl-reject"
                                    disabled={loadingId === inv.id}
                                    onClick={() => handleRejectBill(inv.id)}
                                  >
                                    {loadingId === inv.id ? '…' : '✕ Reject'}
                                  </button>
                                </div>
                              ) : (
                                <span className="apv-tbl-done">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

export default ApprovalPage;
