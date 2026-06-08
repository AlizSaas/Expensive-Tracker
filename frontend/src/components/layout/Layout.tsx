import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styles } from '../../../data/dummyStyles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={styles.layout.root}>
      <Navbar />
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)} />
      <main className={styles.layout.mainContainer(sidebarCollapsed)}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
