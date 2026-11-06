import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { localDB } from '../services/localDB';

export default function Dashboard() {
  const [stats, setStats] = useState({ items: 0, bills: 0, customers: 0, revenue: 0 });

  useEffect(() => {
    refresh();
    window.addEventListener('kgc:change', refresh);
    return () => window.removeEventListener('kgc:change', refresh);
  }, []);

  function refresh() {
    const items = localDB.get('items');
    const bills = localDB.get('bills');
    const customers = localDB.get('customers');
    const revenue = bills.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
    setStats({ items: items.length, bills: bills.length, customers: customers.length, revenue });
  }

  const cards = [
    { label: 'Items in stock', value: stats.items, icon: '💍' },
    { label: 'Bills raised', value: stats.bills, icon: '🧾' },
    { label: 'Customers', value: stats.customers, icon: '👥' },
    { label: 'Total revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: '💰' },
  ];

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16 }}>
          {cards.map((c) => (
            <div className="card" key={c.label}>
              <div style={{ fontSize: 24 }}>{c.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, color: 'var(--dark)' }}>{c.value}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="table-title">Welcome back 👋</div>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
            Your data is saved locally on this device and syncs to the cloud
            automatically whenever you're online. Head to <strong>Items</strong> to
            add new stock, or <strong>Settings</strong> to connect Google Drive
            for a personal backup.
          </p>
        </div>
      </div>
    </>
  );
}
