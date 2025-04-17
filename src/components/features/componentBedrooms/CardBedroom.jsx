import React, { useState, useEffect } from "react";
import "./BedroomCard.css";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import { CiSearch } from "react-icons/ci";
import { MdPerson } from "react-icons/md";
import { getBedrooms, getBedroomById, deleteBedroom } from "../../../services/bedroomService";
import Pagination from "../../common/Paginator/Pagination";
import FormBedrooms from "./FormBedRoom";

function BedroomCard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpenModal, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bedrooms, setBedrooms] = useState([]);
    const [error, setError] = useState(null);
    const [selectedBedroom, setSelectedBedroom] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [viewBedroom, setViewBedroom] = useState(null);
    const [isDetailOpen, setDetailOpen] = useState(false);
  
    useEffect(() => {
      const fetchBedroom = async () => {
        try {
          const data = await getBedrooms();
          setBedrooms(data);
          console.log(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchBedroom();
    }, []);
  
    const filteredBedrooms = bedrooms.filter((bedroom) =>
      `${bedroom.name} ${bedroom.description} ${bedroom.status} ${
        bedroom.capacity
      } ${bedroom.Comforts.map((c) => c.name).join(" ")}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  
    const itemsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(0);
    const currentItems = filteredBedrooms.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
    const pageCount = Math.ceil(filteredBedrooms.length / itemsPerPage);
  
    const handleImageError = (e) => {
      e.target.style.objectFit = "contain";
      e.target.onerror = null;
    };
  
    const handleEditBedroom = (bedroom) => {
      setSelectedBedroom(bedroom);
      setModalOpen(true);
    };
  
    const handleDelete = async (idRoom) => {
      try {
        await deleteBedroom(idRoom);
        setBedrooms((prevBedrooms) =>
            prevBedrooms.filter((bedroom) => bedroom.idRoom !== idRoom)
        );
        console.log("Habitación eliminada exitosamente");
      } catch (error) {
        console.log("Error al eliminar la habitación", error);
      }
    };
  
    const handleView = async (idRoom) => {
      try {
        setLoadingDetail(true);
        const bedroomData = await getBedroomById(idRoom);
        setViewBedroom(bedroomData);
        setDetailOpen(true);
      } catch (error) {
        console.error("Error al obtener detalles de la habitación:", error);
      } finally {
        setLoadingDetail(false);
      }
    };
  
    return (
      <section className="container-bedrooms">
        <div className="title-container">
          <h1 className="title-bedroom">Nuestras Habitaciones</h1>
        </div>
  
        <div className="bedroom-search">
          <div>
            <CiSearch className="search-icon" />
            <input
              type="text"
              className="search"
              placeholder="Buscar ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>
          <CustomButton
            variant="primary"
            icon="add"
            onClick={() => {
              setSelectedBedroom(null);
              setModalOpen(true);
            }}
          >
            Agregar Habitación
          </CustomButton>
        </div>
  
        <main className="bedroom-list">
          {loading ? (
            <div className="loading-state">Cargando habitaciones...</div>
          ) : error ? (
            <div className="no-results">
              {searchTerm
                ? `No se encontraron resultados para "${searchTerm}"`
                : "No hay habitaciones disponibles"}
            </div>
          ) : (
            currentItems.map((bedroom) => (
              <article key={bedroom.idRoom} className="bedroom-card">
                <div className="image-wrapper">
                  <img
                    src={`http://localhost:3000/uploads/${bedroom.imagen}`}
                    alt={bedroom.name}
                    className="bedroom-image"
                    onError={handleImageError}
                  />
                </div>
  
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
                    <span className="capacity-info">
                      <MdPerson className="icon-person" />
                      <span className="label">Capacidad:</span>{" "}
                      {bedroom.capacity || "N/A"}
                    </span>
  
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
        <FormBedrooms
        isOpen={isOpenModal}
        onClose={() => setModalOpen(false)}
        onSave={() => {
          setLoading(true);
          getBedrooms()
            .then(setBedrooms)
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));
        }}
        bedroomToEdit={selectedBedroom}
      />
        {pageCount > 1 && (
          <Pagination
            pageCount={pageCount}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            forcePage={currentPage}
          />
        )}
      </section>
    );
}

export default BedroomCard;