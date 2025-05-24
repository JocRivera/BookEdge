import React, { useState, useEffect, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import { MdPerson } from "react-icons/md";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import CabinDetail from "./CabinDetails";
import FormCabins from "./FormCabins";
import Pagination from "../../common/Paginator/Pagination";
import {
  getCabins,
  getCabinById,
  deleteCabin,
  getCabinImages,
} from "../../../services/CabinService";
import "./CabinCard.css";

function CardCabin() {
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenModal, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cabins, setCabins] = useState([]);
  const [cabinImages, setCabinImages] = useState({});
  const [error, setError] = useState(null);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [viewCabin, setViewCabin] = useState(null);
  const [isDetailOpen, setDetailOpen] = useState(false);

  // Paginación
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);

  // Cargar datos de cabañas e imágenes
  const loadCabinData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCabins();
      setCabins(data);

      // Cargar imágenes principales
      const imagesMap = await loadCabinImages(data);
      setCabinImages(imagesMap);
    } catch (error) {
      setError(error.message || "Error al cargar cabañas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar imágenes para cada cabaña
  const loadCabinImages = async (cabinsList) => {
    const imagesMap = {};

    for (const cabin of cabinsList) {
      try {
        const images = await getCabinImages(cabin.idCabin);
        cabin.imageCount = images.length;
        // Encontrar imagen principal
        const primaryImage = images.find((img) => img.isPrimary) || images[0];
        imagesMap[cabin.idCabin] = primaryImage ? primaryImage.imagePath : null;
      } catch (err) {
        console.error(
          `Error al cargar imágenes para cabaña ${cabin.idCabin}:`,
          err
        );
      }
    }

    return imagesMap;
  };

  // Filtrar cabañas según término de búsqueda
  const filteredCabins = cabins.filter((cabin) =>
    `${cabin.name} ${cabin.description} ${cabin.status} ${cabin.capacity} ${
      cabin.Comforts?.map((c) => c.name).join(" ") || ""
    }`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Calcular elementos para la página actual
  const currentItems = filteredCabins.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCount = Math.ceil(filteredCabins.length / itemsPerPage);

  // Cargar datos iniciales
  useEffect(() => {
    loadCabinData();
  }, [loadCabinData]);

  // Manejar error de carga de imagen
  const handleImageError = (e) => {
    e.target.style.objectFit = "contain";
    e.target.onerror = null;
  };

  // Editar cabaña
  const handleEditCabin = (cabin) => {
    setSelectedCabin(cabin);
    setModalOpen(true);
  };

  // Eliminar cabaña
  const handleDelete = async (idCabin) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cabaña?")) return;

    try {
      await deleteCabin(idCabin);
      setCabins((prevCabins) =>
        prevCabins.filter((cabin) => cabin.idCabin !== idCabin)
      );
    } catch (error) {
      console.error("Error al eliminar la cabaña", error);
    }
  };

  // Ver detalles de cabaña
  const handleView = async (idCabin) => {
    try {
      const cabinData = await getCabinById(idCabin);
      setViewCabin(cabinData);
      setDetailOpen(true);
    } catch (error) {
      console.error("Error al obtener detalles de la cabaña:", error);
    }
  };

  // Actualizar búsqueda y resetear página
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  // Abrir modal para nueva cabaña
  const handleAddCabin = () => {
    setSelectedCabin(null);
    setModalOpen(true);
  };

  return (
    <section className="cabin-container-admin">
      <header className="cabin-header-admin">
        <h1 className="cabin-main-title">Nuestras Cabañas</h1>
      </header>

      {/* Barra de búsqueda y botón de agregar */}
      <div className="cabin-controls-admin">
        <div className="search-wrapper-admin">
          <CiSearch className="search-icon-cabin-admin" />
          <input
            type="text"
            className="search-input-admin"
            placeholder="Buscar cabañas..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <CustomButton variant="primary" icon="add" onClick={handleAddCabin}>
          Agregar Cabaña
        </CustomButton>
      </div>

      {/* Lista de cabañas */}
      <main className="cabin-gallery-admin">
        {loading ? (
          <div className="loading-indicator-admin">
            <div className="loading-spinner-admin"></div>
            <p>Cargando cabañas...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "Error al cargar las cabañas"}
          </div>
        ) : filteredCabins.length === 0 ? (
          <div className="empty-state-admin">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "No hay cabañas disponibles"}
          </div>
        ) : (
          currentItems.map((cabin) => (
            // Dentro de tu .map((cabin) => ( ... ))

            <article key={cabin.idCabin} className="cabin-card-admin">
              <div className="card-image-container-admin">
                {cabinImages[cabin.idCabin] ? (
                  <img
                    src={`http://localhost:3000/uploads/${
                      cabinImages[cabin.idCabin]
                    }`}
                    alt={cabin.name}
                    className="card-image-admin"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="image-placeholder-admin">Sin imágenes</div>
                )}

                {/* Contador de imágenes (arriba a la izquierda) */}
                {cabin.imageCount > 1 && (
                  <span className="image-counter-badge-admin">
                    {/* Si quieres un icono aquí: <Camera size={12} style={{ marginRight: '4px' }} /> */}
                    {cabin.imageCount - 1 === 1
                      ? `${cabin.imageCount - 1} Imagenes más`
                      : `${cabin.imageCount - 1} Imagenes más`}{" "}
                    {/* Adaptar texto */}
                  </span>
                )}

                {/* Badge de Estado (arriba a la derecha) */}
                <div
                  className={`status-badge-cabin ${
                    cabin.status === "Mantenimiento"
                      ? "maintenance"
                      : cabin.status === "En Servicio"
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {cabin.status === "En Servicio" ? "Disponible" : cabin.status}
                </div>
              </div>

              <div className="card-body-admin">
                <div className="cabin-card-content-top">
                  <h2 className="cabin-title-admin">{cabin.name}</h2>

                  {/* Contenedor para la descripción */}
                  {cabin.description && ( // Solo muestra si hay descripción
                    <div className="cabin-description-details-admin">
                      {cabin.description}
                    </div>
                  )}

                  <div className="cabin-meta-details-admin">
                    <div className="feature-item-admin">
                      <MdPerson className="feature-icon" />
                      <span>Capacidad: {cabin.capacity || "N/A"} personas</span>
                    </div>
                    {/* Otros meta-details si los tienes */}
                  </div>
                </div>
                <footer className="card-footer-actions-admin">
                  <ActionButtons
                    onEdit={() => handleEditCabin(cabin)}
                    onDelete={() => handleDelete(cabin.idCabin)}
                    onView={() => handleView(cabin.idCabin)}
                  />
                </footer>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Paginación */}
      {pageCount > 1 && (
        <Pagination
          pageCount={pageCount}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          forcePage={currentPage}
        />
      )}

      {/* Modal de formulario */}
      <FormCabins
        isOpen={isOpenModal}
        onClose={() => setModalOpen(false)}
        onSave={loadCabinData}
        cabinToEdit={selectedCabin}
      />

      {/* Modal de detalles */}
      <CabinDetail
        isOpen={isDetailOpen}
        onClose={() => setDetailOpen(false)}
        cabin={viewCabin}
      />
    </section>
  );
}

export default CardCabin;
