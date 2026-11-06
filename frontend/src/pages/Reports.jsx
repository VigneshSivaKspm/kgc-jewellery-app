import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { localDB } from '../services/localDB';

export default function Reports() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    refresh();
    window.addEventListener('kgc:change', refresh);
    return () => window.removeEventListener('kgc:change', refresh);
  }, []);

  function refresh() {
    setBills(localDB.get('bills'));
  }

  const byMonth = bills.reduce((acc, b) => {
    const key = new Date(b.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    acc[key] = (acc[key] || 0) + Number(b.total || 0);
    return acc;
  }, {});

  function exportCsv() {
    const rows = [['Bill No', 'Customer', 'Item', 'Qty', 'Total', 'Date']];
    bills.forEach((b) => rows.push([b.billNo, b.customerName, b.itemName, b.qty, b.total, b.date]));
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kgc-sales-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar title="Reports" />
      <div className="page-body">
        <div className="card">
          <div className="table-title" style={{ marginBottom: 6 }}>Revenue by month</div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>
            Add a real chart later with Chart.js or Recharts — the numbers below are already correct.
          </p>
          <table className="data-table">
            <thead><tr><th>Month</th><th>Revenue</th></tr></thead>
            <tbody>
              {Object.entries(byMonth).length === 0 && (
                <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No sales yet.</td></tr>
              )}
              {Object.entries(byMonth).map(([month, total]) => (
                <tr key={month}><td>{month}</td><td>₹{total.toLocaleString('en-IN')}</td></tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={exportCsv}>⬇️ Export CSV</button>
        </div>
      </div>
    </>
  );
}
