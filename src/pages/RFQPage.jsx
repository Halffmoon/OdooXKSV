import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/rfq-page.css';

function RFQPage({ apiBase, user, onNavigate, onLogout }) {
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    deadline: '',
    description: '',
    line_items: [{ item: '', quantity: 1, unit: '' }],
    vendor_ids: [],
    attachments: [],
  });

  const fetchRfqs = async () => {
    try {
      const res = await fetch(`${apiBase}/rfqs`);
      const data = await res.json();
      if (res.ok) setRfqs(data.rfqs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${apiBase}/vendors`);
      const data = await res.json();
      if (res.ok) setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRfqs();
    fetchVendors();
  }, []);

  const handleFieldChange = (field, value) =>
    setForm((c) => ({ ...c, [field]: value }));

  const handleLineItemChange = (index, field, value) =>
    setForm((c) => ({
      ...c,
      line_items: c.line_items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));

  const addLineItem = () =>
    setForm((c) => ({
      ...c,
      line_items: [...c.line_items, { item: '', quantity: 1, unit: '' }],
    }));

  const removeLineItem = (index) =>
    setForm((c) => ({
      ...c,
      line_items: c.line_items.filter((_, idx) => idx !== index),
    }));

  const handleVendorToggle = (vendorId) =>
    setForm((c) => {
      const selected = new Set(c.vendor_ids);
      selected.has(vendorId) ? selected.delete(vendorId) : selected.add(vendorId);
      return { ...c, vendor_ids: [...selected] };
    });

  const handleAttachmentsChange = (files) =>
    setForm((c) => ({ ...c, attachments: Array.from(files) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!form.title || !form.category || !form.deadline) {
      setError('Please fill in title, category, and deadline.');
      return;
    }
    if (!form.line_items.length || form.line_items.some((i) => !i.item || !i.unit || i.quantity <= 0)) {
      setError('Please add at least one valid line item.');
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('category', form.category);
      payload.append('deadline', form.deadline);
      payload.append('description', form.description);
      payload.append('line_items', JSON.stringify(form.line_items));
      payload.append('vendor_ids', JSON.stringify(form.vendor_ids));
      form.attachments.forEach((file) => payload.append('attachments', file));

      const res = await fetch(`${apiBase}/rfqs`, { method: 'POST', body: payload });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Unable to save RFQ.'); return; }

      setMessage('RFQ created successfully.');
      setForm({ title: '', category: '', deadline: '', description: '', line_items: [{ item: '', quantity: 1, unit: '' }], vendor_ids: [], attachments: [] });
      fetchRfqs();
    } catch (err) {
      console.error(err);
      setError('Unable to create RFQ.');
    } finally {
      setLoading(false);
    }
  };

  const totalLineItems = rfqs.reduce((n, r) => n + (r.line_items?.length || 0), 0);
  const totalAttachments = rfqs.reduce((n, r) => n + (r.attachments?.length || 0), 0);
  const assignedVendorCount = rfqs.reduce((n, r) => n + (r.assigned_vendors?.length || 0), 0);

  const STAT_CARDS = [
    { label: 'Total RFQs', value: rfqs.length, color: '#1428a0', bg: 'rgba(20,40,160,0.08)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )},
    { label: 'Line Items', value: totalLineItems, color: '#27ae60', bg: 'rgba(39,174,96,0.08)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    )},
    { label: 'Assigned Vendors', value: assignedVendorCount, color: '#f39c12', bg: 'rgba(243,156,18,0.08)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )},
    { label: 'Attachments', value: totalAttachments, color: '#e74c3c', bg: 'rgba(231,76,60,0.08)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
      </svg>
    )},
  ];

  return (
    <div className="rfq-dashboard-container">
      <Sidebar user={user} activePage="rfqs" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="rfq-dashboard-main">
        {/* Header */}
        <header className="rfq-dashboard-header">
          <div className="rfq-header-left">
            <h1>RFQ Management</h1>
            <p>Manage request-for-quotation workflows and track procurement activities.</p>
          </div>
          <div className="rfq-header-right">
            <span className="rfq-header-badge">{user?.role || 'Officer'}</span>
            <button
              className="rfq-new-btn"
              onClick={() => document.getElementById('rfq-form-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New RFQ
            </button>
          </div>
        </header>

        <div className="rfq-dashboard-content">

          {/* Stats */}
          <section className="rfq-stats-row">
            {STAT_CARDS.map((card) => (
              <div key={card.label} className="rfq-stat-card" style={{ '--sc': card.color, '--sb': card.bg }}>
                <div className="rfq-stat-icon" style={{ background: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                <p className="rfq-stat-label">{card.label}</p>
                <div className="rfq-stat-value">{card.value}</div>
              </div>
            ))}
          </section>

          {/* Two-column grid */}
          <section className="rfq-content-grid">

            {/* Create Form */}
            <div className="rfq-panel" id="rfq-form-section">
              <div className="rfq-panel-header">
                <h2 className="rfq-panel-title">Create New RFQ</h2>
                <span className="rfq-panel-badge">Form</span>
              </div>

              <form className="rfq-form-inner" onSubmit={handleSubmit}>
                <div className="rfq-form-grid-2">
                  <div className="rfq-field">
                    <label>RFQ Title</label>
                    <input value={form.title} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="Office furniture procurement Q2" required />
                  </div>
                  <div className="rfq-field">
                    <label>Category</label>
                    <input value={form.category} onChange={(e) => handleFieldChange('category', e.target.value)} placeholder="Furniture" required />
                  </div>
                </div>

                <div className="rfq-field">
                  <label>Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => handleFieldChange('deadline', e.target.value)} required />
                </div>

                <div className="rfq-field">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => handleFieldChange('description', e.target.value)} placeholder="Enter description and procurement scope" rows="3" />
                </div>

                <div className="rfq-section-label">Line Items</div>
                <div className="rfq-line-items">
                  {form.line_items.map((lineItem, index) => (
                    <div key={index} className="rfq-line-item-row">
                      <input value={lineItem.item} onChange={(e) => handleLineItemChange(index, 'item', e.target.value)} placeholder="Item description" required />
                      <input
                        type="number"
                        min="1"
                        value={lineItem.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                      />
                      <select
                        value={lineItem.unit}
                        onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)}
                        className="rfq-unit-select"
                      >
                        <option value="">Unit</option>
                        <option value="nos">nos</option>
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                        <option value="ltr">ltr</option>
                        <option value="m">m</option>
                        <option value="box">box</option>
                        <option value="set">set</option>
                        <option value="ton">ton</option>
                        <option value="hr">hr</option>
                      </select>
                      <button type="button" className="rfq-remove-btn" onClick={() => removeLineItem(index)}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="rfq-add-item-btn" onClick={addLineItem}>+ Add line item</button>
                </div>

                <div className="rfq-section-label">Assign Vendors</div>
                <div className="rfq-vendor-grid">
                  {vendors.length === 0 && <span className="rfq-help">No vendors available yet.</span>}
                  {vendors.map((vendor) => (
                    <label key={vendor.id} className={`rfq-vendor-chip ${form.vendor_ids.includes(vendor.id) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={form.vendor_ids.includes(vendor.id)} onChange={() => handleVendorToggle(vendor.id)} />
                      <span>{vendor.company_name}</span>
                    </label>
                  ))}
                </div>

                <div className="rfq-field">
                  <label>Attachments</label>
                  <input type="file" multiple onChange={(e) => handleAttachmentsChange(e.target.files)} className="rfq-file-input" />
                  {form.attachments.length > 0 && (
                    <div className="rfq-attachment-list">
                      {form.attachments.map((file, i) => (
                        <div key={`${file.name}-${i}`} className="rfq-attachment-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rfq-form-actions">
                  <button type="submit" className="rfq-primary-btn" disabled={loading}>
                    {loading ? 'Saving RFQ...' : 'Save & Send RFQ'}
                  </button>
                  <button type="button" className="rfq-ghost-btn" onClick={() => {
                    setForm({ title: '', category: '', deadline: '', description: '', line_items: [{ item: '', quantity: 1, unit: '' }], vendor_ids: [], attachments: [] });
                    setError(''); setMessage('');
                  }}>
                    Clear form
                  </button>
                </div>

                {message && <div className="rfq-success-msg">{message}</div>}
                {error && <div className="rfq-error-msg">{error}</div>}
              </form>
            </div>

            {/* Recent RFQs */}
            <div className="rfq-panel">
              <div className="rfq-panel-header">
                <h2 className="rfq-panel-title">Recent RFQs</h2>
                <span className="rfq-panel-badge">{rfqs.length} Records</span>
              </div>
              <div className="rfq-recent-list">
                {rfqs.length === 0 ? (
                  <div className="rfq-empty">No RFQs yet. Create one to start procurement tracking.</div>
                ) : (
                  rfqs.slice(0, 5).map((rfq) => (
                    <div key={rfq.id} className="rfq-recent-item">
                      <div className="rfq-recent-dot" />
                      <div className="rfq-recent-info">
                        <div className="rfq-recent-title">{rfq.title}</div>
                        <div className="rfq-recent-meta">
                          <span>📅 {new Date(rfq.deadline).toLocaleDateString()}</span>
                          <span>👥 {rfq.assigned_vendors?.length || 0} vendors</span>
                          <span>📋 {rfq.line_items?.length || 0} items</span>
                        </div>
                        {rfq.description && <p className="rfq-recent-desc">{rfq.description}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Full Table */}
          <section className="rfq-table-panel">
            <div className="rfq-panel-header">
              <h2 className="rfq-panel-title">RFQ Database</h2>
              <span className="rfq-panel-badge">{rfqs.length} Total</span>
            </div>
            <div className="rfq-table-wrap">
              <table className="rfq-data-table">
                <thead>
                  <tr>
                    <th>RFQ Title</th>
                    <th>Category</th>
                    <th>Deadline</th>
                    <th>Line Items</th>
                    <th>Vendors</th>
                    <th>Attachments</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.length === 0 ? (
                    <tr><td colSpan="6" className="rfq-table-empty">No RFQs found.</td></tr>
                  ) : (
                    rfqs.map((rfq) => (
                      <tr key={rfq.id}>
                        <td className="rfq-table-title">{rfq.title}</td>
                        <td>{rfq.category}</td>
                        <td>{new Date(rfq.deadline).toLocaleDateString()}</td>
                        <td><span className="rfq-count-badge">{rfq.line_items?.length || 0}</span></td>
                        <td><span className="rfq-count-badge">{rfq.assigned_vendors?.length || 0}</span></td>
                        <td><span className="rfq-count-badge">{rfq.attachments?.length || 0}</span></td>
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

export default RFQPage;
