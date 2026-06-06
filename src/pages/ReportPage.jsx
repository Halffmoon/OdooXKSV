import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Calendar, Download, PieChart, TrendingUp, IndianRupee, Users, Package, AlertCircle } from 'lucide-react';
import '../styles/report.css';

const monthlyData = [
  { name: 'Dec', spend: 4.1 },
  { name: 'Jan', spend: 5.2 },
  { name: 'Feb', spend: 4.8 },
  { name: 'Mar', spend: 7.5 },
  { name: 'Apr', spend: 8.9 },
  { name: 'May', spend: 12.4 },
];

const categoryData = [
  { name: 'IT Hardware', value: 4.8, fill: '#1428a0' },
  { name: 'Furniture', value: 3.2, fill: '#059669' },
  { name: 'Stationery', value: 2.1, fill: '#d97706' },
  { name: 'Logistics', value: 2.3, fill: '#dc2626' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ background: '#fff', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p className="label" style={{ margin: 0, fontWeight: 600, color: '#5a5a5a', marginBottom: '4px' }}>{label}</p>
        <p className="intro" style={{ margin: 0, fontWeight: 700, color: payload[0].payload.fill || '#1428a0' }}>
          ₹{payload[0].value}L
        </p>
      </div>
    );
  }
  return null;
};

function ReportPage({ user, onNavigate, onLogout }) {
  return (
    <div className="report-container">
      <Sidebar user={user} activePage="reports" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="report-main">
        <div className="report-page">
          <header className="report-header">
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PieChart size={32} color="#1428a0" />
                Reports & Analytics
              </h2>
              <p>Procurement Insights - May 2025</p>
            </div>
            <div className="report-header-actions">
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: '#1c1c1c' }}>
                <Calendar size={18} />
                May 2025
              </button>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#1428a0', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                <Download size={18} />
                Export
              </button>
            </div>
          </header>

          <section className="report-kpi-grid">
            <div className="report-kpi-card">
              <IndianRupee size={28} color="#1428a0" style={{ marginBottom: '12px', opacity: 0.8 }} />
              <div className="report-kpi-value blue">12.4 L</div>
              <div className="report-kpi-label">Total Spend</div>
            </div>
            <div className="report-kpi-card">
              <Users size={28} color="#059669" style={{ marginBottom: '12px', opacity: 0.8 }} />
              <div className="report-kpi-value green">28</div>
              <div className="report-kpi-label">Active Vendors</div>
            </div>
            <div className="report-kpi-card">
              <Package size={28} color="#d97706" style={{ marginBottom: '12px', opacity: 0.8 }} />
              <div className="report-kpi-value orange">94%</div>
              <div className="report-kpi-label">PO Fulfillment</div>
            </div>
            <div className="report-kpi-card">
              <AlertCircle size={28} color="#dc2626" style={{ marginBottom: '12px', opacity: 0.8 }} />
              <div className="report-kpi-value red">3</div>
              <div className="report-kpi-label">Overdue Invoices</div>
            </div>
          </section>

          <section className="report-content-grid">
            <div className="report-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="report-card-title">
                <PieChart size={20} />
                Spend by Category
              </div>
              <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={categoryData}
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#5a5a5a', fontWeight: 600 }} width={90} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1500}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="report-right-col">
              <div className="report-card" style={{ marginBottom: '24px' }}>
                <div className="report-card-title">
                  <TrendingUp size={20} />
                  Monthly Trend
                </div>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlyData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1428a0" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1428a0" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#5a5a5a', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5a5a5a', fontSize: 12 }} dx={-10} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="spend" stroke="#1428a0" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" animationDuration={2000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="report-card">
                <div className="report-card-title">
                  <Users size={20} />
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
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;
