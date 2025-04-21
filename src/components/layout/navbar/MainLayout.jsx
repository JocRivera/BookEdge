import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../Footer/Footer'


export default function MainLayout() {
  return (
<>
<main 
  className="container-main" 
  style={{
    backgroundColor: '#F1F5F9  ',
    
  }}
><Navbar/>
<Outlet/>
<Footer/>
</main>

</>
)
}
