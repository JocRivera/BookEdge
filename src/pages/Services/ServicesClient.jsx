import React, { useRef, useEffect } from "react";
import { FaWifi, FaSpa, FaGlassMartiniAlt, FaUtensils, FaCoffee, FaBed } from "react-icons/fa";
import "./ServicesClient.css";

function ServicesClient() {
  const dataServices = [
    {
      id: 1,
      name: "WiFi Gratis",
      icon: <FaWifi className="service-icon" />,
      description: "Conexión de alta velocidad en todas las áreas",
    },
    {
      id: 2,
      name: "Spa & Bienestar",
      icon: <FaSpa className="service-icon" />,
      description: "Masajes relajantes y tratamientos rejuvenecedores",
    },
    {
      id: 3,
      name: "Cena Romántica",
      icon: <FaUtensils className="service-icon" />,
      description: "Experiencias gastronómicas para parejas",
    },
    {
      id: 4,
      name: "Coctelería Premium",
      icon: <FaGlassMartiniAlt className="service-icon" />,
      description: "Bebidas artesanales preparadas por nuestros mixólogos",
    },
    {
      id: 5,
      name: "Refrigerios",
      icon: <FaCoffee className="service-icon" />,
      description: "Snacks y bebidas disponibles 24/7",
    },
    {
      id: 6,
      name: "Desayuno Buffet",
      icon: <FaUtensils className="service-icon" />,
      description: "Variedad de opciones para empezar el día",
    },
    {
      id: 7,
      name: "Habitación Suite",
      icon: <FaBed className="service-icon" />,
      description: "Amplias suites con todas las comodidades",
    },
  ];
  const trackRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    // Duplicamos solo una vez para el efecto infinito
    content.innerHTML = content.innerHTML + content.innerHTML;
    
    let animationId;
    let speed = 1; // Ajusta esta velocidad
    let position = 0;
    
    const animate = () => {
      position -= speed;
      if (position <= -content.scrollWidth / 2) {
        position = 0;
      }
      content.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="services-container-creative">
      <h2 className="services-title-creative">Nuestros Servicios Exclusivos</h2>
      
      <div className="services-track" ref={trackRef}>
        <div className="services-infinite-scroll" ref={contentRef}>
          {dataServices.map((service, index) => (
            <div key={`${service.id}-${index}`} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesClient;