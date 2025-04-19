import React, { useState, useEffect } from "react";
import { MdClose, MdPerson } from "react-icons/md";
import { getCabinImages } from "../../../services/CabinService";
import "./Cabincard.css";

const CabinDetail = ({ isOpen, onClose, cabin }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isOpen && cabin) {
      loadCabinImages();
    } else {
      setImages([]);
      setSelectedImage(null);
    }
  }, [isOpen, cabin]);

  const loadCabinImages = async () => {
    try {
      const cabinImages = await getCabinImages(cabin.idCabin);
      setImages(cabinImages);

      // Seleccionar imagen principal o la primera disponible
      const primaryImage =
        cabinImages.find((img) => img.isPrimary) || cabinImages[0];
      if (primaryImage) {
        setSelectedImage(primaryImage.imagePath);
      }
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  if (!isOpen || !cabin) return null;

  return (
    <div className="modal-overlay">
      <div className="detail-modal-container">
        <div className="modal-header">
          <h2>Detalles de la Cabaña</h2>
          <button className="close-button" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-image-gallery">
            {/* Imagen principal */}
            <div className="main-image-container">
              {selectedImage ? (
                <img
                  src={`http://localhost:3000/uploads/${selectedImage}`}
                  alt={cabin.name}
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
                    key={image.idCabinImage}
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
            <h1 className="detail-title">{cabin.name}</h1>
            <div className="detail-status">
              <span
                className={`cabin-status ${
                  cabin.status === "Mantenimiento"
                    ? "status-en-mantenimiento"
                    : cabin.status === "En Servicio"
                    ? "status-en-servicio"
                    : "status-fuera-de-servicio"
                }`}
              >
                {cabin.status}
              </span>
            </div>
            <div className="detail-capacity">
              <MdPerson className="icon-person" />
              <span>Capacidad: {cabin.capacity} personas</span>
            </div>
            <div className="detail-description">
              <h3>Descripción</h3>
              <p>{cabin.description || "Sin descripción disponible."}</p>
            </div>
            {cabin.Comforts && cabin.Comforts.length > 0 ? (
              <div className="detail-comforts">
                <h3>Comodidades</h3>
                <div className="comfort-tags">
                  {cabin.Comforts.map((comfort) => (
                    <span key={comfort.idComfort} className="comfort-badge">
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
            )}{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CabinDetail;
