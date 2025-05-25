// src/features/componentCabins/CardCabin.jsx

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
import { toast } from "react-toastify"; // Mantienes toast para éxito/error de operación
import "react-toastify/dist/ReactToastify.css";
import { useAlert } from "../../../context/AlertContext"; // <--- IMPORTAMOS useAlert

function CardCabin() {
  // Estados (como los tenías)
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenModal, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cabins, setCabins] = useState([]);
  const [cabinImages, setCabinImages] = useState({});
  const [error, setError] = useState(null);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [viewCabin, setViewCabin] = useState(null);
  const [isDetailOpen, setDetailOpen] = useState(false);

  // Paginación (como la tenías)
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);

  const { showAlert } = useAlert(); // <--- OBTENEMOS showAlert

  // Cargar datos de cabañas e imágenes (tu lógica original)
  const loadCabinData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCabins();
      setCabins(data);

      const imagesMap = await loadCabinImages(data);
      setCabinImages(imagesMap);
    } catch (error) {
      setError(error.message || "Error al cargar cabañas");
      // Mantendremos el toast aquí si así lo deseas para errores de carga inicial
      // toast.error(error.message || "Error al cargar cabañas"); // Comentado si quieres que solo se guarde en el estado error
    } finally {
      setLoading(false);
    }
  }, []); // Se quita loadCabinImages como dependencia si su definición no cambia


  const loadCabinImages = async (cabinsList) => {
    const imagesMap = {};
    for (const cabin of cabinsList) {
      try {
        const images = await getCabinImages(cabin.idCabin);
        cabin.imageCount = images.length;
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

  const filteredCabins = cabins.filter((cabin) =>
    `${cabin.name} ${cabin.description} ${cabin.status} ${cabin.capacity} ${
      cabin.Comforts?.map((c) => c.name).join(" ") || ""
    }`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredCabins.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const pageCount = Math.ceil(filteredCabins.length / itemsPerPage);

  useEffect(() => {
    loadCabinData();
  }, [loadCabinData]);

  const handleImageError = (e) => {
    e.target.style.objectFit = "contain";
    e.target.onerror = null;
  };

  // Editar cabaña - INTEGRACIÓN DE useAlert
  const handleEditCabin = (cabin) => { // Recibe el objeto cabin completo
    showAlert({
        type: 'confirm-edit',
        title: 'Confirmar Modificación',
        message: `¿Desea modificar la cabaña "${cabin.name}"?`, // Usar cabin.name
        confirmText: 'Sí, Modificar',
        onConfirm: () => {
            // Tu lógica original:
            // const cabinToEdit = cabins.find(c => c.idCabin === idCabin); // Ya no necesitas buscarlo si pasas el objeto
            setSelectedCabin(cabin); // Usas el objeto cabin directamente
            setModalOpen(true);
        }
    });
  };

  // Eliminar cabaña - INTEGRACIÓN DE useAlert
  const handleDelete = async (cabinToDelete) => { // Recibe el objeto cabin completo
    showAlert({
        type: 'confirm-delete',
        title: 'Confirmar Eliminación',
        message: `¿Está seguro de eliminar la cabaña "${cabinToDelete.name}"? Esta acción no se puede deshacer.`, // Usar cabinToDelete.name
        confirmText: 'Sí, Eliminar',
        onConfirm: async () => {
            // Tu lógica original:
            // if (!window.confirm("¿Estás seguro de eliminar esta cabaña?")) return; // Ya no es necesario
            try {
                await deleteCabin(cabinToDelete.idCabin); // Usar cabinToDelete.idCabin
                setCabins((prevCabins) =>
                    prevCabins.filter((cabin) => cabin.idCabin !== cabinToDelete.idCabin)
                );
                toast.success(`Cabaña "${cabinToDelete.name}" eliminada correctamente.`);
            } catch (error) {
                console.error("Error al eliminar la cabaña", error);
                toast.error("Error al eliminar la cabaña"); // Mantienes tu toast original
            }
        }
    });
  };

  const handleView = async (idCabin) => {
    try {
      const cabinData = await getCabinById(idCabin);
      setViewCabin(cabinData);
      setDetailOpen(true);
    } catch (error) {
      console.error("Error al obtener detalles de la cabaña:", error);
      // toast.error("Error al obtener detalles de la cabaña."); // Mantienes tu manejo de error
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleAddCabin = () => {
    setSelectedCabin(null);
    setModalOpen(true);
  };

  return (
    <section className="cabin-container-admin">
      <header className="cabin-header-admin">
        <h1 className="cabin-main-title">Nuestras Cabañas</h1>
      </header>

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

      <main className="cabin-gallery-admin">
        {loading ? (
          <div className="loading-indicator-admin">
            <div className="loading-spinner-admin"></div>
            <p>Cargando cabañas...</p>
          </div>
        ) : error ? ( // Tu lógica original de error
          <div className="error-message">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "Error al cargar las cabañas"}
          </div>
        ) : filteredCabins.length === 0 ? ( // Tu lógica original de no resultados
          <div className="empty-state-admin">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "No hay cabañas disponibles"}
          </div>
        ) : (
          currentItems.map((cabin) => (
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
                {cabin.imageCount > 1 && (
                  <span className="image-counter-badge-admin">
                    {cabin.imageCount - 1 === 1
                      ? `${cabin.imageCount - 1} Imagenes más`
                      : `${cabin.imageCount - 1} Imagenes más`}{" "}
                  </span>
                )}
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
                  {cabin.description && (
                    <div className="cabin-description-details-admin">
                      {cabin.description}
                    </div>
                  )}
                  <div className="cabin-meta-details-admin">
                    <div className="feature-item-admin">
                      <MdPerson className="feature-icon" />
                      <span>Capacidad: {cabin.capacity || "N/A"} personas</span>
                    </div>
                  </div>
                </div>
                <footer className="card-footer-actions-admin">
                  <ActionButtons
                    onEdit={() => handleEditCabin(cabin)}      // <--- Pasar el objeto cabin completo
                    onDelete={() => handleDelete(cabin)}    // <--- Pasar el objeto cabin completo
                    onView={() => handleView(cabin.idCabin)}
                  />
                </footer>
              </div>
            </article>
          ))
        )}
      </main>

      {pageCount > 1 && (
        <Pagination
          pageCount={pageCount}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          forcePage={currentPage}
        />
      )}

      {isOpenModal && (
        <FormCabins
          isOpen={isOpenModal}
          onClose={() => setModalOpen(false)}
          onSave={loadCabinData} // Mantenemos tu lógica original aquí
          cabinToEdit={selectedCabin}
        />
      )}

      {isDetailOpen && viewCabin && (
        <CabinDetail
          isOpen={isDetailOpen}
          onClose={() => setDetailOpen(false)}
          cabin={viewCabin}
        />
      )}
    </section>
  );
}

export default CardCabin;