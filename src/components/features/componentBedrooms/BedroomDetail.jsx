import React, { useState, useEffect } from "react";
import { MdClose, MdPerson } from "react-icons/md";
import "./BedroomDetails.css";
import { getBedroomImages } from "../../../services/BedroomService";

const BedroomDetail = ({ isOpen, onClose, bedroom, loading }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isOpen && bedroom) {
      loadBedroomImages();
    } else {
      setImages([]);
      setSelectedImage(null);
    }
  }, [isOpen, bedroom]);

  const loadBedroomImages = async () => {
    try {
      const roomImages = await getBedroomImages(bedroom.idRoom);
      setImages(roomImages);

      // Seleccionar imagen principal o la primera disponible
      const primaryImage =
        roomImages.find((img) => img.isPrimary) || roomImages[0];
      if (primaryImage) {
        setSelectedImage(primaryImage.imagePath);
      }
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  if (!isOpen || !bedroom) return null;

  return (
    <div className="modal-overlay">
      <div className="detail-modal-container">
        <div className="modal-header">
          <h2>Detalles de la Habitación</h2>
          <button className="close-button" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        {loading ? (
          <div className="loading-details">
            <p>Cargando detalles...</p>
          </div>
        ) : !bedroom ? (
          <div className="error-details">
            <p>No se pudo cargar la información de la habitación</p>
          </div>
        ) : (
          <div className="detail-content">
            <div className="detail-image-gallery">
              {/* Imagen principal */}
              <div className="main-image-container">
                {selectedImage ? (
                  <img
                    src={`http://localhost:3000/uploads/${selectedImage}`}
                    alt={bedroom.name}
                    className="main-detail-image"
                  />
                ) : bedroom.imagen ? (
                  <img
                    src={`http://localhost:3000/uploads/${bedroom.imagen}`}
                    alt={bedroom.name}
                    className="main-detail-image"
                  />
                ) : (
                  <div className="no-image">No hay imágenes disponibles</div>
                )}
              </div>

              {/* Miniaturas de imágenes */}
              {images.length > 1 && (
                <div className="image-thumbnails">
                  {images.map((image) => (
                    <div
                      key={image.idBedroomImage || Math.random()}
                      className={`thumbnail ${
                        selectedImage === image.imagePath ? "active" : ""
                      }`}
                      onClick={() => setSelectedImage(image.imagePath)}
                    >
                      <img
                        src={`http://localhost:3000/uploads/${image.imagePath}`}
                        alt="Thumbnail"
                      />
                      {image.isPrimary && <span className="primary-badge"></span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-info">
              <h1 className="detail-title">{bedroom.name}</h1>
              <div className="detail-status">
                <span
                  className={`bedroom-status ${
                    bedroom.status === "En Mantenimiento"
                      ? "status-en-mantenimiento"
                      : bedroom.status === "En Servicio"
                      ? "status-en-servicio"
                      : "status-fuera-de-servicio"
                  }`}
                >
                  {bedroom.status}
                </span>
              </div>
              <div className="detail-capacity">
                <MdPerson className="icon-person" />
                <span>Capacidad: {bedroom.capacity || "No especificada"} personas</span>
              </div>
              <div className="detail-description">
                <h3>Descripción</h3>
                <p>{bedroom.description || "Sin descripción disponible."}</p>
              </div>
              {bedroom.Comforts && bedroom.Comforts.length > 0 ? (
                <div className="detail-comforts">
                  <h3>Comodidades</h3>
                  <div className="comfort-tags">
                    {bedroom.Comforts.map((comfort) => (
                      <span key={comfort.idComfort || Math.random()} className="comfort-badge">
                        {comfort.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="detail-comforts">
                  <h3>Comodidades</h3>
                  <p>No hay comodidades registradas</p>
                </div>
              )}
            </div>
          </div>
        )}

     
      </div>
    </div>
  );
};

export default BedroomDetail;