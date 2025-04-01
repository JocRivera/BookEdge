import React, { useState, useEffect } from "react";
import "./CabinCard.css";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import { CiSearch } from "react-icons/ci";
import { MdPerson } from "react-icons/md";
import FormCabins from "./FormCabins";
import { deleteCabin, getCabins } from "../../../services/CabinService";
import Pagination from "../../common/Paginator/Pagination";

function CardCabin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenModal, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cabins, setCabins] = useState([]);
  const [error, setError] = useState(null); // Para ayudar a depurar
  const [selectedCabin, setSelectedCabin] = useState(null);

  useEffect(() => {
    const fetchCabins = async () => {
      try {
        const data = await getCabins();
        setCabins(data);
        console.log(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCabins();
  }, []);

  // Filtrado mejorado
  const filteredCabins = cabins.filter((cabin) =>
    `${cabin.name} ${cabin.description} ${cabin.status} ${
      cabin.capacity
    } ${cabin.Comforts.map((c) => c.name).join(" ")}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Paginación
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);
  const currentItems = filteredCabins.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const pageCount = Math.ceil(filteredCabins.length / itemsPerPage);

  // Manejo de errores en imágenes
  const handleImageError = (e) => {
    e.target.style.objectFit = "contain";
    e.target.onerror = null; // Prevenir loops
  };

  const handleEditCabin = (cabin) => {
    setSelectedCabin(cabin);
    setModalOpen(true);
  };

  const handleDelete = async (idCabin) => {};

  return (
    <section className="container-cabins">
      <div className="title-container">
        <h1 className="title-cabin">Nuestras Cabañas</h1>
      </div>

      <div className="cabin-search">
        <CiSearch className="search-icon" />
        <input
          type="text"
          className="search"
          placeholder="Buscar ..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(0); // Resetear a primera página al buscar
          }}
        />
        <CustomButton
          variant="primary"
          icon="add"
          onClick={() => {
            setSelectedCabin(null);
            setModalOpen(true);
          }}
        >
          Agregar Cabaña
        </CustomButton>
      </div>

      <main className="cabin-list">
        {loading ? (
          <div className="loading-state">Cargando cabañas...</div>
        ) : error ? (
          <div className="error-state">Error al cargar cabañas: {error}</div>
        ) : currentItems.length === 0 ? (
          <div className="no-results">
            {searchTerm
              ? `No se encontraron resultados para "${searchTerm}"`
              : "No hay cabañas disponibles"}
          </div>
        ) : (
          currentItems.map((cabin) => (
            <article key={cabin.idCabin} className="cabin-card">
              <div className="image-wrapper">
                <img
                  src={`http://localhost:3000/uploads/${cabin.imagen}`}
                  alt={cabin.name}
                  className="cabin-image"
                  onError={handleImageError}
                />
              </div>

              <section className="cabins-details">
                <header className="cabin-header">
                  <h2>{cabin.name}</h2>
                  <span
                    className={`cabin-status ${
                      cabin.status === "En Mantenimiento"
                        ? "status-mantenimiento"
                        : cabin.status === "En Servicio"
                        ? "status-en-servicio"
                        : "status-fuera-de-servicio"
                    }`}
                  >
                    {cabin.status}
                  </span>
                </header>

                <p className="cabin-description">
                  {cabin.description || "Sin descripción"}
                </p>

                <div className="cabin-meta">
                  <span className="capacity-info">
                    <MdPerson className="icon-person" />
                    <span className="label">Capacidad:</span>{" "}
                    {cabin.capacity || "N/A"}
                  </span>

                  <div className="comforts-section">
                    <div className="comforts-info">
                      <MdPerson className="icon-person" />
                      <span className="label">Comodidades:</span>
                    </div>
                    <div className="cabin-comforts">
                      {cabin.Comforts && cabin.Comforts.length > 0 ? (
                        <>
                          {cabin.Comforts.slice(0, 3).map((comfort) => (
                            <span
                              key={comfort.idComfort || Math.random()}
                              className="comfort-badge"
                            >
                              {comfort.name}
                            </span>
                          ))}
                          {cabin.Comforts.length > 3 && (
                            <span className="comfort-badge more-comforts">
                              +{cabin.Comforts.length - 3}
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

                <footer className="cabin-actions">
                  <ActionButtons
                    onEdit={() => handleEditCabin(cabin)}
                    onDelete={() =>
                      console.log("Eliminar cabaña", cabin.idCabin)
                    }
                    onView={() => console.log("Ver detalles", cabin.idCabin)}
                  />
                </footer>
              </section>
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

      <FormCabins
        isOpen={isOpenModal}
        onClose={() => setModalOpen(false)}
        onSave={() => {
          setLoading(true);
          getCabins()
            .then(setCabins)
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));
        }}
        cabinToEdit={selectedCabin}
      />
    </section>
  );
}

export default CardCabin;
