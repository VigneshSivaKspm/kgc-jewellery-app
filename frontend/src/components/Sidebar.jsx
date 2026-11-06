import { NavLink } from 'react-router-dom';

const NAV = [
  { section: 'Overview', items: [
    { to: '/', label: 'Dashboard', icon: '📊' },
  ]},
  { section: 'Inventory', items: [
    { to: '/items', label: 'Items', icon: '💍' },
  ]},
  { section: 'Sales', items: [
    { to: '/billing', label: 'Billing', icon: '🧾' },
    { to: '/customers', label: 'Customers', icon: '👥' },
  ]},
  { section: 'Insights', items: [
    { to: '/reports', label: 'Reports', icon: '📈' },
  ]},
  { section: 'Shop', items: [
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ]},
];

export default function Sidebar() {
  return (
    <div id="sidebar">
      <div className="logo-area">
        <div className="logo-icon">KGC</div>
        <div className="logo-name">KGC Fashion<br />Jewellery</div>
        <div className="logo-sub">SHOP MANAGER</div>
      </div>
      <div className="nav-section">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="nav-label">{group.section}</div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">Gold · Silver · Fashion Jewellery</div>
    </div>
  );
}
