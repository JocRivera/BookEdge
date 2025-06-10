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
import { toast } from "react-toastify"; // <--- IMPORTAR TOAST
import { useAlert } from "../../../context/AlertContext"; // <--- IMPORTAR useAlert
import api from "../../../services/api";

const API_BASE_URL = api.defaults.baseURL;

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
  const { showAlert } = useAlert();
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

  // Calcular elementos para la página current
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
    // Recibe el objeto bedroom completo
    showAlert({
      type: "confirm-edit",
      title: "Confirmar Modificación",
      message: `¿Desea modificar la habitación "${bedroom.name}"?`,
      confirmText: "Sí, Modificar",
      onConfirm: () => {
        setSelectedBedroom(bedroom);
        setModalOpen(true); // Abre FormBedrooms
      },
      
    });
   
  };
  // Eliminar habitación
  const handleDelete = async (bedroomToDelete) => {
    // Recibe el objeto bedroom completo
    showAlert({
      type: "confirm-delete",
      title: "Confirmar Eliminación",
      message: `¿Está seguro de eliminar la habitación "${bedroomToDelete.name}"? Esta acción no se puede deshacer.`,
      confirmText: "Sí, Eliminar",
      onConfirm: async () => {
        try {
          await deleteBedroom(bedroomToDelete.idRoom);
          setBedrooms((prevBedrooms) =>
            prevBedrooms.filter(
              (bedroom) => bedroom.idRoom !== bedroomToDelete.idRoom
            )
          );
          toast.success(
            `Habitación "${bedroomToDelete.name}" eliminada correctamente.`
          );
        } catch (error) {
          console.error("Error al eliminar la habitación", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error al eliminar la habitación";
          toast.error(errorMessage);
        }
      },
    });
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

  const handleSaveBedroomSuccess = () => {
    loadBedroomData(); // Recarga los datos
    setModalOpen(false); // Cierra el modal del formulario
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
          // ...
          currentItems.map((bedroom) => (
            <article key={bedroom.idRoom} className="bedroom-card-admin">
              {" "}
              {/* Usando tu clase de BedroomCard */}
              <div className="card-image-container-admin">
                {" "}
                {/* Clase genérica/reusable */}
                {bedroomImages[bedroom.idRoom] ? (
                  <img
                    src={`${API_BASE_URL}/uploads/${bedroomImages[bedroom.idRoom]}`}
                    alt={bedroom.name}
                    className="card-image-admin"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="image-placeholder-admin">Sin imágenes</div> // Clase genérica/reusable
                )}
                {/* Contador de imágenes (arriba a la izquierda) */}
                {bedroom.imageCount > 1 && (
                  <span className="image-counter-badge-admin">
                    {" "}
                    {/* Clase genérica/reusable */}
                    {bedroom.imageCount - 1 === 1
                      ? `${bedroom.imageCount - 1} Imagen más` // Singular
                      : `${bedroom.imageCount - 1} Imágenes más`}{" "}
                  </span>
                )}
                {/* Badge de Estado (arriba a la derecha) */}
                <div
                  className={`status-badge-bedroom ${
                    // Clase específica para bedroom status
                    bedroom.status === "Mantenimiento"
                      ? "maintenance"
                      : bedroom.status === "En Servicio"
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {bedroom.status === "En Servicio"
                    ? "Disponible"
                    : bedroom.status}
                </div>
              </div>
              <div className="card-body-admin">
                {" "}
                {/* Clase genérica/reusable */}
                <div className="bedroom-card-content-top">
                  {" "}
                  {/* Contenedor específico para el contenido superior de bedroom */}
                  <h2 className="bedroom-title-admin">{bedroom.name}</h2>
                  {/* Contenedor para la descripción */}
                  {bedroom.description && (
                    <div className="bedroom-description-admin">
                      {" "}
                      {/* Clase específica para descripción de bedroom */}
                      {bedroom.description}
                    </div>
                  )}
                  <div className="bedroom-meta-details-admin">
                    {" "}
                    {/* Clase específica para meta detalles de bedroom */}
                    <div className="feature-item-admin">
                      {" "}
                      {/* Clase genérica/reusable */}
                      <MdPerson className="feature-icon" />{" "}
                      {/* Clase genérica/reusable */}
                      <span>
                        Capacidad: {bedroom.capacity || "N/A"} personas
                      </span>
                    </div>
                    {/* Otros meta-details si los tienes */}
                  </div>
                </div>
                {/* Footer para los ActionButtons */}
                <footer className="card-footer-actions-admin">
                  <ActionButtons
                    onEdit={() => handleEditBedroom(bedroom)}
                    onDelete={() => handleDelete(bedroom)}
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
        onSaveSuccess={handleSaveBedroomSuccess}
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
