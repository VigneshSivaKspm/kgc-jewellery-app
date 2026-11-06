import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import CameraCapture from '../components/CameraCapture';
import { localDB } from '../services/localDB';

const BLANK = { name: '', category: 'Necklace', metal: 'Gold', weight: '', purity: '22K', price: '', stock: 1, photo: '' };

export default function Items() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    refresh();
    window.addEventListener('kgc:change', refresh);
    return () => window.removeEventListener('kgc:change', refresh);
  }, []);

  function refresh() {
    setItems(localDB.get('items'));
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePhotoFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleChange('photo', reader.result);
    reader.readAsDataURL(file);
  }

  function handleCapture(dataUrl) {
    handleChange('photo', dataUrl);
    setCameraOpen(false);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      localDB.update('items', editingId, form);
    } else {
      localDB.add('items', form);
    }
    setForm(BLANK);
    setEditingId(null);
  }

  function edit(item) {
    setForm(item);
    setEditingId(item.id);
  }

  function remove(id) {
    if (confirm('Remove this item?')) localDB.remove('items', id);
  }

  return (
    <>
      <Topbar title="Items" />
      <div className="page-body" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

        <form className="card" onSubmit={submit}>
          <div className="table-title" style={{ marginBottom: 14 }}>
            {editingId ? '✏️ Edit item' : '➕ Add item'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label>Item name</label>
              <input className="form-input" value={form.name}
                onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. Kemp Haram" required />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                {['Necklace', 'Haram', 'Bangle', 'Earring', 'Ring', 'Chain', 'Bracelet', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Metal</label>
                <select className="form-input" value={form.metal} onChange={(e) => handleChange('metal', e.target.value)}>
                  <option>Gold</option><option>Silver</option><option>Gold Covering</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Purity</label>
                <input className="form-input" value={form.purity} onChange={(e) => handleChange('purity', e.target.value)} placeholder="22K" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Weight (g)</label>
                <input className="form-input" type="number" step="0.01" value={form.weight}
                  onChange={(e) => handleChange('weight', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Price (₹)</label>
                <input className="form-input" type="number" value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Stock quantity</label>
              <input className="form-input" type="number" min="0" value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Photo</label>
              {form.photo && (
                <img src={form.photo} alt="item" style={{ width: '100%', borderRadius: 10, marginBottom: 6 }} />
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                  📁 Upload
                  <input type="file" accept="image/*" onChange={handlePhotoFile} hidden />
                </label>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setCameraOpen(true)}>
                  📸 Camera
                </button>
              </div>
            </div>

            <button className="btn btn-gold" type="submit" style={{ justifyContent: 'center' }}>
              {editingId ? 'Save changes' : 'Add item'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" style={{ justifyContent: 'center' }}
                onClick={() => { setForm(BLANK); setEditingId(null); }}>
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <div className="table-title" style={{ marginBottom: 14 }}>Inventory ({items.length})</div>
          <table className="data-table">
            <thead>
              <tr><th>Photo</th><th>Name</th><th>Category</th><th>Metal</th><th>Weight</th><th>Price</th><th>Stock</th><th></th></tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                  No items yet — add your first one on the left.
                </td></tr>
              )}
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.photo ? <img src={it.photo} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} /> : '—'}</td>
                  <td>{it.name}</td>
                  <td><span className="badge badge-gold">{it.category}</span></td>
                  <td>{it.metal}</td>
                  <td>{it.weight ? `${it.weight} g` : '—'}</td>
                  <td>₹{Number(it.price || 0).toLocaleString('en-IN')}</td>
                  <td>{it.stock}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => edit(it)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CameraCapture open={cameraOpen} onCapture={handleCapture} onClose={() => setCameraOpen(false)} />
    </>
  );
}
