import { useState, useEffect } from "react";
import {
  getAllComfortsForBedRoom,
  getBedRoomsWithoutComforts,
  assignComfortsToBedRoom,
  updateComfortsToBedRoom,
} from "../../../../services/AssingComfortsBedroom";
import { getComforts } from "../../../../services/ComfortService";
import "./AssignBedroom.css";

const AssignRoomComfortsForm = ({ isOpen, onClose, onSave, assignToEdit }) => {
  const initialFormState = {
    selectedRoom: "",
    description: "",
    selectedComforts: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [rooms, setRooms] = useState([]);
  const [comforts, setComforts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoomData, setSelectedRoomData] = useState(null);

  // Carga inicial de datos
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isOpen) return;

      try {
        setIsLoading(true);
        const [allBedroomComforts, roomsResponse, comfortsResponse] =
          await Promise.all([
            getAllComfortsForBedRoom(),
            getBedRoomsWithoutComforts(),
            getComforts(),
          ]);

        setRooms(roomsResponse);
        setComforts(comfortsResponse);

        if (assignToEdit) {
          console.log("Datos para editar:", assignToEdit);
          
          // Buscar la habitación completa con imágenes en la lista de habitaciones
          // o en allBedroomComforts
          let roomWithImages = null;
          
          // Primero buscar en allBedroomComforts 
          if (Array.isArray(allBedroomComforts)) {
            const bedroomComfort = allBedroomComforts.find(
              bc => bc.idRoom === assignToEdit.idRoom
            );
            if (bedroomComfort?.Bedroom) {
              roomWithImages = bedroomComfort.Bedroom;
            }
          }
          
          // Si no se encuentra, buscar en la lista de habitaciones
          if (!roomWithImages) {
            roomWithImages = rooms.find(r => r.idRoom === assignToEdit.idRoom);
          }
          
          // Crear el objeto con los datos de la habitación
          const roomData = {
            idRoom: assignToEdit.idRoom,
            name: assignToEdit.name || roomWithImages?.name,
            images: roomWithImages?.images || [],
            description: assignToEdit.description,
          };
        
          console.log("Room data procesado:", roomData);
          setSelectedRoomData(roomData);
          
          // Configurar el formulario con los datos para edición
          setFormData({
            selectedRoom: assignToEdit.idRoom,
            description: assignToEdit.description || "",
            selectedComforts: assignToEdit.comforts?.map((c) => c.idComfort) || [],
          });
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isOpen, assignToEdit]);

  // Actualizar datos de habitación seleccionada
  useEffect(() => {
    if (formData.selectedRoom && !assignToEdit) {
      // Solo actualizar selectedRoomData si no estamos en modo edición
      const selected = rooms.find((r) => r.idRoom === formData.selectedRoom);
      setSelectedRoomData(selected);
    }
  }, [formData.selectedRoom, rooms, assignToEdit]);

useEffect(() => {
  if (!isOpen) {
    resetForm();
  }
}, [isOpen]);

const resetForm = () => {
  setFormData(initialFormState);
  setSelectedRoomData(null);
  setIsLoading(false);
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  if (name === "selectedRoom") {
    const selectedValue = value === "" ? "" : parseInt(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: selectedValue,
    }));
    
    if (value === "") {
      setSelectedRoomData(null);
    } else {
      const selected = rooms.find(c => c.idRoom === parseInt(value));
      setSelectedRoomData(selected);
    }
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }
};


  const handleComfortToggle = (comfortId) => {
    setFormData((prev) => ({
      ...prev,
      selectedComforts: prev.selectedComforts.includes(comfortId)
        ? prev.selectedComforts.filter((id) => id !== comfortId)
        : [...prev.selectedComforts, comfortId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const payload = {
        idRoom: formData.selectedRoom,
        description: formData.description,
        comforts: formData.selectedComforts,
      };

      if (assignToEdit) {
        await updateComfortsToBedRoom(payload);
      } else {
        await assignComfortsToBedRoom(payload);
      }

      onSave?.();
      onClose?.();
    } catch (error) {
      console.error("Error guardando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rc-modal-overlay">
      <div className="rc-modal-container">
        <div className="rc-modal-header">
          <h2>
            {assignToEdit ? "Editar Asignaciones" : "Asignar Comodidades"}
          </h2>
          <button className="rc-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="rc-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="rc-form-container">
              <div className="rc-form-grid">
                <div className="rc-form-group">
                  <label htmlFor="selectedRoom">Habitación</label>
                  <select
                    id="selectedRoom"
                    name="selectedRoom"
                    value={formData.selectedRoom}
                    onChange={handleInputChange}
                    required
                    disabled={!!assignToEdit || isLoading}
                  >
                    {assignToEdit ? (
                      <option value={assignToEdit.idRoom}>
                        {assignToEdit.name ||
                          `Habitación #${assignToEdit.idRoom}`}
                      </option>
                    ) : (
                      <>
                        <option value="">Seleccionar habitación</option>
                        {Array.isArray(rooms) &&
                          rooms.map((room) => (
                            <option key={room.idRoom} value={room.idRoom}>
                              {room.name || `Habitación #${room.idRoom}`}
                            </option>
                          ))}
                      </>
                    )}
                  </select>
                </div>

                <div className="rc-form-group">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descripción general de las comodidades"
                    rows="3"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="rc-form-group">
                  <label>Comodidades</label>
                  <div className="rc-checkbox-group">
                    {comforts.map((c) => (
                      <label key={c.idComfort} className="rc-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.selectedComforts.includes(
                            c.idComfort
                          )}
                          onChange={() => handleComfortToggle(c.idComfort)}
                          disabled={isLoading}
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rc-image-preview">
                {selectedRoomData?.images?.length > 0 ? (
                  <div className="image-container">
                    <img
                      src={`http://localhost:3000/uploads/${selectedRoomData.images[0].imagePath}`}
                      alt={`Habitación ${selectedRoomData.name}`}
                      className="preview-room-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-room.jpg";
                      }}
                    />
                  </div>
                ) : (
                  <div className="no-image-placeholder">
                    <p>No hay imagen disponible</p>
                  </div>
                )}
              </div>
            </div>
            <div className="rc-modal-footer">
              <button
                type="button"
                className="rc-cancel-btn"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rc-submit-btn"
                disabled={isLoading}
              >
                {isLoading
                  ? "Procesando..."
                  : assignToEdit
                  ? "Guardar Cambios"
                  : "Asignar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignRoomComfortsForm;
