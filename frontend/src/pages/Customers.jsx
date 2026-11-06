import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import { localDB } from '../services/localDB';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    refresh();
    window.addEventListener('kgc:change', refresh);
    return () => window.removeEventListener('kgc:change', refresh);
  }, []);

  function refresh() {
    setCustomers(localDB.get('customers'));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    localDB.add('customers', form);
    setForm({ name: '', phone: '', address: '' });
  }

  function remove(id) {
    if (confirm('Remove this customer?')) localDB.remove('customers', id);
  }

  return (
    <>
      <Topbar title="Customers" />
      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        <form className="card" onSubmit={submit}>
          <div className="table-title" style={{ marginBottom: 14 }}>👤 Add customer</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label>Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className="form-input" rows={3} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <button className="btn btn-gold" type="submit" style={{ justifyContent: 'center' }}>Add customer</button>
          </div>
        </form>

        <div className="card">
          <div className="table-title" style={{ marginBottom: 14 }}>Customers ({customers.length})</div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Address</th><th></th></tr></thead>
            <tbody>
              {customers.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No customers yet.</td></tr>
              )}
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.address || '—'}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
