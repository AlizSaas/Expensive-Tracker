import {
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { sidebarStyles, cn } from '../../../data/dummyStyles';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Income', path: '/income', icon: TrendingUp },
  { label: 'Expenses', path: '/expenses', icon: TrendingDown },
  { label: 'Profile', path: '/profile', icon: User },
];

const Sidebar = ({ collapsed, onToggleCollapse }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside
        className={cn(
          sidebarStyles.sidebarContainer.base,
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className={sidebarStyles.sidebarInner.base}>
          <button className={sidebarStyles.toggleButton.base} onClick={onToggleCollapse} type="button">
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <div
            className={cn(
              sidebarStyles.userProfileContainer.base,
              collapsed ? sidebarStyles.userProfileContainer.collapsed : sidebarStyles.userProfileContainer.expanded,
            )}
          >
            <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
              <div className={sidebarStyles.userInitials.base}>{getInitials(user?.name ?? user?.email)}</div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">{user?.name}</p>
                  <p className="truncate text-sm text-gray-500">{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-2 py-4">
            <ul className={sidebarStyles.menuList.base}>
              {navigationItems.map(({ label, path, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    className={({ isActive }) =>
                      cn(
                        sidebarStyles.menuItem.base,
                        isActive ? sidebarStyles.menuItem.active : sidebarStyles.menuItem.inactive,
                        collapsed ? sidebarStyles.menuItem.collapsed : sidebarStyles.menuItem.expanded,
                      )
                    }
                    to={path}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive,
                          )}
                        />
                        {!collapsed && <span>{label}</span>}
                        {isActive && !collapsed && <span className={sidebarStyles.activeIndicator} />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className={cn(
              sidebarStyles.footerContainer.base,
              collapsed ? sidebarStyles.footerContainer.collapsed : sidebarStyles.footerContainer.expanded,
            )}
          >
            <button
              className={cn(sidebarStyles.logoutButton.base, collapsed && sidebarStyles.logoutButton.collapsed)}
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <button className={sidebarStyles.mobileMenuButton} onClick={() => setMobileOpen(true)} type="button">
        <Menu className="h-6 w-6" />
      </button>

      {mobileOpen && (
        <div className={sidebarStyles.mobileOverlay}>
          <button className={sidebarStyles.mobileBackdrop} onClick={() => setMobileOpen(false)} type="button" />
          <div className={sidebarStyles.mobileSidebar.base}>
            <div className={sidebarStyles.mobileHeader}>
              <div className={sidebarStyles.mobileUserContainer}>
                <div className={sidebarStyles.userInitials.base}>{getInitials(user?.name ?? user?.email)}</div>
                <div>
                  <p className="font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button className={sidebarStyles.mobileCloseButton} onClick={() => setMobileOpen(false)} type="button">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="px-2 py-4">
              <ul className={sidebarStyles.mobileMenuList}>
                {navigationItems.map(({ label, path, icon: Icon }) => (
                  <li key={path}>
                    <NavLink
                      className={({ isActive }) =>
                        cn(
                          sidebarStyles.mobileMenuItem.base,
                          isActive ? sidebarStyles.mobileMenuItem.active : sidebarStyles.mobileMenuItem.inactive,
                        )
                      }
                      onClick={() => setMobileOpen(false)}
                      to={path}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={sidebarStyles.mobileFooter}>
              <button className={sidebarStyles.mobileLogoutButton} onClick={handleLogout} type="button">
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
