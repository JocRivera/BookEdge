import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaBed } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import {
  getBedrooms,
  getBedroomImages,
} from "../../../services/BedroomService";
import "./BedroomClient.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import BedroomDetailClient from "./BedroomDetails";

function BedroomsClient() {
  const [rooms, setRooms] = useState([]);
  const [roomImages, setRoomImage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRoomImages = async (roomList) => {
    const imagesMap = {};
    for (const room of roomList) {
      try {
        const images = await getBedroomImages(room.idRoom);
        const primaryImage = images.find((img) => img.isPrimary) || images[0];
        imagesMap[room.idRoom] = primaryImage?.imagePath || null;
      } catch (error) {
        console.error(
          `Error cargando imágenes para cabaña ${room.idRoom}:`,
          error
        );
        imagesMap[room.idRoom] = null;
      }
    }
    return imagesMap;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBedrooms();
        const activatedRooms = data.filter(
          (room) => room.status === "En Servicio"
        );
        setRooms(activatedRooms);
        const imageMap = await loadRoomImages(activatedRooms);
        setRoomImage(imageMap);
      } catch (error) {
        setError(error.message || "error al conectar la api");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openModal = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <section className="swiper-room-container">
        <div className="swiper-custom-nav">
          <div className="swiper-button-prev-custom">
            <ChevronLeft size={30} />
          </div>

          <div className="swiper-button-next-custom">
            <ChevronRight size={30} />
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {rooms.map((room) => (
            <SwiperSlide key={room.idRoom}>
              <article className="room-card-home">
                <figure className="room-imagen-container-home">
                  {roomImages[room.idRoom] ? (
                    <img
                      src={`http://localhost:3000/uploads/${
                        roomImages[room.idRoom]
                      }`}
                      alt={room.name}
                      className="room-image-home"
                    />
                  ) : (
                    <div className="no-image-placeholder">Sin imágenes</div>
                  )}
                  <figcaption className="room-title-home">
                    {room.name}
                  </figcaption>

                  <div className="room-details-home">
                    <div className="room-meta-home">
                      <span className="meta-item-home">
                        <FaBed size={16} className="meta-icon-home" />
                        {room.capacity} personas
                      </span>
                    </div>
                  </div>
                  <div className="room-button-container">
                    <button
                      className="room-button-home"
                      onClick={() => openModal(room)}
                    >
                      Ver detalles
                    </button>
                  </div>
                </figure>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <BedroomDetailClient
      room={selectedRoom}
      isOpen={isModalOpen}
      onClose={closeModal}
      />
    </>
  );
}

export default BedroomsClient;
