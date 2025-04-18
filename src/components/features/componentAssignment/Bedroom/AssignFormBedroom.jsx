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

  // Reemplaza esta parte en tu useEffect de carga inicial
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isOpen) return;

      try {
        setIsLoading(true);
        const [roomsTOTALITY, roomsResponse, comfortsResponse] =
          await Promise.all([
            getAllComfortsForBedRoom(),
            getBedRoomsWithoutComforts(),
            getComforts(),
          ]);

        setRooms(roomsResponse);
        setComforts(comfortsResponse);

        if (assignToEdit) {
          // Opción 1: Buscar en roomsTOTALITY
          const roomToEdit = roomsTOTALITY.find(
            (r) => r.idRoom === assignToEdit.idRoom
          );

          // Opción 2: Si no se encuentra, buscar en roomsResponse (habitaciones sin comodidades)
          const fallbackRoom = roomsResponse.find(
            (r) => r.idRoom === assignToEdit.idRoom
          );

          // Opción 3: Usar los datos que vienen directamente de assignToEdit
          const finalRoomData = roomToEdit?.Room ||
            roomToEdit ||
            fallbackRoom || {
              idRoom: assignToEdit.idRoom,
              name: assignToEdit.name,
              imagen: assignToEdit.imagen,
              description: assignToEdit.description,
            };

          console.log("Datos finales de la habitación:", finalRoomData);
          setSelectedRoomData(finalRoomData);

          // Asegurar que el formulario tenga los datos correctos
          setFormData({
            selectedRoom: assignToEdit.idRoom,
            description:
              assignToEdit.description || finalRoomData.description || "",
            selectedComforts:
              assignToEdit.comforts?.map((c) => c.idComfort) || [],
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

  // Modifica el segundo useEffect para que no sobrescriba cuando esté en modo edición
  useEffect(() => {
    if (formData.selectedRoom && !assignToEdit) {
      // Solo actualizar selectedRoomData si no estamos en modo edición
      const selected = rooms.find((r) => r.idRoom === formData.selectedRoom);
      setSelectedRoomData(selected);
    }
  }, [formData.selectedRoom, rooms, assignToEdit]);

  // Cargar datos para edición
  useEffect(() => {
    if (!isOpen) return;

    if (assignToEdit) {
      setFormData({
        selectedRoom: assignToEdit.idRoom,
        description: assignToEdit.description,
        selectedComforts: assignToEdit.comforts.map((c) => c.idComfort),
      });
    } else {
      resetForm();
    }
  }, [assignToEdit, isOpen]);

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedRoomData(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "selectedRoom" ? parseInt(value) : value,
    }));
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
                      <option value={formData.selectedRoom}>
                        {selectedRoomData?.name ||
                          assignToEdit.name ||
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
                {selectedRoomData?.imagen ? (
                  <img
                    src={`http://localhost:3000/uploads/${selectedRoomData.imagen}`}
                    alt={selectedRoomData.name}
                    className="preview-room-img"
                  />
                ) : (
                  <p className="no-image-text-room">
                    Selecciona una habitación para ver la imagen
                  </p>
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
