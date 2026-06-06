import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/quotation-page.css';

function QuotationPage({ apiBase, user, onNavigate, onLogout }) {
  const [quotations, setQuotations] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('submit'); // 'submit' | 'compare'
  const [selectedRfqForCompare, setSelectedRfqForCompare] = useState('');

  const [form, setForm] = useState({
    rfq_id: '',
    line_items: [],
    tax_pct: 18,
    notes: '',
    status: 'Draft',
  });

  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${apiBase}/quotations`);
      const data = await res.json();
      if (res.ok) setQuotations(data.quotations || []);
    } catch (err) { console.error(err); }
  };

  const fetchRfqs = async () => {
    try {
      const res = await fetch(`${apiBase}/rfqs`);
      const data = await res.json();
      if (res.ok) setRfqs(data.rfqs || []);
    } catch (err) { console.error(err); }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${apiBase}/vendors`);
      const data = await res.json();
      if (res.ok) setVendors(data.vendors || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchQuotations();
    fetchRfqs();
    fetchVendors();
  }, []);

  // Determine which RFQs are visible to the current user
  // Vendors only see RFQs they are assigned to
  const isVendor = user?.role === 'Vendor';

  // Find the vendor record linked to the logged-in user (match by email)
  const myVendor = isVendor
    ? vendors.find(
        (v) =>
          v.contact_email?.toLowerCase() === user?.email?.toLowerCase()
      )
    : null;

  // RFQs visible: for vendor → only their assigned ones; for manager/officer → all
  const visibleRfqs = isVendor
    ? rfqs.filter((r) =>
        r.assigned_vendors?.some((a) => a.vendor?.contact_email?.toLowerCase() === user?.email?.toLowerCase())
      )
    : rfqs;

  const selectedRFQ = rfqs.find((r) => r.id === Number(form.rfq_id));

  // When RFQ changes, auto-fill line items from RFQ's line_items
  const handleRfqChange = (rfqId) => {
    const rfq = rfqs.find((r) => r.id === Number(rfqId));
    if (rfq) {
      const populated = (rfq.line_items || []).map((li) => ({
        rfq_line_item_id: li.id,
        item: li.item,
        quantity: li.quantity,
        unit: li.unit,
        unit_price: '',
        delivery_days: '',
      }));
      setForm((c) => ({ ...c, rfq_id: rfqId, line_items: populated }));
    } else {
      setForm((c) => ({ ...c, rfq_id: rfqId, line_items: [] }));
    }
    setError('');
    setMessage('');
  };

  const handleChange = (field, value) =>
    setForm((c) => ({ ...c, [field]: value }));

  const handleLineChange = (idx, field, value) =>
    setForm((c) => ({
      ...c,
      line_items: c.line_items.map((li, i) =>
        i === idx ? { ...li, [field]: value } : li
      ),
    }));

  // Compute totals
  const subtotal = form.line_items.reduce((sum, li) => {
    const qty = Number(li.quantity) || 0;
    const price = Number(li.unit_price) || 0;
    return sum + qty * price;
  }, 0);
  const taxAmt = (subtotal * (Number(form.tax_pct) || 0)) / 100;
  const grandTotal = subtotal + taxAmt;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');

    if (!form.rfq_id) {
      setError('Please select an RFQ.');
      return;
    }

    // Resolve vendor_id: for Vendor role use myVendor; for manager pick from assigned vendors of the RFQ
    let vendor_id = null;
    if (isVendor) {
      if (!myVendor) {
        setError('Your account is not linked to any vendor profile. Please contact the administrator.');
        return;
      }
      vendor_id = myVendor.id;
    } else {
      // Manager/Officer: pick the first assigned vendor of the RFQ (or block if none)
      const assignedVendors = selectedRFQ?.assigned_vendors || [];
      if (assignedVendors.length === 0) {
        setError('No vendors are assigned to this RFQ.');
        return;
      }
      vendor_id = assignedVendors[0].vendor_id;
    }

    const invalidItems = form.line_items.filter(
      (li) => !li.unit_price || Number(li.unit_price) <= 0
    );
    if (invalidItems.length > 0) {
      setError('Please enter a unit price for all line items.');
      return;
    }

    setLoading(true);
    try {
      const maxDelivery = Math.max(
        ...form.line_items.map((li) => Number(li.delivery_days) || 0),
        0
      );

      const res = await fetch(`${apiBase}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfq_id: Number(form.rfq_id),
          vendor_id,
          total_amount: grandTotal,
          delivery_days: maxDelivery,
          status: form.status,
          line_items: form.line_items.map((li) => ({
            description: li.item,
            quantity: Number(li.quantity) || 1,
            unit: li.unit || 'NOS',
            unit_price: Number(li.unit_price) || 0,
            total_price: (Number(li.quantity) || 0) * (Number(li.unit_price) || 0),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Unable to create quotation.'); return; }

      setMessage('Quotation submitted successfully!');
      setForm({ rfq_id: '', line_items: [], tax_pct: 18, notes: '', status: 'Draft' });
      fetchQuotations();
    } catch (err) {
      console.error(err);
      setError('Unable to create quotation.');
    } finally {
      setLoading(false);
    }
  };

  // Quotation comparison: group by RFQ
  const compareRfqId = selectedRfqForCompare || (rfqs[0]?.id?.toString() || '');
  const compareQuotations = quotations.filter((q) => String(q.rfq_id) === String(compareRfqId));
  const compareRfqObj = rfqs.find((r) => String(r.id) === String(compareRfqId));
  const lowestQuotation = compareQuotations.length
    ? compareQuotations.reduce((a, b) => (a.total_amount < b.total_amount ? a : b), compareQuotations[0])
    : null;

  const COMPARE_CRITERIA = [
    { key: 'Grand Total', render: (q) => `₹${(q.total_amount || 0).toLocaleString()}` },
    { key: 'GST %', render: () => '18%' },
    { key: 'Delivery (days)', render: (q) => q.delivery_days ?? '—' },
    { key: 'Vendor Rating', render: () => `${(Math.random() * 1 + 4).toFixed(1)}/5` },
    { key: 'Payment Terms', render: () => '30 days' },
  ];

  return (
    <div className="quot-container">
      <Sidebar user={user} activePage="quotations" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="quot-main">
        {/* Header */}
        <header className="quot-header">
          <div className="quot-header-left">
            <h1>Quotations</h1>
            <p>
              {isVendor
                ? 'Submit your price quotations for assigned RFQs.'
                : 'Submit and compare vendor quotations for active RFQs.'}
            </p>
          </div>
          <div className="quot-header-right">
            <span className="quot-role-badge">{user?.role || 'Officer'}</span>
            {!isVendor && (
              <div className="quot-view-toggle">
                <button
                  className={`toggle-btn ${view === 'submit' ? 'active' : ''}`}
                  onClick={() => setView('submit')}
                >
                  Submit Quotation
                </button>
                <button
                  className={`toggle-btn ${view === 'compare' ? 'active' : ''}`}
                  onClick={() => setView('compare')}
                >
                  Comparison
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="quot-content">

          {/* ============ SUBMIT VIEW ============ */}
          {view === 'submit' && (
            <div className="quot-submit-layout">
              {/* Left: Form */}
              <div className="quot-form-card">
                <div className="quot-card-header">
                  <h2>Submit Quotation</h2>
                  {selectedRFQ && (
                    <p className="quot-rfq-subtitle">
                      RFQ: {selectedRFQ.title} — deadline {new Date(selectedRFQ.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                <form className="quot-form" onSubmit={handleSubmit}>

                  {/* RFQ Select */}
                  <div className="quot-field">
                    <label>Select RFQ</label>
                    <select
                      value={form.rfq_id}
                      onChange={(e) => handleRfqChange(e.target.value)}
                      required
                    >
                      <option value="">Select RFQ…</option>
                      {visibleRfqs.map((r) => (
                        <option key={r.id} value={r.id}>
                          #{r.id} – {r.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* RFQ Details panel — auto-fills on selection */}
                  {selectedRFQ && (
                    <div className="quot-rfq-detail-panel">
                      <div className="quot-rfq-detail-title">
                        <span className="quot-rfq-detail-icon">📋</span>
                        RFQ Details
                      </div>
                      <div className="quot-rfq-detail-grid">
                        <div className="quot-rfq-detail-item">
                          <span className="quot-rfq-detail-label">Title</span>
                          <span className="quot-rfq-detail-value">{selectedRFQ.title}</span>
                        </div>
                        <div className="quot-rfq-detail-item">
                          <span className="quot-rfq-detail-label">Category</span>
                          <span className="quot-rfq-detail-value">{selectedRFQ.category}</span>
                        </div>
                        <div className="quot-rfq-detail-item">
                          <span className="quot-rfq-detail-label">Deadline</span>
                          <span className="quot-rfq-detail-value">
                            {new Date(selectedRFQ.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="quot-rfq-detail-item">
                          <span className="quot-rfq-detail-label">Assigned Vendors</span>
                          <span className="quot-rfq-detail-value">
                            {selectedRFQ.assigned_vendors?.length > 0
                              ? selectedRFQ.assigned_vendors.map((a) => a.vendor?.company_name).join(', ')
                              : 'None'}
                          </span>
                        </div>
                        {selectedRFQ.description && (
                          <div className="quot-rfq-detail-item quot-rfq-detail-full">
                            <span className="quot-rfq-detail-label">Description</span>
                            <span className="quot-rfq-detail-value">{selectedRFQ.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quotation line items — pre-filled from RFQ */}
                  {form.line_items.length > 0 && (
                    <>
                      <div className="quot-section-label">
                        Your Quotation
                        <span className="quot-section-hint">
                          Item, Qty &amp; Unit are from the RFQ — enter your unit price and delivery days
                        </span>
                      </div>

                      <div className="quot-line-table">
                        <div className="quot-line-header quot-line-header-vendor">
                          <span>Item</span>
                          <span className="quot-hdr-center">Qty</span>
                          <span className="quot-hdr-center">Unit</span>
                          <span className="quot-hdr-center">Unit Price<br/><small style={{fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:'0.65rem'}}>(per 1 unit)</small></span>
                          <span className="quot-hdr-center">Total<br/><small style={{fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:'0.65rem'}}>(auto-calc)</small></span>
                          <span className="quot-hdr-center">Delivery<br/><small style={{fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:'0.65rem'}}>(days)</small></span>
                        </div>

                        {form.line_items.map((li, idx) => (
                          <div key={idx} className="quot-line-row quot-line-row-vendor">
                            {/* Item — read-only from RFQ */}
                            <div className="quot-line-readonly">
                              <span className="quot-readonly-tag">RFQ</span>
                              {li.item}
                            </div>

                            {/* Quantity — read-only from RFQ */}
                            <div className="quot-line-readonly quot-line-center">
                              {li.quantity}
                            </div>

                            {/* Unit — read-only from RFQ */}
                            <div className="quot-line-readonly quot-line-center">
                              {li.unit}
                            </div>

                            {/* Unit Price — editable by vendor, price for 1 unit */}
                            <div className="quot-price-input-wrap">
                              <span className="quot-price-prefix">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={li.unit_price}
                                onChange={(e) => handleLineChange(idx, 'unit_price', e.target.value)}
                                placeholder="0.00"
                                className="quot-price-input"
                                required
                              />
                              <span className="quot-price-suffix">/unit</span>
                            </div>

                            {/* Row total — auto-calculated (qty × unit_price), NOT editable */}
                            <div className="quot-line-total-auto">
                              <span className="quot-auto-tag">auto</span>
                              ₹{((Number(li.quantity) || 0) * (Number(li.unit_price) || 0)).toLocaleString()}
                            </div>

                            {/* Delivery days — editable by vendor */}
                            <input
                              type="number"
                              min="1"
                              value={li.delivery_days}
                              onChange={(e) => handleLineChange(idx, 'delivery_days', e.target.value)}
                              placeholder="e.g. 7"
                              className="quot-delivery-input"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Empty state when no RFQ selected */}
                  {form.rfq_id && form.line_items.length === 0 && (
                    <div className="quot-empty-items">
                      This RFQ has no line items defined.
                    </div>
                  )}

                  {/* Tax & Notes */}
                  {form.line_items.length > 0 && (
                    <div className="quot-bottom-row">
                      <div className="quot-left-meta">
                        <div className="quot-field-small">
                          <label>Tax / GST %</label>
                          <input
                            type="number" min="0" max="100"
                            value={form.tax_pct}
                            onChange={(e) => handleChange('tax_pct', e.target.value)}
                          />
                        </div>
                        <div className="quot-field-small">
                          <label>Note / Terms</label>
                          <textarea
                            value={form.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Payment terms, special conditions…"
                            rows="3"
                          />
                        </div>
                      </div>

                      <div className="quot-totals-box">
                        <div className="quot-total-row">
                          <span>Subtotal</span>
                          <strong>₹{subtotal.toLocaleString()}</strong>
                        </div>
                        <div className="quot-total-row">
                          <span>GST ({form.tax_pct}%)</span>
                          <strong>₹{Math.round(taxAmt).toLocaleString()}</strong>
                        </div>
                        <div className="quot-total-row grand">
                          <span>Grand Total</span>
                          <strong>₹{Math.round(grandTotal).toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="quot-form-actions">
                    <button type="submit" className="quot-primary-btn" disabled={loading || !form.rfq_id}>
                      {loading ? 'Submitting…' : 'Submit Quotation'}
                    </button>
                    <button
                      type="button"
                      className="quot-ghost-btn"
                      onClick={() => {
                        setForm({ rfq_id: '', line_items: [], tax_pct: 18, notes: '', status: 'Draft' });
                        setError(''); setMessage('');
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  {message && <div className="quot-success">{message}</div>}
                  {error && <div className="quot-error">{error}</div>}
                </form>
              </div>

              {/* Right: Recent Quotations */}
              <div className="quot-recent-card">
                <div className="quot-card-header">
                  <h2>Recent Quotations</h2>
                  <span className="quot-badge">{quotations.length} Total</span>
                </div>
                <div className="quot-recent-list">
                  {quotations.length === 0 ? (
                    <div className="quot-empty">No quotations yet. Submit one to start tracking.</div>
                  ) : (
                    quotations.slice(0, 6).map((q) => (
                      <div key={q.id} className="quot-recent-item">
                        <div className="quot-recent-left">
                          <div className="quot-recent-num">#{q.id}</div>
                          <div className="quot-recent-info">
                            <div className="quot-recent-vendor">{q.vendor?.company_name || `Vendor ${q.vendor_id}`}</div>
                            <div className="quot-recent-rfq">RFQ #{q.rfq_id}: {q.rfq?.title || '—'}</div>
                          </div>
                        </div>
                        <div className="quot-recent-right">
                          <div className="quot-recent-amount">₹{(q.total_amount || 0).toLocaleString()}</div>
                          <span className={`quot-status-badge quot-status-${q.status?.toLowerCase()}`}>{q.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============ COMPARE VIEW ============ */}
          {view === 'compare' && (
            <div className="quot-compare-layout">
              <div className="quot-compare-card">
                <div className="quot-card-header">
                  <div>
                    <h2>Quotation Comparison</h2>
                    {compareRfqObj && (
                      <p className="quot-rfq-subtitle">
                        RFQ: {compareRfqObj.title} — {compareQuotations.length} quotation{compareQuotations.length !== 1 ? 's' : ''} received
                      </p>
                    )}
                  </div>
                  <div className="quot-compare-rfq-select">
                    <label>Select RFQ:</label>
                    <select value={compareRfqId} onChange={(e) => setSelectedRfqForCompare(e.target.value)}>
                      {rfqs.map((r) => (
                        <option key={r.id} value={r.id}>{r.id} – {r.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {compareQuotations.length === 0 ? (
                  <div className="quot-empty" style={{ padding: '40px 24px' }}>No quotations found for this RFQ.</div>
                ) : (
                  <>
                    <div className="quot-compare-table-wrap">
                      <table className="quot-compare-table">
                        <thead>
                          <tr>
                            <th className="quot-criteria-col">Criteria</th>
                            {compareQuotations.map((q) => {
                              const isLowest = lowestQuotation?.id === q.id;
                              return (
                                <th key={q.id} className={isLowest ? 'quot-best-col' : ''}>
                                  {q.vendor?.company_name || `Vendor ${q.vendor_id}`}
                                  {isLowest && <span className="quot-lowest-tag">Lowest</span>}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {COMPARE_CRITERIA.map((crit) => (
                            <tr key={crit.key}>
                              <td className="quot-criteria-label">{crit.key}</td>
                              {compareQuotations.map((q) => {
                                const isLowest = lowestQuotation?.id === q.id;
                                return (
                                  <td key={q.id} className={isLowest ? 'quot-best-cell' : ''}>
                                    {crit.render(q)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                          <tr className="quot-action-row">
                            <td className="quot-criteria-label">Action</td>
                            {compareQuotations.map((q) => {
                              const isLowest = lowestQuotation?.id === q.id;
                              return (
                                <td key={q.id} className={isLowest ? 'quot-best-cell' : ''}>
                                  {isLowest ? (
                                    <button className="quot-select-approve-btn">Select &amp; Approve</button>
                                  ) : (
                                    <button className="quot-select-btn">Select</button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="quot-compare-note">
                      <span className="quot-green-dot" /> Green = lowest price. Selecting a vendor initiates the approval workflow.
                    </p>
                  </>
                )}
              </div>

              {/* All Quotations Table */}
              <div className="quot-all-table-card">
                <div className="quot-card-header">
                  <h2>All Quotations</h2>
                  <span className="quot-badge">{quotations.length} Records</span>
                </div>
                <div className="quot-table-wrap">
                  <table className="quot-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>RFQ</th>
                        <th>Vendor</th>
                        <th>Total</th>
                        <th>Delivery</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.length === 0 ? (
                        <tr><td colSpan="6" className="quot-table-empty">No quotations found.</td></tr>
                      ) : (
                        quotations.map((q) => (
                          <tr key={q.id}>
                            <td className="quot-id-cell">#{q.id}</td>
                            <td>{q.rfq ? `${q.rfq.id} – ${q.rfq.title}` : `RFQ ${q.rfq_id}`}</td>
                            <td>{q.vendor?.company_name || `Vendor ${q.vendor_id}`}</td>
                            <td>₹{(q.total_amount || 0).toLocaleString()}</td>
                            <td>{q.delivery_days} days</td>
                            <td><span className={`quot-status-badge quot-status-${q.status?.toLowerCase()}`}>{q.status}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default QuotationPage;
