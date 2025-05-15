// --- START OF FILE CabinsClient.jsx ---
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaBed, FaStar, FaCalendarAlt, FaTag } from "react-icons/fa"; // Íconos para meta-tags
import React, { useEffect, useState, useCallback } from "react"; // Añadido useCallback
import { getCabins, getCabinImages } from "../../../services/CabinService";
import CabinDetailClient from "./CabinDetailCliente";
import "./CabinClient.css"; // Asegúrate que el CSS modificado se aplique
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function CabinsClient() {
  const [cabins, setCabins] = useState([]);
  const [cabinImagesMap, setCabinImagesMap] = useState({}); // Renombrado para claridad
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCabinImages = useCallback(async (cabinList) => {
    const imagesMap = {};
    for (const cabin of cabinList) {
      try {
        const images = await getCabinImages(cabin.idCabin);
        const primaryImage = images.find((img) => img.isPrimary) || images[0];
        imagesMap[cabin.idCabin] = primaryImage?.imagePath || null;
      } catch (err) {
        // Corregido 'error' a 'err' para evitar shadowing
        console.error(
          `Error cargando imágenes para cabaña ${cabin.idCabin}:`,
          err
        );
        imagesMap[cabin.idCabin] = null;
      }
    }
    return imagesMap;
  }, []); // useCallback para evitar re-creación innecesaria

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Mover setLoading aquí para que se active al re-fetch
      try {
        const data = await getCabins();
        const activatedCabins = data.filter(
          (cabin) => cabin.status === "En Servicio"
        );
        setCabins(activatedCabins);
        if (activatedCabins.length > 0) {
          // Solo cargar imágenes si hay cabañas
          const imageMap = await loadCabinImages(activatedCabins);
          setCabinImagesMap(imageMap);
        }
      } catch (err) {
        // Corregido 'error' a 'err'
        setError(err.message || "Error al conectar con la API");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [loadCabinImages]); // Incluir loadCabinImages como dependencia

  const openModal = (cabin) => {
    setSelectedCabin(cabin);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCabin(null); // Limpiar cabaña seleccionada al cerrar
  };

  if (loading) {
    return <div className="loading-indicator-client">Cargando cabañas...</div>; // Un placeholder de carga
  }

  if (error) {
    return <div className="error-indicator-client">Error: {error}</div>; // Un placeholder de error
  }

  return (
    <>
      <section className="swiper-cabin-container">
        <div className="swiper-custom-nav">
          <div className="swiper-button-prev-custom">
            <ChevronLeft size={24} />
          </div>
          <div className="swiper-button-next-custom">
            <ChevronRight size={24} />
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          spaceBetween={30} // Un poco más de espacio
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 }, // Ajuste para móviles
            768: { slidesPerView: 2, spaceBetween: 25 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
            // 1280: { slidesPerView: 4, spaceBetween: 30 }, // Considera una 4ta card si hay espacio
          }}
          className="cabin-swiper" // Clase para el Swiper si necesitas estilos específicos
        >
          {cabins.map((cabin) => (
            <SwiperSlide key={cabin.idCabin}>
              <article
                className="cabin-card-home"
                onClick={() => openModal(cabin)}
              >
                <figure className="cabin-image-container-home">
                  {cabinImagesMap[cabin.idCabin] ? (
                    <img
                      src={`http://localhost:3000/uploads/${
                        cabinImagesMap[cabin.idCabin]
                      }`}
                      alt={cabin.name}
                      className="cabin-image-home"
                    />
                  ) : (
                    <div className="no-image-placeholder">Sin Imagen</div>
                  )}
                </figure>

                <div className="cabin-content-overlay-home">
            
                  <div className="cabin-text-content">
                    <h2 className="cabin-title-home">{cabin.name}</h2>
                    {cabin.description && (
                      <p className="cabin-description-home">
                        {cabin.description}
                      </p>
                    )}
                    <div className="cabin-meta-tags-home">
                      <span className="meta-tag-home">
                        <FaBed /> {cabin.capacity} Personas
                      </span>
                    </div>
                  </div>
                  <button className="cabin-details-button-home">
                    Ver Detalles
                  </button>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {selectedCabin && ( // Renderizar modal solo si hay una cabaña seleccionada
        <CabinDetailClient
          cabin={selectedCabin}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}

export default CabinsClient;
