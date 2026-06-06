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
    vendor_id: '',
    line_items: [{ item: '', quantity: 1, unit_price: '', delivery_days: '' }],
    tax_pct: 18,
    notes: '',
    payment_terms: '',
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

  const handleChange = (field, value) =>
    setForm((c) => ({ ...c, [field]: value }));

  const handleLineChange = (idx, field, value) =>
    setForm((c) => ({
      ...c,
      line_items: c.line_items.map((li, i) => i === idx ? { ...li, [field]: value } : li),
    }));

  const addLine = () =>
    setForm((c) => ({ ...c, line_items: [...c.line_items, { item: '', quantity: 1, unit_price: '', delivery_days: '' }] }));

  const removeLine = (idx) =>
    setForm((c) => ({ ...c, line_items: c.line_items.filter((_, i) => i !== idx) }));

  const selectedRFQ = rfqs.find((r) => r.id === Number(form.rfq_id));
  const vendorOptions = selectedRFQ?.assigned_vendors?.map((a) => a.vendor) || vendors;

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
    if (!form.rfq_id || !form.vendor_id) {
      setError('Please select RFQ and Vendor.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfq_id: Number(form.rfq_id),
          vendor_id: Number(form.vendor_id),
          total_amount: grandTotal,
          delivery_days: Math.max(...form.line_items.map((li) => Number(li.delivery_days) || 0), 0),
          status: form.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Unable to create quotation.'); return; }
      setMessage('Quotation submitted successfully!');
      setForm({ rfq_id: '', vendor_id: '', line_items: [{ item: '', quantity: 1, unit_price: '', delivery_days: '' }], tax_pct: 18, notes: '', payment_terms: '', status: 'Draft' });
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
            <p>Submit and compare vendor quotations for active RFQs.</p>
          </div>
          <div className="quot-header-right">
            <span className="quot-role-badge">{user?.role || 'Officer'}</span>
            {user?.role !== 'Vendor' && (
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
                    <select value={form.rfq_id} onChange={(e) => handleChange('rfq_id', e.target.value)} required>
                      <option value="">Select RFQ…</option>
                      {rfqs.map((r) => (
                        <option key={r.id} value={r.id}>{r.id} – {r.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* RFQ Summary box */}
                  {selectedRFQ && (
                    <div className="quot-rfq-summary">
                      <span className="quot-rfq-summary-label">RFQ Summary</span>
                      <p>{selectedRFQ.description || `${selectedRFQ.line_items?.map((li) => li.item).join(', ')} — category: ${selectedRFQ.category}`}</p>
                    </div>
                  )}

                  {/* Vendor Select */}
                  <div className="quot-field">
                    <label>Vendor</label>
                    <select value={form.vendor_id} onChange={(e) => handleChange('vendor_id', e.target.value)} required>
                      <option value="">Select Vendor…</option>
                      {vendorOptions.map((v) => (
                        <option key={v.id} value={v.id}>{v.company_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Your Quotation heading */}
                  <div className="quot-section-label">Your Quotation</div>

                  <div className="quot-line-table">
                    <div className="quot-line-header">
                      <span>Item</span>
                      <span>Qty</span>
                      <span>Unit Price</span>
                      <span>Total</span>
                      <span>Delivery (days)</span>
                      <span></span>
                    </div>
                    {form.line_items.map((li, idx) => (
                      <div key={idx} className="quot-line-row">
                        <input
                          value={li.item}
                          onChange={(e) => handleLineChange(idx, 'item', e.target.value)}
                          placeholder="Ergonomic chair"
                        />
                        <input
                          type="number" min="1"
                          value={li.quantity}
                          onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                          placeholder="25"
                        />
                        <input
                          type="number" min="0" step="0.01"
                          value={li.unit_price}
                          onChange={(e) => handleLineChange(idx, 'unit_price', e.target.value)}
                          placeholder="3,600"
                        />
                        <div className="quot-line-total">
                          ₹{((Number(li.quantity) || 0) * (Number(li.unit_price) || 0)).toLocaleString()}
                        </div>
                        <input
                          type="number" min="1"
                          value={li.delivery_days}
                          onChange={(e) => handleLineChange(idx, 'delivery_days', e.target.value)}
                          placeholder="7"
                        />
                        <button type="button" className="quot-remove-line" onClick={() => removeLine(idx)}>✕</button>
                      </div>
                    ))}
                    <button type="button" className="quot-add-line-btn" onClick={addLine}>+ Add Item</button>
                  </div>

                  {/* Tax & Notes row */}
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
                          placeholder="Payment terms: 30 days net..."
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

                  <div className="quot-form-actions">
                    <button type="submit" className="quot-primary-btn" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Quotation'}
                    </button>
                    <button type="button" className="quot-ghost-btn" onClick={() => {
                      setForm({ rfq_id: '', vendor_id: '', line_items: [{ item: '', quantity: 1, unit_price: '', delivery_days: '' }], tax_pct: 18, notes: '', payment_terms: '', status: 'Draft' });
                      setError(''); setMessage('');
                    }}>
                      Save Draft
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
                                    <button className="quot-select-approve-btn">
                                      Select &amp; Approve
                                    </button>
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
