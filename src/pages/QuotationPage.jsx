import { useEffect, useState } from 'react';
import '../styles/rfq.css';

function QuotationPage({ apiBase, onBack }) {
  const [quotations, setQuotations] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    rfq_id: '',
    vendor_id: '',
    total_amount: '',
    delivery_days: '',
    status: 'Draft',
  });

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
    fetchQuotations();
    fetchRfqs();
    fetchVendors();
  }, []);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectedRFQ = rfqs.find((rfq) => rfq.id === Number(form.rfq_id));
  const vendorOptions = selectedRFQ?.assigned_vendors?.map((assignment) => assignment.vendor) || vendors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.rfq_id || !form.vendor_id || !form.total_amount || !form.delivery_days || !form.status) {
      setError('Please fill in each quotation field.');
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
          total_amount: Number(form.total_amount),
          delivery_days: Number(form.delivery_days),
          status: form.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to create quotation.');
        return;
      }
      setMessage('Quotation created successfully.');
      setForm({ rfq_id: '', vendor_id: '', total_amount: '', delivery_days: '', status: 'Draft' });
      fetchQuotations();
    } catch (err) {
      console.error(err);
      setError('Unable to create quotation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rfq-page">
      <header className="page-header rfq-header">
        <div>
          <h2>Quotation Management</h2>
          <p>Create and manage quotations linked to RFQs, vendors, and procurement details.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={onBack}>Back to dashboard</button>
        </div>
      </header>

      <section className="rfq-grid">
        <div className="rfq-card create-card">
          <div className="card-title">Create new Quotation</div>
          <form className="rfq-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>RFQ</label>
              <select
                value={form.rfq_id}
                onChange={(e) => handleChange('rfq_id', e.target.value)}
                required
              >
                <option value="">Select RFQ</option>
                {rfqs.map((rfq) => (
                  <option key={rfq.id} value={rfq.id}>
                    {rfq.id} - {rfq.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Vendor</label>
              <select
                value={form.vendor_id}
                onChange={(e) => handleChange('vendor_id', e.target.value)}
                required
              >
                <option value="">Select vendor</option>
                {vendorOptions.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.company_name}
                  </option>
                ))}
              </select>
              {selectedRFQ && selectedRFQ.assigned_vendors?.length === 0 && (
                <small className="help-text">This RFQ has no assigned vendors yet. Use the full vendor list.</small>
              )}
            </div>

            <div className="form-row">
              <label>Total amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.total_amount}
                onChange={(e) => handleChange('total_amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-row">
              <label>Delivery days</label>
              <input
                type="number"
                min="1"
                value={form.delivery_days}
                onChange={(e) => handleChange('delivery_days', e.target.value)}
                placeholder="7"
                required
              />
            </div>

            <div className="form-row">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                required
              >
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="form-actions rfq-form-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Saving Quotation...' : 'Save Quotation'}
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setForm({ rfq_id: '', vendor_id: '', total_amount: '', delivery_days: '', status: 'Draft' });
                  setError('');
                  setMessage('');
                }}
              >
                Clear form
              </button>
            </div>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>

        <div className="rfq-card rfq-summary-card">
          <div className="card-title">Recent Quotations</div>
          <div className="rfq-list-preview">
            {quotations.length === 0 ? (
              <div className="empty-state">No quotations yet. Create one to start tracking.</div>
            ) : (
              quotations.slice(0, 4).map((quotation) => (
                <article key={quotation.id} className="rfq-preview-item">
                  <div className="preview-title">Quotation #{quotation.id}</div>
                  <div className="preview-meta">
                    <span>{quotation.vendor?.company_name || 'Unknown vendor'}</span>
                    <span>{quotation.status}</span>
                    <span>{quotation.delivery_days} days</span>
                  </div>
                  <p>
                    RFQ #{quotation.rfq_id}: {quotation.rfq?.title || '—'}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rfq-table-card">
        <div className="card-title">Quotation database details</div>
        <table className="rfq-table">
          <thead>
            <tr>
              <th>Quotation</th>
              <th>RFQ</th>
              <th>Vendor</th>
              <th>Total</th>
              <th>Delivery days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quotation) => (
              <tr key={quotation.id}>
                <td>{quotation.id}</td>
                <td>{quotation.rfq ? `${quotation.rfq.id} - ${quotation.rfq.title}` : quotation.rfq_id}</td>
                <td>{quotation.vendor?.company_name || `Vendor ${quotation.vendor_id}`}</td>
                <td>{quotation.total_amount.toFixed(2)}</td>
                <td>{quotation.delivery_days}</td>
                <td>{quotation.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default QuotationPage;
