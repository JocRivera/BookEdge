import { useState, useEffect } from "react";
import {
  getAllComfortsForCabins,
  getCabinsWithoutComforts,
  assignComfortsToCabin,
  updateComfortsToCabin,
} from "../../../../services/AssingComforts";
import { getComforts } from "../../../../services/ComfortService";
import "./AssignComforts.css"; // Asegurar que los estilos sean consistentes

const AssignComfortsForm = ({ isOpen, onClose, onSave, assignToEdit }) => {
  const initialFormState = {
    selectedCabin: "",
    description: "",
    selectedComforts: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [cabins, setCabins] = useState([]);
  const [comforts, setComforts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCabinData, setSelectedCabinData] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isOpen) return;

      try {
        setIsLoading(true);
        const [allCabinComforts, cabinsResponse, comfortsResponse] =
          await Promise.all([
            getAllComfortsForCabins(),
            getCabinsWithoutComforts(),
            getComforts(),
          ]);

        setCabins(cabinsResponse);
        setComforts(comfortsResponse);

        if (assignToEdit) {
          console.log("Datos para editar:", assignToEdit);
          
          // Buscar la cabaña completa con imágenes
          let cabinWithImages = null;
          
          if (Array.isArray(allCabinComforts)) {
            const cabinComfort = allCabinComforts.find(
              cc => cc.idCabin === assignToEdit.idCabin
            );
            if (cabinComfort?.Cabin) {
              cabinWithImages = cabinComfort.Cabin;
            }
          }
          
          if (!cabinWithImages) {
            cabinWithImages = cabins.find(c => c.idCabin === assignToEdit.idCabin);
          }
          
          const cabinData = {
            idCabin: assignToEdit.idCabin,
            name: assignToEdit.name || cabinWithImages?.name,
            images: cabinWithImages?.images || [],
            description: assignToEdit.description,
          };
        
          console.log("Cabin data procesado:", cabinData);
          setSelectedCabinData(cabinData);
          
          setFormData({
            selectedCabin: assignToEdit.idCabin,
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

  useEffect(() => {
    if (formData.selectedCabin && !assignToEdit) {
      const selected = cabins.find((c) => c.idCabin === formData.selectedCabin);
      setSelectedCabinData(selected);
    }
  }, [formData.selectedCabin, cabins, assignToEdit]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedCabinData(null);
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "selectedCabin") {
      const selectedValue = value === "" ? "" : parseInt(value);
      
      setFormData(prev => ({
        ...prev,
        [name]: selectedValue,
      }));
      
      if (value === "") {
        setSelectedCabinData(null);
      } else {
        const selected = cabins.find(c => c.idCabin === parseInt(value));
        setSelectedCabinData(selected);
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
        idCabin: formData.selectedCabin,
        description: formData.description,
        comforts: formData.selectedComforts,
      };

      if (assignToEdit) {
        await updateComfortsToCabin(payload);
      } else {
        await assignComfortsToCabin(payload);
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
                  <label htmlFor="selectedCabin">Cabaña</label>
                  <select
                    id="selectedCabin"
                    name="selectedCabin"
                    value={formData.selectedCabin}
                    onChange={handleInputChange}
                    required
                    disabled={!!assignToEdit || isLoading}
                  >
                    {assignToEdit ? (
                      <option value={assignToEdit.idCabin}>
                        {assignToEdit.name ||
                          `Cabaña #${assignToEdit.idCabin}`}
                      </option>
                    ) : (
                      <>
                        <option value="">Seleccionar cabaña</option>
                        {Array.isArray(cabins) &&
                          cabins.map((cabin) => (
                            <option key={cabin.idCabin} value={cabin.idCabin}>
                              {cabin.name || `Cabaña #${cabin.idCabin}`}
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
                {selectedCabinData?.images?.length > 0 ? (
                  <div className="image-container">
                    <img
                      src={`http://localhost:3000/uploads/${selectedCabinData.images[0].imagePath}`}
                      alt={`Cabaña ${selectedCabinData.name}`}
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

export default AssignComfortsForm;