import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import '../styles/report.css';

function ReportPage({ user, onNavigate }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="report-container">
      <Sidebar user={user} activePage="reports" onNavigate={onNavigate} />

      <div className="report-main">
        <div className="report-page">
          <header className="report-header">
            <div>
              <h2>Reports & analytics</h2>
              <p>Procurement Insights - May 2025</p>
            </div>
            <div className="report-header-actions">
              <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>May 2025</button>
              <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Export</button>
            </div>
          </header>

          <section className="report-kpi-grid">
            <div className="report-kpi-card">
              <div className="report-kpi-value blue">12.4 L</div>
              <div className="report-kpi-label">Total Spend</div>
            </div>
            <div className="report-kpi-card">
              <div className="report-kpi-value green">28</div>
              <div className="report-kpi-label">Active Vendors</div>
            </div>
            <div className="report-kpi-card">
              <div className="report-kpi-value orange">94%</div>
              <div className="report-kpi-label">PO Fulfillment</div>
            </div>
            <div className="report-kpi-card">
              <div className="report-kpi-value red">3</div>
              <div className="report-kpi-label">Overdue Invoices</div>
            </div>
          </section>

          <section className="report-content-grid">
            <div className="report-card">
              <div className="report-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                Spend by Category
              </div>
              <div className="spend-category-list">
                <div className="spend-category-item">
                  <div className="spend-category-header">
                    <span className="category-name">IT Hardware</span>
                    <span className="category-value">₹4.8L</span>
                  </div>
                  <div className="spend-category-bar-bg">
                    <div className="spend-category-bar-fill blue" style={{ width: animate ? '45%' : '0%' }}></div>
                  </div>
                </div>
                
                <div className="spend-category-item">
                  <div className="spend-category-header">
                    <span className="category-name">Furniture</span>
                    <span className="category-value">₹3.2L</span>
                  </div>
                  <div className="spend-category-bar-bg">
                    <div className="spend-category-bar-fill green" style={{ width: animate ? '30%' : '0%' }}></div>
                  </div>
                </div>

                <div className="spend-category-item">
                  <div className="spend-category-header">
                    <span className="category-name">Stationery</span>
                    <span className="category-value">₹2.1L</span>
                  </div>
                  <div className="spend-category-bar-bg">
                    <div className="spend-category-bar-fill orange" style={{ width: animate ? '20%' : '0%' }}></div>
                  </div>
                </div>

                <div className="spend-category-item">
                  <div className="spend-category-header">
                    <span className="category-name">Logistics</span>
                    <span className="category-value">₹2.3L</span>
                  </div>
                  <div className="spend-category-bar-bg">
                    <div className="spend-category-bar-fill red" style={{ width: animate ? '22%' : '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="report-right-col">
              <div className="report-card" style={{ marginBottom: '24px' }}>
                <div className="report-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Top Vendors by Spend
                </div>
                <div className="report-table-wrapper" style={{ marginBottom: '0' }}>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Vendor</th>
                        <th>Spend (₹)</th>
                        <th>POs</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>TechCore Ltd</td>
                        <td>4,20,000</td>
                        <td>6</td>
                      </tr>
                      <tr>
                        <td>Infra Supplies</td>
                        <td>3,10,000</td>
                        <td>4</td>
                      </tr>
                      <tr>
                        <td>FastLog</td>
                        <td>1,90,000</td>
                        <td>3</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-card">
                <div className="report-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  Monthly Trend
                </div>
                <div className="monthly-trend-container">
                  <div className="monthly-trend-gridlines">
                    <div className="trend-gridline"></div>
                    <div className="trend-gridline"></div>
                    <div className="trend-gridline"></div>
                    <div className="trend-gridline"></div>
                  </div>
                  <div className="monthly-trend-chart">
                    {[
                      { month: 'Dec', value: '4.1L', height: '30%' },
                      { month: 'Jan', value: '5.2L', height: '40%' },
                      { month: 'Feb', value: '4.8L', height: '35%' },
                      { month: 'Mar', value: '7.5L', height: '55%' },
                      { month: 'Apr', value: '8.9L', height: '65%' },
                      { month: 'May', value: '12.4L', height: '90%', active: true },
                    ].map((item, index) => (
                      <div className="trend-bar-wrapper" key={index}>
                        <div className="trend-value">{item.value}</div>
                        <div 
                          className={`trend-bar ${item.active ? 'active' : ''}`} 
                          style={{ height: animate ? item.height : '0%' }}
                        ></div>
                        <span className="trend-label">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;
