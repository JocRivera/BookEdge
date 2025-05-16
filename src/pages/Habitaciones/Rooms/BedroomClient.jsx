// --- START OF FILE BedroomsClient.jsx (Revisado para usar clases de BedroomClient.css) ---
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaBed } from "react-icons/fa";
import React, { useEffect, useState, useCallback } from "react";
import {
  getBedrooms,
  getBedroomImages,
} from "../../../services/BedroomService";
import BedroomDetailClient from "./BedroomDetails";
import "./BedroomClient.css"; // IMPORTA EL BedroomClient.css
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function BedroomsClient() {
  const [rooms, setRooms] = useState([]);
  const [roomImagesMap, setRoomImagesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRoomImages = useCallback(async (roomList) => {
    const imagesMap = {};
    await Promise.all(
      roomList.map(async (room) => {
        try {
          const images = await getBedroomImages(room.idRoom);
          const primaryImage =
            images.find((img) => img.isPrimary) ||
            (images.length > 0 ? images[0] : null);
          imagesMap[room.idRoom] = primaryImage?.imagePath || null;
        } catch (err) {
          console.error(
            `Error cargando imágenes para habitación ${room.idRoom}:`,
            err
          );
          imagesMap[room.idRoom] = null;
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
        const data = await getBedrooms();
        const activatedRooms = data.filter(
          (room) => room.status === "En Servicio"
        );
        setRooms(activatedRooms);
        if (activatedRooms.length > 0) {
          const imageMap = await loadRoomImages(activatedRooms);
          setRoomImagesMap(imageMap);
        } else {
          setRoomImagesMap({});
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
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    document.body.style.overflow = "auto";
  };

  if (loading)
    return (
      <div
        className="loading-indicator-client"
        style={{ textAlign: "center", padding: "50px", fontSize: "1.2rem" }}
      >
        Cargando habitaciones...
      </div>
    );
  if (error)
    return (
      <div
        className="error-indicator-client"
        style={{ textAlign: "center", padding: "50px", color: "red" }}
      >
        Error: {error}
      </div>
    );

  return (
    <>
      <section className="swiper-room-container">
        {" "}
        {/* Clase del contenedor Swiper */}
        <div className="swiper-custom-nav-room">
          {" "}
          {/* Clases para la navegación, asegúrate que Swiper las use */}
          <div className="swiper-button-prev-custom">
            <ChevronLeft size={28} />
          </div>
          <div className="swiper-button-next-custom">
            <ChevronRight size={28} />
          </div>
        </div>
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".swiper-button-next-custom", // Estas clases deben coincidir con los botones de nav
            prevEl: ".swiper-button-prev-custom",
          }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 25 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          className="room-swiper" // Clase opcional para el Swiper
        >
          {rooms.map((room) => (
            <SwiperSlide key={room.idRoom} className="swiper-slide-room">
              {" "}
              {/* Clase para el slide */}
              <article
                className="room-card-client"
                onClick={() => openModal(room)}
              >
                {" "}
                {/* Card */}
                <figure className="room-image-container-client">
                  {" "}
                  {/* Contenedor Imagen */}
                  {roomImagesMap[room.idRoom] ? (
                    <img
                      src={`http://localhost:3000/uploads/${
                        roomImagesMap[room.idRoom]
                      }`}
                      alt={room.name}
                      className="room-image-client"
                    />
                  ) : (
                    <div className="no-image-placeholder-room-client">
                      Sin Imagen
                    </div> 
                  )}
                </figure>
                <div className="room-content-overlay-client">
                  {" "}
                  {/* Overlay */}
                  {/* No necesitas el div .room-text-content aquí si el overlay maneja el flex-end */}
                  <h2 className="room-title-client">{room.name}</h2>
                  {room.description && (
                    <p className="room-description-client">
                      {room.description}
                    </p>
                  )}
                  <div className="room-meta-tags-client">
                    <span className="room-meta-tag-client">
                      <FaBed /> {room.capacity} Persona
                      {room.capacity > 1 ? "s" : ""}
                    </span>
                    {/* Otros meta-tags */}
                  </div>
                  <button className="room-details-button-client">
                    Ver Detalles
                  </button>
                </div>
              </article>
            </SwiperSlide>
          ))}
          {rooms.length === 0 && !loading && (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                padding: "40px",
                color: "#777",
                gridColumn: "1 / -1",
              }}
            >
              No hay habitaciones disponibles en este momento.
            </div>
          )}
        </Swiper>
      </section>

      {selectedRoom && (
        <BedroomDetailClient
          room={selectedRoom}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}

export default BedroomsClient;
// --- END OF FILE BedroomsClient.jsx ---
