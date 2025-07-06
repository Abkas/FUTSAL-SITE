import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from '../pages/css/OSidebar.module.css';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, User, LayoutDashboard, Clock, ChevronLeft, ChevronRight, MapPin, Users, UserPlus } from 'lucide-react';

const OrganizerSidebar = () => {
  const { logOut, authUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { label: 'Dashboard', path: '/organizer-dashboard', icon: <LayoutDashboard size={22} /> },
    { label: 'Profile', path: `/organizer-profile${authUser && authUser._id ? `/${authUser._id}` : ''}`, icon: <User size={22} /> },
    { label: 'My Futsals', path: '/organizer-futsals', icon: <MapPin size={22} /> },
    { label: 'Slots', path: '/organizer-slots', icon: <Clock size={22} /> },
    { label: 'Add Friends', path: '/player-addfriend', icon: <UserPlus size={22} /> },
    { label: 'Upcoming Matches', path: '/player-upcomingmatches', icon: <Clock size={22} /> },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>  
      <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
      </button>
      <ul className={styles.sidebarMenu}>
        {menu.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? styles.active : ''}
              title={item.label}
            >
              <span className={styles.icon}>{item.icon}</span>
              {!collapsed && <span className={styles.label}>{item.label}</span>}
            </Link>
          </li>
        ))}
        <li>
          <button className={styles.logoutBtn} onClick={() => { logOut(); navigate('/login'); }}>
            <LogOut size={22} />
            {!collapsed && <span className={styles.label}>Logout</span>}
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default OrganizerSidebar;
