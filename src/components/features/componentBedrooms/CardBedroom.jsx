import React, { useState, useEffect, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import { MdPerson } from "react-icons/md";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import BedroomDetail from "./BedroomDetail";
import FormBedrooms from "./FormBedRoom";
import Pagination from "../../common/Paginator/Pagination";
import {
  getBedrooms,
  getBedroomById,
  deleteBedroom,
  getBedroomImages,
} from "../../../services/BedroomService";
import "./BedroomCard.css";

function BedroomCard() {
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenModal, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bedrooms, setBedrooms] = useState([]);
  const [bedroomImages, setBedroomImages] = useState({});
  const [error, setError] = useState(null);
  const [selectedBedroom, setSelectedBedroom] = useState(null);
  const [viewBedroom, setViewBedroom] = useState(null);
  const [isDetailOpen, setDetailOpen] = useState(false);

  // Paginación
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(0);

  // Cargar datos de habitaciones e imágenes
  const loadBedroomData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBedrooms();
      setBedrooms(data);

      // Cargar imágenes principales
      const imagesMap = await loadBedroomImages(data);
      setBedroomImages(imagesMap);
    } catch (error) {
      setError(error.message || "Error al cargar habitaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar imágenes para cada habitación
  const loadBedroomImages = async (bedroomsList) => {
    const imagesMap = {};

    for (const bedroom of bedroomsList) {
      try {
        const images = await getBedroomImages(bedroom.idRoom);
        bedroom.imageCount = images.length;
        // Encontrar imagen principal
        const primaryImage = images.find((img) => img.isPrimary) || images[0];
        imagesMap[bedroom.idRoom] = primaryImage
          ? primaryImage.imagePath
          : null;
      } catch (err) {
        console.error(
          `Error al cargar imágenes para habitación ${bedroom.idRoom}:`,
          err
        );
      }
    }

    return imagesMap;
  };

  // Filtrar habitaciones según término de búsqueda
  const filteredBedrooms = bedrooms.filter((bedroom) =>
    `${bedroom.name} ${bedroom.description} ${bedroom.status} ${
      bedroom.capacity
    } 
     ${bedroom.Comforts?.map((c) => c.name).join(" ") || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Calcular elementos para la página actual
  const currentItems = filteredBedrooms.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCount = Math.ceil(filteredBedrooms.length / itemsPerPage);

  // Cargar datos iniciales
  useEffect(() => {
    loadBedroomData();
  }, [loadBedroomData]);

  // Manejar error de carga de imagen
  const handleImageError = (e) => {
    e.target.style.objectFit = "contain";
    e.target.onerror = null;
  };

  // Editar habitación
  const handleEditBedroom = (bedroom) => {
    setSelectedBedroom(bedroom);
    setModalOpen(true);
  };

  // Eliminar habitación
  const handleDelete = async (idRoom) => {
    if (!window.confirm("¿Estás seguro de eliminar esta habitación?")) return;

    try {
      await deleteBedroom(idRoom);
      setBedrooms((prevBedrooms) =>
        prevBedrooms.filter((bedroom) => bedroom.idRoom !== idRoom)
      );
    } catch (error) {
      console.error("Error al eliminar la habitación", error);
    }
  };

  // Ver detalles de habitación
  const handleView = async (idRoom) => {
    try {
      const bedroomData = await getBedroomById(idRoom);
      setViewBedroom(bedroomData);
      setDetailOpen(true);
    } catch (error) {
      console.error("Error al obtener detalles de la habitación:", error);
    }
  };

  // Actualizar búsqueda y resetear página
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  // Abrir modal para nueva habitación
  const handleAddBedroom = () => {
    setSelectedBedroom(null);
    setModalOpen(true);
  };

  return (
    <section className="bedroom-container">
      <header className="bedroom-header">
        <h1 className="bedroom-main-title">Nuestras Habitaciones</h1>
      </header>

      {/* Barra de búsqueda y botón de agregar */}
      <div className="bedroom-controls">
        <div className="search-wrapper">
          <CiSearch className="search-icon-room" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar habitaciones..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <CustomButton variant="primary" icon="add" onClick={handleAddBedroom}>
          Agregar Habitación
        </CustomButton>
      </div>

      {/* Lista de habitaciones */}
      <main className="bedroom-gallery">
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Cargando habitaciones...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "Error al cargar las habitaciones"}
          </div>
        ) : filteredBedrooms.length === 0 ? (
          <div className="empty-state">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "No hay habitaciones disponibles"}
          </div>
        ) : (
          currentItems.map((bedroom) => (
            <article key={bedroom.idRoom} className="bedroom-card">
              {/* Imagen de la habitación */}
              <div className="card-image-container">
                {bedroomImages[bedroom.idRoom] ? (
                  <img
                    src={`http://localhost:3000/uploads/${
                      bedroomImages[bedroom.idRoom]
                    }`}
                    alt={bedroom.name}
                    className="card-image"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="image-placeholder">Sin imágenes</div>
                )}

                {bedroom.imageCount > 1 && (
                  <span className="image-counter">
                    +{bedroom.imageCount - 1}
                  </span>
                )}

                <div
                  className={`status-badge ${
                    bedroom.status === "Mantenimiento"
                      ? "maintenance"
                      : bedroom.status === "En Servicio"
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {bedroom.status === "En Servicio" ? (
                    <span className="status-text">Disponible</span>
                  ) : (
                    <span className="status-text">{bedroom.status}</span>
                  )}
                </div>
              </div>

              <div className="card-content">
                <h2 className="room-title">{bedroom.name}</h2>

                <div className="room-features">
                  <div className="feature-item">
                    <MdPerson className="feature-icon" />
                    <span>Capacidad: {bedroom.capacity || "N/A"}</span>
                  </div>
                </div>

                <footer className="card-actions">
                  <ActionButtons
                    onEdit={() => handleEditBedroom(bedroom)}
                    onDelete={() => handleDelete(bedroom.idRoom)}
                    onView={() => handleView(bedroom.idRoom)}
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
      <FormBedrooms
        isOpen={isOpenModal}
        onClose={() => setModalOpen(false)}
        onSave={loadBedroomData}
        bedroomToEdit={selectedBedroom}
      />

      {/* Modal de detalles */}
      <BedroomDetail
        isOpen={isDetailOpen}
        onClose={() => setDetailOpen(false)}
        bedroom={viewBedroom}
      />
    </section>
  );
}

export default BedroomCard;
