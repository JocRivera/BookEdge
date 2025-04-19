import { useEffect, useState } from "react";
import { getAllComfortsForCabins } from "../../../../services/AssingComforts";
import { ActionButtons, CustomButton } from "../../../common/Button/customButton";
import AssignComfortsForm from "./FormAssign";
import Pagination from "../../../common/Paginator/Pagination";
import { CiSearch } from "react-icons/ci";
import "./AssignComforts.css"; // Asegúrate de que los estilos sean consistentes

const CabinComfortsCards = () => {
  const [groupedCabins, setGroupedCabins] = useState([]);
  const [isOpenModal, setModalOpen] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllComfortsForCabins();
      console.log("Datos de API:", data);

      const grouped = data.reduce((acc, item) => {
        const cabinId = item.idCabin || item.Cabin?.idCabin;

        if (!cabinId) {
          console.warn("Item sin ID de cabaña:", item);
          return acc;
        }

        if (!acc[cabinId]) {
          acc[cabinId] = {
            idCabin: cabinId,
            name: item.name || item.Cabin?.name || `Cabaña ${cabinId}`,
            description: item.description || "Sin descripción",
            dateEntry: item.dateEntry || new Date().toISOString(),
            images: item.Cabin?.images || [], // Añadido para imágenes
            comforts: [],
          };
        }

        if (item.Comfort) {
          if (!acc[cabinId].comforts.some(c => c.idComfort === item.Comfort.idComfort)) {
            acc[cabinId].comforts.push({
              idComfort: item.Comfort.idComfort,
              name: item.Comfort.name,
            });
          }
        }

        return acc;
      }, {});

      setGroupedCabins(Object.values(grouped));
      setError(null);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setError("Error al cargar las cabañas. Inténtelo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrado de cabañas
  const filteredCabins = groupedCabins.filter((cabin) =>
    `${cabin.name} ${cabin.description} ${cabin.comforts?.map((c) => c.name).join(" ") || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Configuración de paginación
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(0);
  const currentItems = filteredCabins.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const pageCount = Math.ceil(filteredCabins.length / itemsPerPage);

  const handleEditAssign = (cabinId) => {
    const cabin = groupedCabins.find((c) => c.idCabin === cabinId);
    setSelectedCabin(cabin);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCabin(null);
    fetchData();
  };

  return (
    <>
      <div className="cards-container-room"> {/* Usamos la misma clase que bedrooms */}
        <div className="title-container-room">
          <h1 className="section-title">Cabañas y sus Comodidades</h1>
        </div>

        <div className="asign-search-room">
          <div>
            <CiSearch className="search-icon" />
            <input
              type="text"
              className="search"
              placeholder="Buscar cabañas..."
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
              setSelectedCabin(null);
              setModalOpen(true);
            }}
            text="Asignar Comodidades"
          >Asignar Comodidades</CustomButton>
        </div>

        <main className="card-list-room">
          {loading ? (
            <div className="loading-state">Cargando cabañas...</div>
          ) : error ? (
            <div className="no-results">{error}</div>
          ) : filteredCabins.length === 0 ? (
            <div className="no-results">
              {searchTerm
                ? `No se encontraron resultados para "${searchTerm}"`
                : "No hay cabañas disponibles"}
            </div>
          ) : (
            currentItems.map((cabin) => (
              <div key={cabin.idCabin} className="room-card">
                <div className="room-image-container">
                  {cabin.images?.length > 0 ? (
                    <img
                      src={`http://localhost:3000/uploads/${cabin.images[0].imagePath}`}
                      alt={cabin.name}
                      className="room-image"
                      onError={(e) => {
                        e.target.src = '/placeholder-room.jpg';
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <span className="material-icons">image_not_supported</span>
                    </div>
                  )}
                </div>
                <div className="room-header">
                  <h2 className="room-title">{cabin.name}</h2>
                </div>

                <div className="room-content">
                  <h3 className="rooms-tittle">Descripción</h3>
                  <p className="room-description">{cabin.description}</p>

                  <div className="comforts-section">
                    <h3 className="comforts-title">Comodidades:</h3>
                    {cabin.comforts.length > 0 ? (
                      <ul className="comforts-list">
                        {cabin.comforts.slice(0, 4).map((comfort) => (
                          <li key={comfort.idComfort} className="comfort-item">
                            {comfort.name}
                          </li>
                        ))}
                        {cabin.comforts.length > 4 && (
                          <li className="comfort-item more-comforts">
                            +{cabin.comforts.length - 4}
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="no-comforts">Sin comodidades asignadas</p>
                    )}
                  </div>

                  <p className="modification-date">
                    Última modificación:{" "}
                    {new Date(cabin.dateEntry).toLocaleDateString()}
                  </p>
                </div>
                <div className="assign-actions">
                  <ActionButtons onEdit={() => handleEditAssign(cabin.idCabin)} />
                </div>
              </div>
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
      </div>

      <AssignComfortsForm
        isOpen={isOpenModal}
        onClose={handleCloseModal}
        assignToEdit={selectedCabin}
      />
    </>
  );
};

export default CabinComfortsCards;