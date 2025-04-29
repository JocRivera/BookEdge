import React, { useState } from 'react'
import CabinsClient from './Cabins/CabinsClient'
import BedroomsClient from "./Rooms/BedroomClient"
import "./FilterAlojamientos.css"

function FiltradorAlojamiento() {
  const [filterActive, setAFilterActive] = useState('cabanas');

  return (
    <main className="container-main-alojamientos" >
      <header className="filter-alojamientos">
        <h1 className="filter-title">Nuestros <span>Alojamientos</span></h1>
        <nav className="filter-nav">
        <menu className="filter-menu">
          <li>
            <button 
              className={`filter-cabin ${filterActive === 'cabanas' ? 'active' : ''}`}
              onClick={() => setAFilterActive('cabanas')}
            >
              Cabañas
            </button>
          </li>
          <li>
            <button 
              className={`filter-bedrooms ${filterActive === 'habitaciones' ? 'active' : ''}`}
              onClick={() => setAFilterActive('habitaciones')}
            >
              Habitaciones
            </button>
          </li>
        </menu>
      </nav>

      </header>

      
      <section className="filter-alojamiento-content">
        {filterActive === 'cabanas' ? <CabinsClient/> : <BedroomsClient/>}
      </section>
    </main>
  )
}

export default FiltradorAlojamiento