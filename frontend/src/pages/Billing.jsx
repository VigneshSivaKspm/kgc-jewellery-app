import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { localDB } from '../services/localDB';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customerName: '', itemId: '', qty: 1 });

  useEffect(() => {
    refresh();
    window.addEventListener('kgc:change', refresh);
    return () => window.removeEventListener('kgc:change', refresh);
  }, []);

  function refresh() {
    setBills(localDB.get('bills'));
    setItems(localDB.get('items'));
    setCustomers(localDB.get('customers'));
  }

  function nextBillNo() {
    const settings = localDB.getSettings();
    const n = bills.length + 1;
    return `${settings.prefix || 'KGC-'}${String(n).padStart(4, '0')}`;
  }

  function createBill(e) {
    e.preventDefault();
    const item = items.find((i) => i.id === form.itemId);
    if (!item || !form.customerName.trim()) return;
    const qty = Number(form.qty) || 1;
    const total = Number(item.price || 0) * qty;

    localDB.add('bills', {
      billNo: nextBillNo(),
      customerName: form.customerName.trim(),
      itemName: item.name,
      itemId: item.id,
      qty,
      total,
      date: new Date().toISOString(),
    });

    // keep stock in sync
    localDB.update('items', item.id, { stock: Math.max(0, Number(item.stock || 0) - qty) });

    setForm({ customerName: '', itemId: '', qty: 1 });
  }

  return (
    <>
      <Topbar title="Billing" />
      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        <form className="card" onSubmit={createBill}>
          <div className="table-title" style={{ marginBottom: 14 }}>🧾 New bill</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label>Customer name</label>
              <input className="form-input" list="customer-list" value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} required />
              <datalist id="customer-list">
                {customers.map((c) => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label>Item</label>
              <select className="form-input" value={form.itemId}
                onChange={(e) => setForm((f) => ({ ...f, itemId: e.target.value }))} required>
                <option value="">Select an item</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>{i.name} — ₹{i.price} ({i.stock} in stock)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input className="form-input" type="number" min="1" value={form.qty}
                onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} />
            </div>
            <button className="btn btn-gold" type="submit" style={{ justifyContent: 'center' }}>Generate bill</button>
          </div>
        </form>

        <div className="card">
          <div className="table-title" style={{ marginBottom: 14 }}>Bills ({bills.length})</div>
          <table className="data-table">
            <thead><tr><th>Bill No</th><th>Customer</th><th>Item</th><th>Qty</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>
              {bills.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No bills yet.</td></tr>
              )}
              {[...bills].reverse().map((b) => (
                <tr key={b.id}>
                  <td>{b.billNo}</td>
                  <td>{b.customerName}</td>
                  <td>{b.itemName}</td>
                  <td>{b.qty}</td>
                  <td>₹{Number(b.total).toLocaleString('en-IN')}</td>
                  <td>{new Date(b.date).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
