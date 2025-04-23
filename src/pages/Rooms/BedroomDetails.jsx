import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBedrooms, getBedroomImages } from "../../services/BedroomService";
import {
  Users,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import "./BedroomClient.css";

const BedroomDetailClient = () => {
  const { bedroomName } = useParams();
  const navigate = useNavigate();
  const [bedroom, setBedroom] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchBedroomData = async () => {
      try {
        setLoading(true);
        const bedroomsData = await getBedrooms();
        const decodedBedroomName = decodeURIComponent(bedroomName);
        const foundBedroom = bedroomsData.find((b) => b.name === decodedBedroomName);

        setBedroom(foundBedroom);
        
        const imagesData = await getBedroomImages(foundBedroom.idRoom);
        setImages(imagesData);

        if (imagesData.length > 0) {
          const primaryImage = imagesData.find((img) => img.isPrimary);
          if (primaryImage) {
            setCurrentImageIndex(imagesData.indexOf(primaryImage));
          }
        }
      } catch (err) {
        setError("Error al cargar los datos de la habitación");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBedroomData();
  }, [bedroomName]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleToReturn = () => {
    navigate("/");
  }; 

  if (loading) return <p className="bedroom-details-loading">Cargando...</p>;
  if (error) return <p className="bedroom-details-error">{error}</p>;
  if (!bedroom)
    return <p className="bedroom-details-error">No se encontró la habitación</p>;

  return (
    <main className="bedroom-details-container">
      <button className="bedroom-details-back-button" onClick={() => handleToReturn()}>
        <ArrowLeft size={18} />
        <span>Volver</span>
      </button>

      <header className="bedroom-details-header">
        <h1 className="bedroom-details-title">{bedroom.name}</h1>
        <p className="bedroom-details-meta">
          <span className="bedroom-details-capacity">
            <Users size={18} />
            {bedroom.capacity} personas
          </span>
          <span
            className={`bedroom-details-status ${
              bedroom.status === "En Servicio" ? "active" : "inactive"
            }`}
          >
            {bedroom.status}
          </span>
        </p>
      </header>

      <section className="bedroom-details-gallery">
        <figure className="bedroom-details-main-image">
          {images.length > 0 ? (
            <>
              <img
                src={`http://localhost:3000/uploads/${images[currentImageIndex].imagePath}`}
                alt={`${bedroom.name} - Vista ${currentImageIndex + 1}`}
              />

              <figcaption className="bedroom-details-image-counter">
                {currentImageIndex + 1} / {images.length}
              </figcaption>
            </>
          ) : (
            <p className="bedroom-details-no-image">No hay imágenes disponibles</p>
          )}

          {images.length > 1 && (
            <>
              <button
                className="bedroom-details-gallery-nav-button prev"
                onClick={prevImage}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                className="bedroom-details-gallery-nav-button next"
                onClick={nextImage}
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </figure>

        {images.length > 1 && (
          <nav className="bedroom-details-thumbnails">
            {images.map((image, index) => (
              <button
                key={image.id || index}
                className={`bedroom-details-thumbnail ${
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
          </nav>
        )}
      </section>

      <section className="bedroom-details-info">
        <article className="bedroom-details-description">
          <h2>Descripción</h2>
          <p>{bedroom.description}</p>
        </article>

        {bedroom.Comforts && bedroom.Comforts.length > 0 ? (
          <article className="bedroom-details-amenities">
            <h2>Comodidades</h2>
            <div className="bedroom-details-comfort-tags">
              {bedroom.Comforts.map((comfort) => (
                <div key={comfort.idComfort} className="bedroom-details-comfort-badge">
                  <span className="bedroom-details-comfort-text">{comfort.name}</span>
                  <CheckCircle size={18} className="bedroom-details-comfort-icon" />
                </div>
              ))}
            </div>
          </article>
        ) : (
          <article className="bedroom-details-amenities">
            <h2>Comodidades</h2>
            <p>No hay comodidades registradas para esta habitación</p>
          </article>
        )}
      </section>

      <section className="bedroom-details-booking">
        <button className="bedroom-details-booking-button">Reservar</button>
      </section>
    </main>
  );
};

export default BedroomDetailClient;