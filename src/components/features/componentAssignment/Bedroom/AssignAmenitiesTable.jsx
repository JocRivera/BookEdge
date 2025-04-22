import { useEffect, useState } from "react";
import { getAllComfortsForBedRoom } from "../../../../services/AssingComfortsBedroom";
import {
  ActionButtons,
  CustomButton,
} from "../../../common/Button/customButton";
import AssignRoomComfortsForm from "./AssignFormBedroom";
import Pagination from "../../../common/Paginator/Pagination";
import { CiSearch } from "react-icons/ci";
import "./AssignBedroom.css";

const RoomComfortsCards = () => {
  const [groupedRooms, setGroupedRooms] = useState([]);
  const [isOpenModal, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllComfortsForBedRoom();
      console.log("Datos de API:", data); // Para depuración
  
      // Adaptar a la nueva estructura de datos
      const grouped = data.reduce((acc, item) => {
        const roomId = item.idRoom || item.Bedroom?.idRoom;
  
        if (!roomId) {
          console.warn("Item sin ID de habitación:", item);
          return acc;
        }
  
        // Inicializar la entrada de habitación si no existe
        if (!acc[roomId]) {
          acc[roomId] = {
            idRoom: roomId,
            name: item.name || item.Bedroom?.name || `Habitación ${roomId}`,
            description: item.description || "Sin descripción",
            dateEntry: item.dateEntry || new Date().toISOString(),
            images: item.Bedroom?.images || [], // <-- Aquí capturamos las imágenes
            comforts: [],
          };
        }
  
        // Agregar comodidades si existen
        if (item.Comfort) {
          if (!acc[roomId].comforts.some(c => c.idComfort === item.Comfort.idComfort)) {
            acc[roomId].comforts.push({
              idComfort: item.Comfort.idComfort,
              name: item.Comfort.name,
            });
          }
        }
  
        return acc;
      }, {});
  
      setGroupedRooms(Object.values(grouped));
      setError(null);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setError("Error al cargar las habitaciones. Inténtelo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrado de habitaciones
  const filteredRooms = groupedRooms.filter((room) =>
    `${room.name} ${room.description} ${room.comforts?.map((c) => c.name).join(" ") || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Configuración de paginación
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(0);
  const currentItems = filteredRooms.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const pageCount = Math.ceil(filteredRooms.length / itemsPerPage);

  // Manejadores de acciones
  const handleEditAssign = (roomId) => {
    const room = groupedRooms.find((r) => r.idRoom === roomId);
    setSelectedRoom(room);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRoom(null);
    fetchData(); // Refrescar datos después de editar/crear
  };

  return (
    <>
      <div className="cards-container-room">
        <div className="title-container-room">
          <h1 className="section-title">Habitaciones y sus Comodidades</h1>
        </div>

        <div className="asign-search-room">
          <div>
            <CiSearch className="search-icon" />
            <input
              type="text"
              className="search"
              placeholder="Buscar habitaciones..."
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
              setSelectedRoom(null);
              setModalOpen(true);
            }}
            text="Asignar Comodidades"
          >Asignar Comodidades</CustomButton>
        </div>

        <main className="card-list-room">
          {loading ? (
            <div className="loading-state">Cargando habitaciones...</div>
          ) : error ? (
            <div className="no-results">{error}</div>
          ) : filteredRooms.length === 0 ? (
            <div className="no-results">
              {searchTerm
                ? `No se encontraron resultados para "${searchTerm}"`
                : "No hay habitaciones disponibles"}
            </div>
          ) : (
            currentItems.map((room) => (
              <div key={room.idRoom} className="room-card">
                <div className="room-image-container">
                  {room.images?.length > 0 ? (
                    <img
                      src={`http://localhost:3000/uploads/${room.images[0].imagePath}`}
                      alt={room.name}
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
                  <h2 className="room-title">{room.name}</h2>
                </div>

                <div className="room-content">
                  <h3 className="rooms-tittle">Descripción</h3>
                  <p className="room-description">{room.description}</p>

                  <div className="comforts-section">
                    <h3 className="comforts-title">Comodidades:</h3>
                    {room.comforts.length > 0 ? (
                      <ul className="comforts-list">
                        {room.comforts.slice(0, 4).map((comfort) => (
                          <li key={comfort.idComfort} className="comfort-item">
                            {comfort.name}
                          </li>
                        ))}
                        {room.comforts.length > 4 && (
                          <li className="comfort-item more-comforts">
                            +{room.comforts.length - 4}
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="no-comforts">Sin comodidades asignadas</p>
                    )}
                  </div>

                  <p className="modification-date">
                    Última modificación:{" "}
                    {new Date(room.dateEntry).toLocaleDateString()}
                  </p>
                </div>
                <div className="assign-actions">
                  <ActionButtons onEdit={() => handleEditAssign(room.idRoom)} />
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

      <AssignRoomComfortsForm
        isOpen={isOpenModal}
        onClose={handleCloseModal}
        assignToEdit={selectedRoom}
      />
    </>
  );
};

export default RoomComfortsCards;