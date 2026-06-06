import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/po-invoice.css';

function POInvoicePage({ apiBase, user, onNavigate, onLogout }) {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'invoices'
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poRes, invRes] = await Promise.all([
        fetch(`${apiBase}/purchase-orders`),
        fetch(`${apiBase}/invoices`),
      ]);
      const [poData, invData] = await Promise.all([poRes.json(), invRes.json()]);
      if (poRes.ok) setPurchaseOrders(poData.purchase_orders || []);
      if (invRes.ok) setInvoices(invData.invoices || []);
    } catch (err) {
      console.error(err);
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

  useEffect(() => { fetchData(); }, []);

  const statusBadge = (status) => {
    const cls = status === 'Approved' || status === 'Paid'
      ? 'po-badge-approved'
      : status === 'Rejected'
        ? 'po-badge-rejected'
        : 'po-badge-pending';
    return <span className={`po-badge ${cls}`}>{status}</span>;
  };

  const totalPOValue = purchaseOrders.reduce((s, p) => s + (p.total_amount || 0), 0);
  const totalInvoiceValue = invoices.reduce((s, i) => s + (i.grand_total || 0), 0);
  const pendingInvoices = invoices.filter((i) => i.status !== 'Paid').length;

  return (
    <div className="po-container">
      <Sidebar user={user} activePage="po-invoice" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="po-main">
        <div className="po-page">

          {/* Header */}
          <header className="po-header">
            <div>
              <h2>Purchase Orders &amp; Invoices</h2>
              <p>Auto-generated from approved quotations. All bills and POs in one place.</p>
            </div>
            <div className="po-header-actions">
              <button className="btn-outline" onClick={() => onNavigate('approvals')}>← Back to Approvals</button>
            </div>
          </header>

          {/* Stats */}
          <section className="po-stats-grid">
            <div className="po-stat-card">
              <span>Total POs</span>
              <strong>{purchaseOrders.length}</strong>
            </div>
            <div className="po-stat-card po-stat-blue">
              <span>Total PO Value</span>
              <strong>₹{Math.round(totalPOValue).toLocaleString()}</strong>
            </div>
            <div className="po-stat-card po-stat-green">
              <span>Total Invoice Value</span>
              <strong>₹{Math.round(totalInvoiceValue).toLocaleString()}</strong>
            </div>
            <div className="po-stat-card po-stat-amber">
              <span>Pending Bills</span>
              <strong>{pendingInvoices}</strong>
            </div>
          </section>

          {/* Tabs */}
          <div className="po-tabs">
            <button className={`po-tab ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')}>
              📦 Purchase Orders ({purchaseOrders.length})
            </button>
            <button className={`po-tab ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
              🧾 Bills &amp; Invoices ({invoices.length})
            </button>
          </div>

          {loading && <div className="po-loading">Loading…</div>}

          {/* ── PO Tab ── */}
          {!loading && activeTab === 'pos' && (
            <div className="po-content-layout">
              {/* PO List */}
              <section className="po-list-card">
                <div className="po-card-title">Purchase Orders</div>
                {purchaseOrders.length === 0 ? (
                  <div className="po-empty">
                    <span>📦</span>
                    <p>No POs yet. Approve a quotation to auto-generate the first PO.</p>
                  </div>
                ) : (
                  <div className="po-list">
                    {purchaseOrders.map((po) => (
                      <div
                        key={po.id}
                        className={`po-list-item ${selectedPO?.id === po.id ? 'po-list-item-active' : ''}`}
                        onClick={() => setSelectedPO(po)}
                      >
                        <div className="po-list-left">
                          <div className="po-list-num">{po.po_number}</div>
                          <div className="po-list-vendor">
                            {po.quotation?.vendor?.company_name || 'Vendor'}
                          </div>
                          <div className="po-list-rfq">
                            RFQ #{po.quotation?.rfq_id}: {po.quotation?.rfq?.title || '—'}
                          </div>
                        </div>
                        <div className="po-list-right">
                          <div className="po-list-amount">₹{Math.round(po.total_amount).toLocaleString()}</div>
                          {statusBadge(po.status)}
                          <div className="po-list-date">{new Date(po.created_at).toLocaleDateString('en-GB')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* PO Detail */}
              {selectedPO && (() => {
                const poItems = selectedPO.items && selectedPO.items.length > 0 
                  ? selectedPO.items.map(item => ({
                      description: item.description,
                      quantity: item.quantity,
                      unit_price: item.unit_price,
                      total_price: item.total_price
                    }))
                  : [{
                      description: `${selectedPO.quotation?.rfq?.title || 'Procurement'} — Approved Quotation #${selectedPO.quotation?.id}`,
                      quantity: 1,
                      unit_price: selectedPO.total_amount,
                      total_price: selectedPO.total_amount
                    }];

                return (
                  <section className="po-detail-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="po-card-title" style={{ margin: 0 }}>PO Detail — {selectedPO.po_number}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-outline" onClick={() => window.print()}>Print</button>
                        <button className="btn-outline" onClick={() => alert('PDF download started...')}>Download PDF</button>
                        <button className="btn-outline" onClick={() => alert('Invoice emailed to vendor!')}>Email Invoice</button>
                      </div>
                    </div>

                    <div className="po-detail-meta-grid">
                      <div className="po-detail-block">
                        <div className="po-label">Bill To</div>
                        <div className="po-address-block">
                          <strong>Your Organisation</strong>
                          <p>123 Business Park, Ahmedabad</p>
                          <p>GSTIN: 25383438AFB</p>
                        </div>
                      </div>
                      <div className="po-detail-block">
                        <div className="po-label">Vendor</div>
                        <div className="po-address-block">
                          <strong>{selectedPO.quotation?.vendor?.company_name || '—'}</strong>
                          <p>GST: {selectedPO.quotation?.vendor?.gst_number || '—'}</p>
                          <p>{selectedPO.quotation?.vendor?.contact_email || ''}</p>
                        </div>
                      </div>
                      <div className="po-detail-block">
                        <div className="po-label">PO Details</div>
                        <div className="po-meta-grid">
                          <div className="po-meta-item"><span>PO Number</span><strong>{selectedPO.po_number}</strong></div>
                          <div className="po-meta-item"><span>Date</span><strong>{new Date(selectedPO.po_date || selectedPO.created_at).toLocaleDateString('en-GB')}</strong></div>
                          <div className="po-meta-item"><span>RFQ</span><strong>#{selectedPO.quotation?.rfq_id} — {selectedPO.quotation?.rfq?.title || '—'}</strong></div>
                          <div className="po-meta-item"><span>Delivery</span><strong>{selectedPO.quotation?.delivery_days || '—'} days</strong></div>
                        </div>
                      </div>
                    </div>

                    <section className="po-table-card">
                      <div className="po-table-wrapper">
                        <table className="po-table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th style={{ textAlign: 'center' }}>Qty</th>
                              <th style={{ textAlign: 'right' }}>Unit price</th>
                              <th style={{ textAlign: 'right' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {poItems.map((item, idx) => (
                              <tr key={idx} className="item-row">
                                <td>{item.description}</td>
                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right' }}>₹{Math.round(item.unit_price).toLocaleString()}</td>
                                <td style={{ textAlign: 'right' }}>₹{Math.round(item.total_price).toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="totals-row">
                              <td colSpan="3" style={{ textAlign: 'right' }}>Subtotal</td>
                              <td style={{ textAlign: 'right' }}>₹{Math.round(selectedPO.total_amount).toLocaleString()}</td>
                            </tr>
                            <tr className="totals-row">
                              <td colSpan="3" style={{ textAlign: 'right' }}>CGST (9%)</td>
                              <td style={{ textAlign: 'right' }}>₹{Math.round(selectedPO.total_amount * 0.09).toLocaleString()}</td>
                            </tr>
                            <tr className="totals-row">
                              <td colSpan="3" style={{ textAlign: 'right' }}>SGST (9%)</td>
                              <td style={{ textAlign: 'right' }}>₹{Math.round(selectedPO.total_amount * 0.09).toLocaleString()}</td>
                            </tr>
                            <tr className="totals-row grand-total">
                              <td colSpan="3" style={{ textAlign: 'right' }}><strong>Grand Total</strong></td>
                              <td style={{ textAlign: 'right' }}><strong>₹{Math.round(selectedPO.total_amount * 1.18).toLocaleString()}</strong></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <div className="po-footer-status">
                      {statusBadge(selectedPO.status)}
                    </div>
                  </section>
                );
              })()}
            </div>
          )}

          {/* ── Invoices Tab ── */}
          {!loading && activeTab === 'invoices' && (
            <div className="po-content-layout">
              {/* Invoice List */}
              <section className="po-list-card">
                <div className="po-card-title">Bills &amp; Invoices</div>
                {invoices.length === 0 ? (
                  <div className="po-empty">
                    <span>🧾</span>
                    <p>No invoices yet. They are auto-generated when a quotation is approved.</p>
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
                          <div className="po-list-num">{inv.invoice_number}</div>
                          <div className="po-list-vendor">
                            {inv.purchase_order?.quotation?.vendor?.company_name || 'Vendor'}
                          </div>
                          <div className="po-list-rfq">PO: {inv.purchase_order?.po_number || '—'}</div>
                        </div>
                        <div className="po-list-right">
                          <div className="po-list-amount">₹{Math.round(inv.grand_total).toLocaleString()}</div>
                          {statusBadge(inv.status)}
                          <div className="po-list-date">{new Date(inv.created_at).toLocaleDateString('en-GB')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Invoice Detail */}
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

                const isApproved = selectedInvoice.status === 'Pending Payment' || selectedInvoice.status === 'Paid';
                const isRejected = selectedInvoice.status === 'Rejected';
                const isPending = selectedInvoice.status === 'Pending Approval';

                return (
                  <section className="po-detail-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="po-card-title" style={{ margin: 0 }}>Bill &amp; Invoice — {selectedInvoice.invoice_number}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-outline" onClick={() => window.print()}>Print</button>
                        <button className="btn-outline" onClick={() => alert('PDF download started...')}>Download PDF</button>
                        <button className="btn-outline" onClick={() => alert('Invoice emailed to vendor!')}>Email Invoice</button>
                      </div>
                    </div>

                    <div className="po-detail-meta-grid">
                      <div className="po-detail-block">
                        <div className="po-label">Bill To</div>
                        <div className="po-address-block">
                          <strong>Your Organisation</strong>
                          <p>123 Business Park, Ahmedabad</p>
                          <p>GSTIN: 25383438AFB</p>
                        </div>
                      </div>
                      <div className="po-detail-block">
                        <div className="po-label">Vendor</div>
                        <div className="po-address-block">
                          <strong>{selectedInvoice.purchase_order?.quotation?.vendor?.company_name || '—'}</strong>
                          <p>GST: {selectedInvoice.purchase_order?.quotation?.vendor?.gst_number || '—'}</p>
                          <p>{selectedInvoice.purchase_order?.quotation?.vendor?.contact_email || ''}</p>
                        </div>
                      </div>
                      <div className="po-detail-block">
                        <div className="po-label">Invoice Details</div>
                        <div className="po-meta-grid">
                          <div className="po-meta-item"><span>Invoice No.</span><strong>{selectedInvoice.invoice_number}</strong></div>
                          <div className="po-meta-item"><span>Invoice Date</span><strong>{new Date(selectedInvoice.invoice_date || selectedInvoice.created_at).toLocaleDateString('en-GB')}</strong></div>
                          <div className="po-meta-item"><span>PO Ref.</span><strong>{selectedInvoice.purchase_order?.po_number || '—'}</strong></div>
                          <div className="po-meta-item"><span>Due Date</span><strong>{selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString('en-GB') : new Date(new Date(selectedInvoice.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</strong></div>
                        </div>
                      </div>
                    </div>

                    {!isRejected ? (
                      <>
                        <section className="po-table-card">
                          <div className="po-table-wrapper">
                            <table className="po-table">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th style={{ textAlign: 'center' }}>Qty</th>
                                  <th style={{ textAlign: 'right' }}>Unit price</th>
                                  <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invItems.map((item, idx) => (
                                  <tr key={idx} className="item-row">
                                    <td>{item.description}</td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>₹{Math.round(item.unit_price).toLocaleString()}</td>
                                    <td style={{ textAlign: 'right' }}>₹{Math.round(item.total_price).toLocaleString()}</td>
                                  </tr>
                                ))}
                                <tr className="totals-row">
                                  <td colSpan="3" style={{ textAlign: 'right' }}>Subtotal</td>
                                  <td style={{ textAlign: 'right' }}>₹{Math.round(selectedInvoice.subtotal).toLocaleString()}</td>
                                </tr>
                                <tr className="totals-row">
                                  <td colSpan="3" style={{ textAlign: 'right' }}>CGST (9%)</td>
                                  <td style={{ textAlign: 'right' }}>₹{Math.round(selectedInvoice.cgst).toLocaleString()}</td>
                                </tr>
                                <tr className="totals-row">
                                  <td colSpan="3" style={{ textAlign: 'right' }}>SGST (9%)</td>
                                  <td style={{ textAlign: 'right' }}>₹{Math.round(selectedInvoice.sgst).toLocaleString()}</td>
                                </tr>
                                <tr className="totals-row grand-total">
                                  <td colSpan="3" style={{ textAlign: 'right' }}><strong>Grand Total</strong></td>
                                  <td style={{ textAlign: 'right' }}><strong>₹{Math.round(selectedInvoice.grand_total).toLocaleString()}</strong></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </section>

                        <div className="po-footer-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                          <div>
                            {statusBadge(selectedInvoice.status)}
                          </div>
                          <div>
                            {selectedInvoice.status === 'Pending Approval' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="btn-primary" 
                                  style={{ background: '#27ae60', borderColor: '#27ae60', padding: '8px 16px', fontSize: '0.85rem' }}
                                  onClick={() => handleApproveBill(selectedInvoice.id)}
                                >
                                  ✓ Approve Bill
                                </button>
                                <button 
                                  className="btn-outline" 
                                  style={{ color: '#c0392b', borderColor: '#f5c6cb', background: '#fde8e8', padding: '8px 16px', fontSize: '0.85rem' }}
                                  onClick={() => handleRejectBill(selectedInvoice.id)}
                                >
                                  ✕ Reject Bill
                                </button>
                              </div>
                            )}
                            {selectedInvoice.status === 'Pending Payment' && (
                              <button 
                                className="po-link-action" 
                                style={{ border: 'none', background: 'none', padding: 0 }}
                                onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                              >
                                Mark as Paid
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #e0e0e0', borderRadius: '4px', background: '#fafafa' }}>
                        <span style={{ fontSize: '2rem' }}>❌</span>
                        <h4 style={{ margin: '10px 0 4px', color: '#1c1c1c' }}>Bill Rejected</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#5a5a5a' }}>
                          This bill was rejected by the officer and cannot be processed.
                        </p>
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
