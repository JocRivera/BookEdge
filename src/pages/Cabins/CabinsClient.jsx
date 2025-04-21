import { Users, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getCabins, getCabinImages } from "../../services/CabinService";
import { useNavigate } from "react-router-dom";
import "./CabinClient.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function CabinsClient() {
  const [cabins, setCabins] = useState([]);
  const [cabinImages, setCabinImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadCabinImages = async (cabinList) => {
    const imagesMap = {};
    for (const cabin of cabinList) {
      try {
        const images = await getCabinImages(cabin.idCabin);
        const primaryImage = images.find((img) => img.isPrimary) || images[0];
        imagesMap[cabin.idCabin] = primaryImage?.imagePath || null;
      } catch (error) {
        console.error(`Error cargando imágenes para cabaña ${cabin.idCabin}:`, error);
        imagesMap[cabin.idCabin] = null;
      }
    }
    return imagesMap;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCabins();
        const activatedCabins = data.filter(cabin => cabin.status === "En Servicio");
        setCabins(activatedCabins);
        const imageMap = await loadCabinImages(activatedCabins);
        setCabinImages(imageMap);
      } catch (error) {
        setError(error.message || "error al conectar la api");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Función para navegar al detalle de la cabaña usando el nombre
  const goToCabinDetail = (cabinName) => {
    navigate(`/cabins/${encodeURIComponent(cabinName)}`);
  };

  return (
    <section className="swiper-cabin-container">
        <h1 className="title-cabin-home">Nuestras Cabañas</h1>
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
        {cabins.map((cabin) => (
          <SwiperSlide key={cabin.idCabin}>
            <article className="cabin-card-home">
              <figure className="cabin-imagen-container-home">
                {cabinImages[cabin.idCabin] ? (
                  <img
                    src={`http://localhost:3000/uploads/${cabinImages[cabin.idCabin]}`}
                    alt={cabin.name}
                    className="cabin-image-home"
                  />
                ) : (
                  <div className="no-image-placeholder">Sin imágenes</div>
                )}
                <figcaption className="cabin-title-home">{cabin.name}</figcaption>
              </figure>

              <div className="cabin-details-home">
                <div className="cabin-meta-home">
                  <span className="meta-item-home">
                    <Users size={16} className="meta-icon-home" />
                    {cabin.capacity} personas
                  </span>
                  <span className="status-badge-home">{cabin.status}</span>
                </div>
                <p className="cabin-description-home">{cabin.description}</p>
              </div>

              {/* Botón actualizado para navegar usando el nombre */}
              <button 
                className="cabin-button-home" 
                onClick={() => goToCabinDetail(cabin.name)}
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

export default CabinsClient;