import { Outlet, NavLink, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

const navItems = [
  { to: '/', label: 'Home', exact: true },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/admin', label: 'Admin' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.logo}>
          QUIZZY
        </NavLink>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.main} key={location.pathname}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      <footer className={styles.footer}>
        <span>QUIZZY © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
