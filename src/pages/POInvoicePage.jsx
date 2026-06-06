import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/po-invoice.css';

function POInvoicePage({ user, onNavigate, onLogout }) {
  return (
    <div className="po-container">
      <Sidebar user={user} activePage="po-invoices" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="po-main">
        <div className="po-page">
          <header className="po-header">
            <div>
              <h2>Purchase Order & Invoice</h2>
              <p>PO-2024-auto-generated after approval</p>
            </div>
            <div className="po-header-actions">
              <button className="btn-outline">Download PDF</button>
              <button className="btn-outline">Print</button>
              <button className="btn-outline">Email Invoice</button>
            </div>
          </header>

          <section className="po-card">
            <div className="po-summary-row">
              <div className="po-summary-col">
                <div>
                  <div className="po-label">Bill to:</div>
                  <div className="po-address-block">
                    <strong>your Organization Name</strong>
                    <p>123 business park, ahmedabad</p>
                    <p>GSTIN: 25383438AFB</p>
                  </div>
                </div>
                <div className="po-meta-grid">
                  <div className="po-meta-item">
                    <span>PO Number:</span>
                    <strong>PO-2025-0068</strong>
                  </div>
                  <div className="po-meta-item">
                    <span>PO date:</span>
                    <strong>21 may, 2025</strong>
                  </div>
                </div>
              </div>
              
              <div className="po-summary-col">
                <div>
                  <div className="po-label">Vendor</div>
                  <div className="po-address-block">
                    <strong>Infra supplies pvt ltd</strong>
                    <p>456, industrial estate, surat</p>
                    <p>GSTIN: 343434DB4523</p>
                  </div>
                </div>
                <div className="po-meta-grid">
                  <div className="po-meta-item">
                    <span>Invoice date:</span>
                    <strong>22 may 2025</strong>
                  </div>
                  <div className="po-meta-item">
                    <span>Due date:</span>
                    <strong>21 june 2025</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="po-table-card">
            <div className="po-table-wrapper">
              <table className="po-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="item-row">
                    <td>Ergonomic chair</td>
                    <td className="text-right">25</td>
                    <td className="text-right">3500</td>
                    <td className="text-right">87,500</td>
                  </tr>
                  <tr className="item-row">
                    <td>Tech Core LTD</td>
                    <td className="text-right">10</td>
                    <td className="text-right">8,200</td>
                    <td className="text-right">82,000</td>
                  </tr>
                  <tr className="totals-row">
                    <td colSpan="2"></td>
                    <td className="text-right">Subtotal</td>
                    <td className="text-right">1,69,500</td>
                  </tr>
                  <tr className="totals-row">
                    <td colSpan="2"></td>
                    <td className="text-right">CGST(9%)</td>
                    <td className="text-right">15,255</td>
                  </tr>
                  <tr className="totals-row">
                    <td colSpan="2"></td>
                    <td className="text-right">SGST(9%)</td>
                    <td className="text-right">15,255</td>
                  </tr>
                  <tr className="totals-row grand-total">
                    <td colSpan="2"></td>
                    <td className="text-right">Grand total</td>
                    <td className="text-right">2,00,010</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="po-footer-status">
            <span className="po-status-badge">status: Pending Payment</span>
            <span className="po-link-action">Mark as Paid</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default POInvoicePage;
