import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import html2pdf from 'html2pdf.js';
import '../styles/po-invoice.css'; 
import '../styles/invoice.css'; 

function POInvoicePage({ apiBase, user, onNavigate, onLogout }) {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const invRes = await fetch(`${apiBase}/invoices`);
      const invData = await invRes.json();
      if (invRes.ok) setInvoices(invData.invoices || []);
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      const res = await fetch(`${apiBase}/invoices/${invoiceId}/pay`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchData();
        setSelectedInvoice((prev) => (prev ? { ...prev, status: 'Paid' } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveBill = async (invoiceId) => {
    try {
      const res = await fetch(`${apiBase}/invoices/${invoiceId}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchData();
        setSelectedInvoice((prev) => (prev ? { ...prev, status: 'Pending Payment' } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectBill = async (invoiceId) => {
    try {
      const res = await fetch(`${apiBase}/invoices/${invoiceId}/reject`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchData();
        setSelectedInvoice((prev) => (prev ? { ...prev, status: 'Rejected' } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.querySelector('.wireframe-detail-card');
    
    // Hide action buttons temporarily for PDF generation
    const actionGroup = document.querySelector('.wireframe-btn-group');
    const footerActions = document.querySelector('.wf-approval-actions');
    const linkBtn = document.querySelector('.wf-link-btn');
    
    if (actionGroup) actionGroup.style.display = 'none';
    if (footerActions) footerActions.style.display = 'none';
    if (linkBtn) linkBtn.style.display = 'none';

    const opt = {
      margin:       0.5,
      filename:     `${selectedInvoice?.invoice_number || 'invoice'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      // Restore buttons
      if (actionGroup) actionGroup.style.display = 'flex';
      if (footerActions) footerActions.style.display = 'flex';
      if (linkBtn) linkBtn.style.display = 'inline-block';
    });
  };

  useEffect(() => { fetchData(); }, []);

  const totalInvoiceValue = invoices.reduce((s, i) => s + (i.grand_total || 0), 0);
  const pendingInvoices = invoices.filter((i) => i.status !== 'Paid').length;

  return (
    <div className="po-container">
      <Sidebar user={user} activePage="po-invoice" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="po-main">
        <div className="po-page">

          <header className="po-header">
            <div>
              <h2>PO &amp; Invoices</h2>
              <p>Manage and process generated purchase orders and vendor bills.</p>
            </div>
            <div className="po-header-actions">
              <button className="btn-outline" onClick={() => onNavigate('approvals')}>← Back to Approvals</button>
            </div>
          </header>

          <section className="po-stats-grid">
            <div className="po-stat-card">
              <span>Total Transactions</span>
              <strong>{invoices.length}</strong>
            </div>
            <div className="po-stat-card po-stat-green">
              <span>Total Value</span>
              <strong>₹{Math.round(totalInvoiceValue).toLocaleString()}</strong>
            </div>
            <div className="po-stat-card po-stat-amber">
              <span>Pending Bills</span>
              <strong>{pendingInvoices}</strong>
            </div>
          </section>

          {loading && <div className="po-loading">Loading…</div>}

          {!loading && (
            <div className="po-content-layout">
              {/* List View */}
              <section className="po-list-card">
                <div className="po-card-title">Transactions</div>
                {invoices.length === 0 ? (
                  <div className="po-empty">
                    <span>🧾</span>
                    <p>No transactions yet. They are auto-generated when a quotation is approved.</p>
                  </div>
                ) : (
                  <div className="po-list">
                    {invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className={`po-list-item ${selectedInvoice?.id === inv.id ? 'po-list-item-active' : ''}`}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <div className="po-list-left">
                          <div className="po-list-num">PO: {inv.purchase_order?.po_number || '—'}</div>
                          <div className="po-list-vendor">
                            {inv.purchase_order?.quotation?.vendor?.company_name || 'Vendor'}
                          </div>
                          <div className="po-list-rfq">{inv.invoice_number}</div>
                        </div>
                        <div className="po-list-right">
                          <div className="po-list-amount">₹{Math.round(inv.grand_total).toLocaleString()}</div>
                          <span className={`po-badge ${inv.status === 'Paid' ? 'po-badge-approved' : inv.status === 'Rejected' ? 'po-badge-rejected' : 'po-badge-pending'}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Detail View (Wireframe Layout) */}
              {selectedInvoice && (() => {
                const invItems = selectedInvoice.purchase_order?.items && selectedInvoice.purchase_order.items.length > 0
                  ? selectedInvoice.purchase_order.items.map(item => ({
                      description: item.description,
                      quantity: item.quantity,
                      unit_price: item.unit_price,
                      total_price: item.total_price
                    }))
                  : [{
                      description: `${selectedInvoice.purchase_order?.quotation?.rfq?.title || 'Procurement'} — PO ${selectedInvoice.purchase_order?.po_number}`,
                      quantity: 1,
                      unit_price: selectedInvoice.subtotal,
                      total_price: selectedInvoice.subtotal
                    }];

                const isRejected = selectedInvoice.status === 'Rejected';
                const isPending = selectedInvoice.status === 'Pending Approval';
                const isApprovedOrPaid = selectedInvoice.status === 'Pending Payment' || selectedInvoice.status === 'Paid';

                const poNumber = selectedInvoice.purchase_order?.po_number || 'Unknown';
                const poDate = new Date(selectedInvoice.purchase_order?.created_at || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase();
                const invDate = new Date(selectedInvoice.created_at || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase();
                
                const dueDateObj = selectedInvoice.due_date ? new Date(selectedInvoice.due_date) : new Date(new Date(selectedInvoice.created_at).getTime() + 30 * 24 * 60 * 60 * 1000);
                const dueDateStr = dueDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase();

                return (
                  <section className="wireframe-detail-card">
                    {/* Header Top */}
                    <div className="wireframe-header-actions">
                      <div className="wireframe-title-area">
                        <h2>Purchase Order &amp; Invoice</h2>
                        <h3>{poNumber}-auto-generated after approval</h3>
                      </div>
                      <div className="wireframe-btn-group">
                        <button className="wf-btn" onClick={handleDownloadPDF}>Download PDF</button>
                        <button className="wf-btn" onClick={() => window.print()}>Print</button>
                        <button className="wf-btn" onClick={() => alert('Invoice emailed to vendor!')}>Email Invoice</button>
                      </div>
                    </div>

                    {!isRejected ? (
                      <>
                        {/* Address and Meta Block */}
                        <div className="wireframe-info-box">
                          <div className="wf-info-row">
                            <div className="wf-info-col">
                              <span className="wf-info-label">Bill to:</span>
                              <div className="wf-address">
                                <strong>BR Engineering</strong>
                                <p>Sahajanad Business Park</p>
                                <p>Kathawada , Ahmedabad, Gujarat</p>
                              </div>
                            </div>
                            <div className="wf-info-col">
                              <span className="wf-info-label">Vendor</span>
                              <div className="wf-address">
                                <strong>{selectedInvoice.purchase_order?.quotation?.vendor?.company_name || 'Vendor Name'}</strong>
                                <p>{selectedInvoice.purchase_order?.quotation?.vendor?.city || 'Ahmedabad'}, {selectedInvoice.purchase_order?.quotation?.vendor?.country || 'India'}</p>
                                <p>GSTIN: {selectedInvoice.purchase_order?.quotation?.vendor?.gst_number || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="wf-divider"></div>
                          <div className="wf-info-row wf-meta-row">
                            <div className="wf-info-col">
                              <div className="wf-meta-line"><span>PO Number:</span> {poNumber}</div>
                              <div className="wf-meta-line"><span>PO date:</span> {poDate}</div>
                            </div>
                            <div className="wf-info-col">
                              <div className="wf-meta-line"><span>invoice date:</span> {invDate}</div>
                              <div className="wf-meta-line"><span>Due date:</span> {dueDateStr}</div>
                            </div>
                          </div>
                        </div>

                        {/* Table Block */}
                        <div className="wireframe-table-box">
                          <table className="wf-table">
                            <thead>
                              <tr>
                                <th style={{ width: '40%' }}>Item</th>
                                <th style={{ textAlign: 'center', width: '20%' }}>Qty</th>
                                <th style={{ textAlign: 'right', width: '20%' }}>Unit price</th>
                                <th style={{ textAlign: 'right', width: '20%' }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.description}</td>
                                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                  <td style={{ textAlign: 'right' }}>{Math.round(item.unit_price).toLocaleString()}</td>
                                  <td style={{ textAlign: 'right' }}>{Math.round(item.total_price).toLocaleString()}</td>
                                </tr>
                              ))}
                              
                              <tr className="wf-total-row">
                                <td colSpan="3" style={{ textAlign: 'right' }}>Subtotal</td>
                                <td style={{ textAlign: 'right' }}>{Math.round(selectedInvoice.subtotal).toLocaleString()}</td>
                              </tr>
                              <tr className="wf-total-row">
                                <td colSpan="3" style={{ textAlign: 'right' }}>CGST(9%)</td>
                                <td style={{ textAlign: 'right' }}>{Math.round(selectedInvoice.cgst).toLocaleString()}</td>
                              </tr>
                              <tr className="wf-total-row">
                                <td colSpan="3" style={{ textAlign: 'right' }}>SGST(9%)</td>
                                <td style={{ textAlign: 'right' }}>{Math.round(selectedInvoice.sgst).toLocaleString()}</td>
                              </tr>
                              <tr className="wf-total-row">
                                <td colSpan="3" style={{ textAlign: 'right' }}>Grand total</td>
                                <td style={{ textAlign: 'right' }}>{Math.round(selectedInvoice.grand_total).toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Footer Status */}
                        <div className="wireframe-footer">
                          <div className="wf-status-area">
                            <span className="wf-status-label">status:</span>
                            <span className={`wf-status-badge ${selectedInvoice.status === 'Paid' ? 'paid' : selectedInvoice.status === 'Pending Approval' ? 'pending' : 'approved'}`}>
                              {selectedInvoice.status}
                            </span>
                            
                            {selectedInvoice.status === 'Pending Payment' && (
                              <button className="btn-mark-paid" onClick={() => handleMarkAsPaid(selectedInvoice.id)}>Mark as Paid</button>
                            )}
                          </div>
                          
                          {selectedInvoice.status === 'Pending Approval' && (
                            <div className="wf-approval-actions">
                              <button className="wf-btn btn-approve" onClick={() => handleApproveBill(selectedInvoice.id)}>Approve Bill</button>
                              <button className="wf-btn btn-reject" onClick={() => handleRejectBill(selectedInvoice.id)}>Reject Bill</button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="wireframe-rejected">
                        <span style={{ fontSize: '2rem' }}>❌</span>
                        <h4>Bill Rejected</h4>
                        <p>This bill was rejected by the officer and cannot be processed.</p>
                      </div>
                    )}
                  </section>
                );
              })()}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default POInvoicePage;
