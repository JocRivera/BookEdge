import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaBed } from "react-icons/fa"; 
import React, { useEffect, useState, useCallback } from "react";
import {
  getBedrooms,
  getBedroomImages,
} from "../../../services/BedroomService";
import BedroomDetailClient from "./BedroomDetails"; 
import "../Cabins/CabinClient.css"; 
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import api from "../../../services/api";

const API_BASE_URL = api.defaults.baseURL;

function BedroomsClient() {
  const [rooms, setRooms] = useState([]);
  const [roomImagesMap, setRoomImagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRoomImages = useCallback(async (roomList) => {
    const imagesMap = {};
    // Usamos Promise.all para ejecutar las cargas de imágenes en paralelo
    await Promise.all(
      roomList.map(async (room) => {
        try {
          const images = await getBedroomImages(room.idRoom); // Servicio específico de habitación
          const primaryImage =
            images.find((img) => img.isPrimary) ||
            (images.length > 0 ? images[0] : null);
          imagesMap[room.idRoom] = primaryImage?.imagePath || null;
        } catch (err) {
          console.error(
            `Error cargando imágenes para habitación ${room.idRoom}:`,
            err
          );
          imagesMap[room.idRoom] = null; // Asegurar que haya una entrada incluso si falla
        }
      })
    );
    return imagesMap;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBedrooms(); // Servicio específico de habitación
        const activatedRooms = data.filter(
          (room) => room.status === "En Servicio"
        );
        setRooms(activatedRooms);
        if (activatedRooms.length > 0) {
          const imageMap = await loadRoomImages(activatedRooms);
          setRoomImagesMap(imageMap);
        } else {
          setRoomImagesMap({}); // Limpiar si no hay habitaciones activas
        }
      } catch (err) {
        setError(err.message || "Error al conectar con la API");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [loadRoomImages]);

  const openModal = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
    // Opcional: document.body.style.overflow = "hidden"; (si BedroomDetailClient no lo maneja)
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    // Opcional: document.body.style.overflow = "auto";
  };

  if (loading) {
    return <div className="loading-indicator-client">Cargando habitaciones...</div>;
  }

  if (error) {
    return <div className="error-indicator-client">Error: {error}</div>;
  }

  return (
    <>
      {/* Usaremos las clases de swiper-cabin-container y swiper-custom-nav */}
      <section className="swiper-cabin-container"> {/* Era swiper-room-container */}
        {/* Título opcional, como en CabinsClient si lo tienes */}
        {/* <h2 className="title-cabin-home">Nuestras <span>Habitaciones</span></h2> */}

        {/* Contenedor de navegación con la clase de CabinClient */}
        <div className="swiper-custom-nav"> {/* Era swiper-custom-nav-room */}
          <div className="swiper-button-prev-custom">
            <ChevronLeft size={24} /> {/* Ajusta tamaño si es diferente */}
          </div>
          <div className="swiper-button-next-custom">
            <ChevronRight size={24} /> {/* Ajusta tamaño si es diferente */}
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".swiper-button-next-custom", // Clases estándar de tus botones
            prevEl: ".swiper-button-prev-custom",
          }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{ // Mismos breakpoints que CabinsClient
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 25 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          className="cabin-swiper" // Usar la misma clase para el Swiper si es genérica
        >
          {rooms.map((room) => (
            // Usar la misma clase para el slide si los estilos son compartidos
            <SwiperSlide key={room.idRoom} className="swiper-slide-cabin"> {/* O una clase genérica si la tienes */}
              {/* Usar la misma estructura y clases para la tarjeta */}
              <article
                className="cabin-card-home" // Clase de tarjeta de CabinClient
                onClick={() => openModal(room)}
              >
                <figure className="cabin-image-container-home"> {/* Clase de CabinClient */}
                  {roomImagesMap[room.idRoom] ? (
                    <img
                      src={`${API_BASE_URL}/uploads/${roomImagesMap[room.idRoom]}`}
                      alt={room.name || 'Habitación'}
                      className="cabin-image-home"
                    />
                  ) : (
                    <div className="no-image-placeholder">Sin Imagen</div>
                  )}
                </figure>

                <div className="cabin-content-overlay-home"> {/* Clase de CabinClient */}
                  {/* Quité cabin-text-content si no es necesario y el overlay ya posiciona */}
                  <h2 className="cabin-title-home">{room.name || 'Habitación sin nombre'}</h2>
                  {room.description && (
                    <p className="cabin-description-home">
                      {room.description}
                    </p>
                  )}
                  <div className="cabin-meta-tags-home">
                    <span className="meta-tag-home"> {/* Clase genérica de CabinClient */}
                      <FaBed /> {room.capacity} Persona
                      {room.capacity > 1 ? "s" : ""}
                    </span>
                    {/* Otros meta-tags si aplican a habitaciones */}
                  </div>
                  <button className="cabin-details-button-home"> {/* Clase de CabinClient */}
                    Ver Detalles
                  </button>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Mensaje si no hay habitaciones */}
        {rooms.length === 0 && !loading && (
            <div style={{ width: "100%", textAlign: "center", padding: "40px", color: "#777" }}>
              No hay habitaciones disponibles en este momento.
            </div>
        )}
      </section>

      {selectedRoom && (
        <BedroomDetailClient // Este es tu modal de detalle específico para habitaciones
          room={selectedRoom}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}

export default BedroomsClient;