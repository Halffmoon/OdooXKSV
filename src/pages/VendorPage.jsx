import { useState, useEffect } from 'react';

function VendorPage({ apiBase, onBack }) {
  const [form, setForm] = useState({
    company_name: '',
    gst_number: '',
    category: '',
    status: 'Active',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState([]);

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
    fetchVendors();
  }, []);

  const handleChange = (key, value) => setForm((s) => ({ ...s, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${apiBase}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to save vendor');
        return;
      }
      setMessage('Vendor saved successfully');
      setForm({ company_name: '', gst_number: '', category: '', status: 'Active', contact_name: '', contact_email: '', contact_phone: '' });
      fetchVendors();
    } catch (err) {
      console.error(err);
      setError('Unable to save vendor');
    }
  };

  return (
    <div className="vendor-page">
      <header className="page-header">
        <h2>Vendors</h2>
        <div>
          <button className="secondary-btn" onClick={onBack}>Back</button>
        </div>
      </header>

      <section className="vendor-form-section">
        <form className="vendor-form" onSubmit={handleSubmit}>
          <div className="row">
            <label>Company Name</label>
            <input value={form.company_name} onChange={(e) => handleChange('company_name', e.target.value)} required />
          </div>
          <div className="row">
            <label>GST Number</label>
            <input value={form.gst_number} onChange={(e) => handleChange('gst_number', e.target.value)} required />
          </div>
          <div className="row">
            <label>Category</label>
            <input value={form.category} onChange={(e) => handleChange('category', e.target.value)} required />
          </div>
          <div className="row">
            <label>Status</label>
            <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
              <option>Active</option>
              <option>Pending</option>
              <option>Blocked</option>
            </select>
          </div>
          <div className="row">
            <label>Contact Name</label>
            <input value={form.contact_name} onChange={(e) => handleChange('contact_name', e.target.value)} />
          </div>
          <div className="row">
            <label>Contact Email</label>
            <input value={form.contact_email} onChange={(e) => handleChange('contact_email', e.target.value)} />
          </div>
          <div className="row">
            <label>Contact Phone</label>
            <input value={form.contact_phone} onChange={(e) => handleChange('contact_phone', e.target.value)} />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn">Save Vendor</button>
            <button type="button" className="ghost-btn" onClick={() => setForm({ company_name: '', gst_number: '', category: '', status: 'Active', contact_name: '', contact_email: '', contact_phone: '' })}>Clear</button>
          </div>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
        </form>
      </section>

      <section className="vendor-list">
        <h3>All Vendors</h3>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Category</th>
              <th>GST</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td>{v.company_name}</td>
                <td>{v.category}</td>
                <td>{v.gst_number}</td>
                <td>{v.contact_name || v.contact_email || v.contact_phone}</td>
                <td>{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default VendorPage;
