import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, UserCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { navbarStyles } from '../../../data/dummyStyles';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../../data/dummyStyles';
import { getInitials } from '../../utils';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        <Link to="/dashboard" className={navbarStyles.logoContainer}>
          <span className="text-2xl font-bold text-teal-600">$</span>
          <span className={navbarStyles.logoText}>ExpenseTracker</span>
        </Link>

        <div className={navbarStyles.userContainer} ref={dropdownRef}>
          <button className={navbarStyles.userButton} onClick={() => setOpen((prev) => !prev)} type="button">
            <div className="relative">
              <div className={navbarStyles.userAvatar}>{getInitials(user?.name ?? user?.email)}</div>
              <span className={navbarStyles.statusIndicator} />
            </div>
            <div className={navbarStyles.userTextContainer}>
              <p className={navbarStyles.userName}>{user?.name ?? 'Guest User'}</p>
              <p className={navbarStyles.userEmail}>{user?.email ?? 'expense@tracker.app'}</p>
            </div>
            <ChevronDown className={cn(navbarStyles.chevronIcon(open))} />
          </button>

          {open && (
            <div className={navbarStyles.dropdownMenu}>
              <div className={navbarStyles.dropdownHeader}>
                <div className="flex items-center gap-3">
                  <div className={navbarStyles.dropdownAvatar}>{getInitials(user?.name ?? user?.email)}</div>
                  <div>
                    <p className={navbarStyles.dropdownName}>{user?.name}</p>
                    <p className={navbarStyles.dropdownEmail}>{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className={navbarStyles.menuItemContainer}>
                <Link className={navbarStyles.menuItem} onClick={() => setOpen(false)} to="/profile">
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </Link>
              </div>

              <div className={navbarStyles.menuItemBorder}>
                <button className={navbarStyles.logoutButton} onClick={handleLogout} type="button">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
