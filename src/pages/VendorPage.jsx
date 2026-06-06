import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/vendor.css';

function VendorPage({ apiBase, user, onNavigate }) {
  const [form, setForm] = useState({
    company_name: '',
    gst_number: '',
    category: '',
    status: 'Active',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

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
      setTimeout(() => {
        setForm({ company_name: '', gst_number: '', category: '', status: 'Active', contact_name: '', contact_email: '', contact_phone: '' });
        setShowModal(false);
        fetchVendors();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Unable to save vendor');
    }
  };

  const resetForm = () => {
    setForm({ company_name: '', gst_number: '', category: '', status: 'Active', contact_name: '', contact_email: '', contact_phone: '' });
    setError('');
    setMessage('');
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = 
      vendor.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.gst_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contact_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || vendor.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: vendors.length,
    active: vendors.filter(v => v.status === 'Active').length,
    pending: vendors.filter(v => v.status === 'Pending').length,
    blocked: vendors.filter(v => v.status === 'Blocked').length,
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Pending': return 'status-pending';
      case 'Blocked': return 'status-blocked';
      default: return 'status-default';
    }
  };

  return (
    <div className="vendor-container">
      <Sidebar user={user} activePage="vendors" onNavigate={onNavigate} />

      <div className="vendor-main">
        <div className="vendor-header">
          <div className="header-content">
            <h1>Vendors</h1>
            <p className="header-subtitle">Manage supplier profiles and registrations</p>
          </div>
          <button className="add-vendor-btn" onClick={openAddModal}>
            <span>+</span> Add Vendor
          </button>
        </div>

        <div className="vendor-search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, GST number, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="vendor-filters">
          <button
            className={`filter-btn ${filterStatus === 'All' ? 'active' : ''}`}
            onClick={() => setFilterStatus('All')}
          >
            All ({statusCounts.all})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'Active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Active')}
          >
            Active ({statusCounts.active})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'Pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Pending')}
          >
            Pending ({statusCounts.pending})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'Blocked' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Blocked')}
          >
            Blocked ({statusCounts.blocked})
          </button>
        </div>

        <div className="vendor-table-container">
          {filteredVendors.length > 0 ? (
            <table className="vendor-table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Category</th>
                  <th>GST no.</th>
                  <th>Contact no.</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="vendor-name-cell">
                      <div className="vendor-name-badge">{vendor.company_name?.charAt(0).toUpperCase()}</div>
                      {vendor.company_name}
                    </td>
                    <td>{vendor.category || '-'}</td>
                    <td className="gst-cell">{vendor.gst_number}</td>
                    <td className="contact-cell">{vendor.contact_phone || vendor.contact_email || '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="action-btn view-btn" title="View">👁️</button>
                      <button className="action-btn edit-btn" title="Edit">✏️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>No vendors found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Vendor</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form className="vendor-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input 
                    type="text"
                    value={form.company_name} 
                    onChange={(e) => handleChange('company_name', e.target.value)} 
                    placeholder="Enter company name"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>GST Number *</label>
                  <input 
                    type="text"
                    value={form.gst_number} 
                    onChange={(e) => handleChange('gst_number', e.target.value)} 
                    placeholder="e.g., 27AADCR..."
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <input 
                    type="text"
                    value={form.category} 
                    onChange={(e) => handleChange('category', e.target.value)} 
                    placeholder="e.g., Constructions, IT, Logistics"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={form.status} 
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Blocked</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Contact Name</label>
                  <input 
                    type="text"
                    value={form.contact_name} 
                    onChange={(e) => handleChange('contact_name', e.target.value)}
                    placeholder="Contact person name"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input 
                    type="email"
                    value={form.contact_email} 
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="email@company.com"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input 
                    type="tel"
                    value={form.contact_phone} 
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
              </div>

              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorPage;
