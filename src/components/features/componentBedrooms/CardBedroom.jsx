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
} from "../../../services/bedroomService";
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
  const itemsPerPage = 3;
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
        bedroom.imageCount = images.length; // 👈 Esto es lo que falta
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
    <section className="container-bedrooms">
      <div className="title-container">
        <h1 className="title-bedroom">Nuestras Habitaciones</h1>
      </div>

      {/* Barra de búsqueda y botón de agregar */}
      <div className="bedroom-search">
        <div>
          <CiSearch className="search-icon" />
          <input
            type="text"
            className="search"
            placeholder="Buscar ..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <CustomButton variant="primary" icon="add" onClick={handleAddBedroom}>
          Agregar Habitación
        </CustomButton>
      </div>

      {/* Lista de habitaciones */}
      <main className="bedroom-list">
        {loading ? (
          <div className="loading-state">Cargando habitaciones...</div>
        ) : error ? (
          <div className="no-results">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "Error al cargar las habitaciones"}
          </div>
        ) : filteredBedrooms.length === 0 ? (
          <div className="no-results">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "No hay habitaciones disponibles"}
          </div>
        ) : (
          currentItems.map((bedroom) => (
            <article key={bedroom.idRoom} className="bedroom-card">
              {/* Imagen de la habitación */}
              <div className="image-wrapper">
                {bedroomImages[bedroom.idRoom] ? (
                  <img
                    src={`http://localhost:3000/uploads/${
                      bedroomImages[bedroom.idRoom]
                    }`}
                    alt={bedroom.name}
                    className="bedroom-image"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="no-image-placeholder">Sin imágenes</div>
                )}
                {bedroom.imageCount > 1 && (
                  <span className="multiple-images-badge">
                    +{bedroom.imageCount - 1}
                  </span>
                )}
              </div>

              {/* Detalles de la habitación */}
              <section className="bedrooms-details">
                <header className="bedroom-header">
                  <h2>{bedroom.name}</h2>
                  <span
                    className={`bedroom-status ${
                      bedroom.status === "Mantenimiento"
                        ? "status-en-mantenimiento"
                        : bedroom.status === "En Servicio"
                        ? "status-en-servicio"
                        : "status-fuera-de-servicio"
                    }`}
                  >
                    {bedroom.status}
                  </span>
                </header>

                <p className="bedroom-description">
                  {bedroom.description || "Sin descripción"}
                </p>

                <div className="bedroom-meta">
                  {/* Capacidad */}
                  <span className="capacity-info">
                    <MdPerson className="icon-person" />
                    <span className="label">Capacidad:</span>{" "}
                    {bedroom.capacity || "N/A"}
                  </span>

                  {/* Comodidades */}
                  <div className="comforts-section">
                    <div className="comforts-info">
                      <MdPerson className="icon-person" />
                      <span className="label">Comodidades:</span>
                    </div>
                    <div className="bedroom-comforts">
                      {bedroom.Comforts && bedroom.Comforts.length > 0 ? (
                        <>
                          {bedroom.Comforts.slice(0, 3).map((comfort) => (
                            <span
                              key={comfort.idComfort || Math.random()}
                              className="comfort-badge"
                            >
                              {comfort.name}
                            </span>
                          ))}
                          {bedroom.Comforts.length > 3 && (
                            <span className="comfort-badge more-comforts">
                              +{bedroom.Comforts.length - 3}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="no-comforts">
                          Sin comodidades asignadas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <footer className="bedroom-actions">
                  <ActionButtons
                    onEdit={() => handleEditBedroom(bedroom)}
                    onDelete={() => handleDelete(bedroom.idRoom)}
                    onView={() => handleView(bedroom.idRoom)}
                  />
                </footer>
              </section>
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
