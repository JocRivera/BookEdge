import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCabins, getCabinImages } from "../../services/CabinService";
import {
  Users,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import "./CabinClient.css";

const CabinDetailClient = () => {
  const { cabinName } = useParams();
  const navigate = useNavigate();
  const [cabin, setCabin] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCabinData = async () => {
      try {
        setLoading(true);
        const cabinsData = await getCabins();
        const decodedCabinName = decodeURIComponent(cabinName);
        const foundCabin = cabinsData.find((c) => c.name === decodedCabinName);

        setCabin(foundCabin);
        const imagesData = await getCabinImages(foundCabin.idCabin);
        setImages(imagesData);

        if (imagesData.length > 0) {
          const primaryImage = imagesData.find((img) => img.isPrimary);
          if (primaryImage) {
            setCurrentImageIndex(imagesData.indexOf(primaryImage));
          }
        }
      } catch (err) {
        setError("Error al cargar los datos de la cabaña");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCabinData();
  }, [cabinName]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

 const  handleToReturn =() =>{
 navigate("/")
 } 

  if (loading) return <p className="cabin-details-loading">Cargando...</p>;
  if (error) return <p className="cabin-details-error">{error}</p>;
  if (!cabin)
    return <p className="cabin-details-error">No se encontró la cabaña</p>;

  return (
    <main className="cabin-details-container">
      <button className="cabin-details-back-button" onClick={() => handleToReturn()}>
        <ArrowLeft size={18} />
        <span>Volver</span>
      </button>

      <header className="cabin-details-header">
        <h1 className="cabin-details-title">{cabin.name}</h1>
        <p className="cabin-details-meta">
          <span className="cabin-details-capacity">
            <Users size={18} />
            {cabin.capacity} personas
          </span>
          <span
            className={`cabin-details-status ${
              cabin.status === "En Servicio" ? "active" : "inactive"
            }`}
          >
            {cabin.status}
          </span>
        </p>
      </header>

      <section className="cabin-details-gallery">
        <figure className="cabin-details-main-image">
          {images.length > 0 ? (
            <>
              <img
                src={`http://localhost:3000/uploads/${images[currentImageIndex].imagePath}`}
                alt={`${cabin.name} - Vista ${currentImageIndex + 1}`}
              />

              <figcaption className="cabin-details-image-counter">
                {currentImageIndex + 1} / {images.length}
              </figcaption>
            </>
          ) : (
            <p className="cabin-details-no-image">No hay imágenes disponibles</p>
          )}

          {images.length > 1 && (
            <>
              <button
                className="cabin-details-gallery-nav-button prev"
                onClick={prevImage}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                className="cabin-details-gallery-nav-button next"
                onClick={nextImage}
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </figure>

        {images.length > 1 && (
          <nav className="cabin-details-thumbnails">
            {images.map((image, index) => (
              <button
                key={image.id || index}
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
          </nav>
        )}
      </section>

      <section className="cabin-details-info">
        <article className="cabin-details-description">
          <h2>Descripción</h2>
          <p>{cabin.description}</p>
        </article>

        {cabin.Comforts && cabin.Comforts.length > 0 ? (
          <article className="cabin-details-amenities">
            <h2>Comodidades</h2>
            <div className="cabin-details-comfort-tags">
              {cabin.Comforts.map((comfort) => (
                <div key={comfort.idComfort} className="cabin-details-comfort-badge">
                  <span className="cabin-details-comfort-text">{comfort.name}</span>
                  <CheckCircle size={18} className="cabin-details-comfort-icon" />
                </div>
              ))}
            </div>
          </article>
        ) : (
          <article className="cabin-details-amenities">
            <h2>Comodidades</h2>
            <p>No hay comodidades registradas para esta cabaña</p>
          </article>
        )}
      </section>

      <section className="cabin-details-booking">
        <button className="cabin-details-booking-button">Reservar</button>
      </section>
    </main>
  );
};

export default CabinDetailClient;