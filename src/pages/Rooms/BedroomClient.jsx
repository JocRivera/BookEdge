import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getBedrooms, getBedroomImages } from "../../services/BedroomService";
import { useNavigate } from "react-router-dom";
import "./BedroomClient.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function BedroomsClient() {
  const [bedrooms, setBedrooms] = useState([]);
  const [bedroomImages, setBedroomImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadBedroomImages = async (bedroomList) => {
    const imagesMap = {};
    for (const bedroom of bedroomList) {
      try {
        const images = await getBedroomImages(bedroom.idRoom);
        const primaryImage = images.find((img) => img.isPrimary) || images[0];
        imagesMap[bedroom.id] = primaryImage?.imagePath || null;
      } catch (error) {
        console.error(`Error cargando imágenes para habitación ${bedroom.id}:`, error);
        imagesMap[bedroom.id] = null;
      }
    }
    return imagesMap;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBedrooms();
        const activatedBedrooms = data.filter(bedroom => bedroom.status === "En Servicio");
        setBedrooms(activatedBedrooms);
        const imageMap = await loadBedroomImages(activatedBedrooms);
        setBedroomImages(imageMap);
      } catch (error) {
        setError(error.message || "error al conectar la api");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Función para navegar al detalle de la habitación usando el nombre
  const goToBedroomDetail = (bedroomName) => {
    navigate(`/bedrooms/${encodeURIComponent(bedroomName)}`);
  };

  return (
    <section className="swiper-bedroom-container">
      <h1 className="title-bedroom-home">Nuestras Habitaciones</h1>
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
        {bedrooms.map((bedroom) => (
          <SwiperSlide key={bedroom.id}>
            <article className="bedroom-card-home">
              <figure className="bedroom-imagen-container-home">
                {bedroomImages[bedroom.id] ? (
                  <img
                    src={`http://localhost:3000/uploads/${bedroomImages[bedroom.id]}`}
                    alt={bedroom.name}
                    className="bedroom-image-home"
                  />
                ) : (
                  <div className="no-image-placeholder">Sin imágenes</div>
                )}
                <figcaption className="bedroom-title-home">{bedroom.name}</figcaption>
              </figure>

              <div className="bedroom-details-home">
                <div className="bedroom-meta-home">
                  <span className="meta-item-home">
                    <Users size={16} className="meta-icon-home" />
                    {bedroom.capacity} personas
                  </span>
                  <span className="status-badge-home">{bedroom.status}</span>
                </div>
                <p className="bedroom-description-home">{bedroom.description}</p>
              </div>

              <button 
                className="bedroom-button-home" 
                onClick={() => goToBedroomDetail(bedroom.name)}
              >
                Ver más
              </button>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default BedroomsClient;