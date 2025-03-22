import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import NavDropdown from '../navAdmin/NavBarAdmin';
import './adminLayaout.css';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setCollapsed(event.detail.collapsed);
    };

    document.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => document.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

 
  return (
    <div className="admin-layout">
      <Sidebar />
      <NavDropdown sidebarCollapsed={collapsed}  />
      <div className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;