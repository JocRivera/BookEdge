import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Navbar from "../navbar/Navbar";
import './adminLayaout.css';

const getInitialCollapsedState = () => {
  const manuallyCollapsed = localStorage.getItem('sidebarManuallyCollapsed') === 'true';
  if (manuallyCollapsed) {
    return true;
  }
  return window.innerWidth < 768;
};
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(getInitialCollapsedState()); 

  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setCollapsed(event.detail.collapsed);
    };

    document.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => document.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar collapsed={collapsed} />
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Navbar />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;