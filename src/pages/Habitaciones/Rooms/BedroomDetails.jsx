import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBedrooms,
  getBedroomImages,
} from "../../../services/BedroomService";
import { X, ChevronLeft, ChevronRight, Users, CheckCircle } from "lucide-react";
import api from "../../../services/api";

import "./BedroomClient.css";

const BedroomDetailClient = ({ room, isOpen, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState([]);
  const [error, setError] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const API_BASE_URL = api.defaults.baseURL;

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!room) return;

      try {
        setLoading(true);
        const imagesData = await getBedroomImages(room.idRoom);
        if (!Array.isArray(imagesData)) {
          throw new Error("Formado de imagenes Invalido");
        }
        setImages(imagesData);

        if (imagesData.length > 0) {
          const primaryIndex = imagesData.findIndex((img) => img.isPrimary);
          setCurrentImageIndex(primaryIndex !== -1 ? primaryIndex : 0);
        }
      } catch (error) {
        console.error("Error fetching room images:", error);
        setError("Error al cargar las imágenes de la cabaña");
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen && room) {
      fetchRoomData();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [room, isOpen]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen || !room) return null;
  return (
    <div className="rooms-modal-overlay" onClick={onClose}>
      <div className="rooms-modal-container-client" onClick={handleModalClick}>
        <button className="rooms-details-close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="rooms-details-content">
          <section className="rooms-details-gallery">
            {loading ? (
              <div className="rooms-details-loading">Cargando imágenes...</div>
            ) : images.length > 0 ? (
              <>
                <div className="rooms-details-main-image-container">
                  <img
                    src={`${API_BASE_URL}/uploads/${images[currentImageIndex].imagePath}`}
                    alt={`${room.name} - Vista ${currentImageIndex + 1}`}
                    className="rooms-details-image"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        className="rooms-details-nav-button prev"
                        onClick={prevImage}
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft size={24} />
                      </button>

                      <button
                        className="rooms-details-nav-button next"
                        onClick={nextImage}
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight size={24} />
                      </button>

                      <div className="rooms-details-image-counter">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="rooms-details-thumbnails-container">
                    <div className="rooms-details-thumbnails">
                      {images.map((image, index) => (
                        <button
                          key={image.idRoomImage || index}
                          className={`rooms-details-thumbnail ${
                            currentImageIndex === index ? "active" : ""
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                          aria-label={`Ver imagen ${index + 1}`}
                        >
                          <img
                            src={`${API_BASE_URL}/uploads/${image.imagePath}`}
                            alt={`Miniatura ${index + 1}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rooms-details-no-image">
                <p>No hay imágenes disponibles</p>
              </div>
            )}
          </section>

          <section className="rooms-details-info">
            <header className="rooms-details-header">
              <h1 className="rooms-details-title">{room.name}</h1>
              <div className="rooms-details-specs">
                <div className="rooms-details-spec">
                  <Users size={20} className="rooms-details-spec-icon" />
                  <span>Capacidad para {room.capacity} personas</span>
                </div>
              </div>
            </header>

            <div className="rooms-details-sections">
              <article className="rooms-details-description">
                <h2 className="rooms-section-title">Descripción</h2>
                <p className="rooms-details-text">
                  {room.description || "Sin descripción disponible"}
                </p>
              </article>

              <article className="rooms-details-amenities">
                <h2 className="rooms-section-title">Comodidades</h2>
                {room.Comforts && room.Comforts.length > 0 ? (
                  <div className="rooms-details-comfort-tags">
                    {room.Comforts.map((comfort) => (
                      <div
                        key={comfort.idComfort}
                        className="rooms-details-comfort-badge"
                      >
                        <CheckCircle
                          size={16}
                          className="rooms-details-comfort-icon"
                        />
                        <span className="rooms-details-comfort-text">
                          {comfort.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rooms-details-no-comforts">
                    No hay comodidades registradas
                  </p>
                )}
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BedroomDetailClient;
