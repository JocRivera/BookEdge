import React, { useState, useEffect } from "react";
import { getCabinImages } from "../../../services/CabinService";
import { X, ChevronLeft, ChevronRight, Users, CheckCircle } from "lucide-react";
import "./CabinClient.css";

const CabinDetailClient = ({ cabin, isOpen, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCabinData = async () => {
      if (!cabin) return;

      try {
        setLoading(true);
        const imagesData = await getCabinImages(cabin.idCabin);

        if (!Array.isArray(imagesData)) {
          throw new Error("Formato de imágenes inválido");
        }

        setImages(imagesData);

        if (imagesData.length > 0) {
          const primaryIndex = imagesData.findIndex((img) => img.isPrimary);
          setCurrentImageIndex(primaryIndex !== -1 ? primaryIndex : 0);
        }
      } catch (err) {
        console.error("Error fetching cabin images:", err);
        setError("Error al cargar las imágenes de la cabaña");
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && cabin) {
      fetchCabinData();
      // Bloquear el scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }
    
    // Restaurar el scroll cuando se cierra
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [cabin, isOpen]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen || !cabin) return null;

  return (
    <div className="cabin-modal-overlay" onClick={onClose}>
      <div className="cabin-modal-container-client" onClick={handleModalClick}>
        <button className="cabin-details-close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="cabin-details-content">
          <section className="cabin-details-gallery">
            {loading ? (
              <div className="cabin-details-loading">Cargando imágenes...</div>
            ) : images.length > 0 ? (
              <>
                <div className="cabin-details-main-image-container">
                  <img
                    src={`http://localhost:3000/uploads/${images[currentImageIndex].imagePath}`}
                    alt={`${cabin.name} - Vista ${currentImageIndex + 1}`}
                    className="cabin-details-image"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button 
                        className="cabin-details-nav-button prev" 
                        onClick={prevImage}
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      
                      <button 
                        className="cabin-details-nav-button next" 
                        onClick={nextImage}
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight size={24} />
                      </button>
                      
                      <div className="cabin-details-image-counter">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="cabin-details-thumbnails-container">
                    <div className="cabin-details-thumbnails">
                      {images.map((image, index) => (
                        <button
                          key={image.idCabinImage || index}
                          className={`cabin-details-thumbnail ${
                            currentImageIndex === index ? "active" : ""
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                          aria-label={`Ver imagen ${index + 1}`}
                        >
                          <img
                            src={`http://localhost:3000/uploads/${image.imagePath}`}
                            alt={`Miniatura ${index + 1}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="cabin-details-no-image">
                <p>No hay imágenes disponibles</p>
              </div>
            )}
          </section>

          <section className="cabin-details-info">
            <header className="cabin-details-header">
              <h1 className="cabin-details-title">{cabin.name}</h1>
              <div className="cabin-details-specs">
                <div className="cabin-details-spec">
                  <Users size={20} className="cabin-details-spec-icon" />
                  <span>Capacidad para {cabin.capacity} personas</span>
                </div>
              </div>
            </header>

            <div className="cabin-details-sections">
              <article className="cabin-details-description">
                <h2 className="section-title">Descripción</h2>
                <p className="cabin-details-text">{cabin.description || "Sin descripción disponible"}</p>
              </article>

              <article className="cabin-details-amenities">
                <h2 className="section-title">Comodidades</h2>
                {cabin.Comforts && cabin.Comforts.length > 0 ? (
                  <div className="cabin-details-comfort-tags">
                    {cabin.Comforts.map((comfort) => (
                      <div
                        key={comfort.idComfort}
                        className="cabin-details-comfort-badge"
                      >
                        <CheckCircle size={16} className="cabin-details-comfort-icon" />
                        <span className="cabin-details-comfort-text">
                          {comfort.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="cabin-details-no-comforts">No hay comodidades registradas</p>
                )}
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CabinDetailClient;