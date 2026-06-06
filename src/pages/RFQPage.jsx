import { useEffect, useState } from 'react';
import '../styles/rfq.css';

function RFQPage({ apiBase, onBack }) {
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
      if (res.ok) {
        setRfqs(data.rfqs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${apiBase}/vendors`);
      const data = await res.json();
      if (res.ok) {
        setVendors(data.vendors || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRfqs();
    fetchVendors();
  }, []);

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLineItemChange = (index, field, value) => {
    setForm((current) => ({
      ...current,
      line_items: current.line_items.map((item, idx) => idx === index ? { ...item, [field]: value } : item),
    }));
  };

  const addLineItem = () => {
    setForm((current) => ({
      ...current,
      line_items: [...current.line_items, { item: '', quantity: 1, unit: '' }],
    }));
  };

  const removeLineItem = (index) => {
    setForm((current) => ({
      ...current,
      line_items: current.line_items.filter((_, idx) => idx !== index),
    }));
  };

  const handleVendorToggle = (vendorId) => {
    setForm((current) => {
      const selected = new Set(current.vendor_ids);
      if (selected.has(vendorId)) selected.delete(vendorId);
      else selected.add(vendorId);
      return {
        ...current,
        vendor_ids: [...selected],
      };
    });
  };

  const handleAttachmentsChange = (files) => {
    setForm((current) => ({
      ...current,
      attachments: Array.from(files),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!form.title || !form.category || !form.deadline) {
      setError('Please fill in title, category, and deadline.');
      return;
    }
    if (!form.line_items.length || form.line_items.some((item) => !item.item || !item.unit || item.quantity <= 0)) {
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

      const res = await fetch(`${apiBase}/rfqs`, {
        method: 'POST',
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to save RFQ.');
        return;
      }

      setMessage('RFQ created successfully.');
      setForm({
        title: '',
        category: '',
        deadline: '',
        description: '',
        line_items: [{ item: '', quantity: 1, unit: '' }],
        vendor_ids: [],
        attachments: [],
      });
      fetchRfqs();
    } catch (err) {
      console.error(err);
      setError('Unable to create RFQ.');
    } finally {
      setLoading(false);
    }
  };

  const totalLineItems = rfqs.reduce((count, rfq) => count + (rfq.line_items?.length || 0), 0);
  const totalAttachments = rfqs.reduce((count, rfq) => count + (rfq.attachments?.length || 0), 0);
  const assignedVendorCount = rfqs.reduce((count, rfq) => count + (rfq.assigned_vendors?.length || 0), 0);

  return (
    <div className="rfq-page">
      <header className="page-header rfq-header">
        <div>
          <h2>RFQ Management</h2>
          <p>Manage request-for-quotation workflows and review RFQ details from your database.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={onBack}>Back to dashboard</button>
        </div>
      </header>

      <section className="rfq-stats-grid">
        <div className="stat-card rfq-stat-card">
          <span>Total RFQs</span>
          <strong>{rfqs.length}</strong>
        </div>
        <div className="stat-card rfq-stat-card">
          <span>Line items</span>
          <strong>{totalLineItems}</strong>
        </div>
        <div className="stat-card rfq-stat-card">
          <span>Assigned vendors</span>
          <strong>{assignedVendorCount}</strong>
        </div>
        <div className="stat-card rfq-stat-card">
          <span>Attachments</span>
          <strong>{totalAttachments}</strong>
        </div>
      </section>

      <section className="rfq-grid">
        <div className="rfq-card create-card">
          <div className="card-title">Create new RFQ</div>
          <form className="rfq-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>RFQ Title</label>
              <input
                value={form.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Office furniture procurement Q2"
                required
              />
            </div>
            <div className="form-row">
              <label>Category</label>
              <input
                value={form.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                placeholder="Furniture"
                required
              />
            </div>
            <div className="form-row">
              <label>Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => handleFieldChange('deadline', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Enter description and procurement scope"
              />
            </div>

            <div className="section-title">Line items</div>
            {form.line_items.map((item, index) => (
              <div key={index} className="line-item-row">
                <input
                  value={item.item}
                  onChange={(e) => handleLineItemChange(index, 'item', e.target.value)}
                  placeholder="Item description"
                  required
                />
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))}
                  placeholder="Qty"
                />
                <input
                  value={item.unit}
                  onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)}
                  placeholder="Unit"
                />
                <button type="button" className="ghost-btn remove-btn" onClick={() => removeLineItem(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="secondary-btn small-btn" onClick={addLineItem}>
              + Add line item
            </button>

            <div className="section-title">Assign vendors</div>
            <div className="vendor-selection">
              {vendors.length === 0 && <span className="help-text">No vendors available yet.</span>}
              {vendors.map((vendor) => (
                <label key={vendor.id} className="vendor-chip">
                  <input
                    type="checkbox"
                    checked={form.vendor_ids.includes(vendor.id)}
                    onChange={() => handleVendorToggle(vendor.id)}
                  />
                  <span>{vendor.company_name}</span>
                </label>
              ))}
            </div>

            <div className="form-row">
              <label>Attachments</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleAttachmentsChange(e.target.files)}
              />
              {form.attachments.length > 0 && (
                <div className="attachment-list">
                  {form.attachments.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${index}`} className="attachment-item">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions rfq-form-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Saving RFQ...' : 'Save & Send RFQ'}
              </button>
              <button type="button" className="ghost-btn" onClick={() => {
                setForm({ title: '', category: '', deadline: '', description: '', line_items: [{ item: '', quantity: 1, unit: '' }], vendor_ids: [] });
                setError('');
                setMessage('');
              }}>
                Clear form
              </button>
            </div>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>

        <div className="rfq-card rfq-summary-card">
          <div className="card-title">Recent RFQs</div>
          <div className="rfq-list-preview">
            {rfqs.length === 0 ? (
              <div className="empty-state">No RFQs yet. Create one to start procurement tracking.</div>
            ) : (
              rfqs.slice(0, 4).map((rfq) => (
                <article key={rfq.id} className="rfq-preview-item">
                  <div className="preview-title">{rfq.title}</div>
                  <div className="preview-meta">
                    <span>{new Date(rfq.deadline).toLocaleDateString()}</span>
                    <span>{rfq.assigned_vendors?.length || 0} vendors</span>
                    <span>{rfq.line_items?.length || 0} items</span>
                  </div>
                  <p>{rfq.description || 'No description added.'}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rfq-table-card">
        <div className="card-title">RFQ database details</div>
        <table className="rfq-table">
          <thead>
            <tr>
              <th>RFQ</th>
              <th>Category</th>
              <th>Deadline</th>
              <th>Line items</th>
              <th>Assigned vendors</th>
              <th>Attachments</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.map((rfq) => (
              <tr key={rfq.id}>
                <td>{rfq.title}</td>
                <td>{rfq.category}</td>
                <td>{new Date(rfq.deadline).toLocaleDateString()}</td>
                <td>{rfq.line_items?.length || 0}</td>
                <td>{rfq.assigned_vendors?.length || 0}</td>
                <td>{rfq.attachments?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default RFQPage;
