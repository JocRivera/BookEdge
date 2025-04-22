import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import Footer from '../Footer/Footer';

export default function MainLayout() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Navbar />
      
      <div style={{
        flex: 1,
        padding: '20px',
        marginTop: '60px',  
        marginBottom: '40px', 
        width: '100%',
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <Outlet />
      </div>
      
      <Footer />
    </div>
  );
}