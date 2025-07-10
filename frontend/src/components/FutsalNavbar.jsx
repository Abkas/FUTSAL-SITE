import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import styles from '../pages/css/FutsalHome.module.css';
import { useAuthStore } from '../store/useAuthStore';

const FutsalNavbar = () => {
  const { User } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifRef = useRef();

  // Fetch notifications from backend
  useEffect(() => {
    if (notifOpen) {
      setLoadingNotif(true);
      axiosInstance.get('/notifications')
        .then(res => setNotifications(res.data.notifications || []))
        .catch(() => setNotifications([]))
        .finally(() => setLoadingNotif(false));
    }
  }, [notifOpen]);

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Helper to check if the current path matches
  const isActive = (path) => location.pathname === path;

  // Handler for burger menu
  const handleBurgerClick = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  // Handler for profile icon click
  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate('/profile');
  };

  // Notification badge logic
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav>
      <div className={styles['navbar-container']}>
        <div className={styles.burger} onClick={handleBurgerClick}>
          <span className={menuOpen ? styles.burgerOpen : ''}></span>
          <span className={menuOpen ? styles.burgerOpen : ''}></span>
          <span className={menuOpen ? styles.burgerOpen : ''}></span>
        </div>
        <div className={styles.logo}>
          <Link to="/">
            <img src="/firstpage/logo.png" alt="match-logo" />
          </Link>
        </div>
        <div className={styles.matchPoint} onClick={() => navigate('/')} style={{cursor:'pointer', position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'max-content'}}>
          MATCHPOINT
        </div>
        <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ''}`} style={{zIndex:200}}>
          <li>
            <Link to="/futsalhome" className={isActive('/futsalhome') ? styles.active : ''} onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/bookfutsal" className={isActive('/bookfutsal') ? styles.active : ''} onClick={closeMenu}>
              Book Futsal
            </Link>
          </li>
          {/* <li>
            <Link to="/tournaments" className={isActive('/tournaments') ? styles.active : ''} onClick={closeMenu}>
              Tournaments
            </Link>
          </li>
          <li>
            <Link to="/quickmatch" className={isActive('/quickmatch') ? styles.active : ''} onClick={closeMenu}>
              Quick Match
            </Link>
          </li> */}
          <li>
            <Link to="/map-search" className={isActive('/map-search') ? styles.active : ''} onClick={closeMenu}>
            Quick Match
            </Link>
          </li>
        </ul>

        <div className={styles.navIcons}>
          <div className={styles.notification} onClick={() => setNotifOpen((v) => !v)} ref={notifRef}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {/* Notification badge */}
            {unreadCount > 0 && (
              <span className={styles.notifBadge}></span>
            )}
            {/* Notification panel */}
            {notifOpen && (
              <div className={styles.notifPanel}>
                <div className={styles.notifHeader}>Notifications</div>
                {loadingNotif ? (
                  <div className={styles.notifEmpty}>Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className={styles.notifEmpty}>No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      className={styles.notifCard + (n.read ? ' ' + styles.read : '')}
                      title={n.title + '\n' + n.message}
                      onClick={() => {
                        if (!n.read) {
                          axiosInstance.patch(`/notifications/${n._id}/read`).then(() => {
                            setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
                          });
                        }
                        if (n.link) {
                          window.location.href = n.link;
                        }
                      }}
                    >
                      <div className={styles.notifTitle}>{n.title}</div>
                      <div className={styles.notifMsg}>{n.message}</div>
                      <div style={{fontSize:'0.8em',color:'#888',marginTop:4}}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* Chat Icon/Button */}
          <div
            className={styles.chatIcon}
            onClick={() => navigate('/chat')}
            title="Chat"
            style={{
              cursor: 'pointer',
              marginLeft: '16px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className={styles.profile} onClick={handleProfileClick}>
            <Link to="/profile">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FutsalNavbar;