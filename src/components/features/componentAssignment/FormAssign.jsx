import { useState, useEffect } from "react";
import {
  getAllComfortsForCabins,
  getCabinsWithoutComforts,
  assignComfortsToCabin,
  updateComfortsToCabin,
} from "../../../services/AssingComforts";
import { getComforts } from "../../../services/ComfortService";
import "./AssignComforts.css";

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

// En tu primer useEffect
useEffect(() => {
  const loadInitialData = async () => {
    if (!isOpen) return;
    
    try {
      setIsLoading(true);
      const [cabinSTOTALITY, cabinsResponse, comfortsResponse] = await Promise.all([
        getAllComfortsForCabins(),
        getCabinsWithoutComforts(),
        getComforts()
      ]);
      console.log(cabinSTOTALITY)
      // Guardar todas las cabañas en un estado separado para referencia
      setCabins(cabinsResponse);
      setComforts(comfortsResponse);

      // Si estamos editando, buscar la cabaña en la lista completa
      if (assignToEdit) {
        // Si los datos vienen con la estructura anidada, usar esa estructura
        if (assignToEdit.Cabin && assignToEdit.Cabin.imagen) {
          setSelectedCabinData({
            idCabin: assignToEdit.idCabin,
            name: assignToEdit.Cabin.name,
            imagen: assignToEdit.Cabin.imagen
          });
        } else {
          // Buscar en cabinSTOTALITY como tenías antes
          const cabinToEdit = cabinSTOTALITY.find(c => c.idCabin === assignToEdit.idCabin);
          setSelectedCabinData(cabinToEdit);
        }
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
  if (formData.selectedCabin && !assignToEdit) {
    // Solo actualizar selectedCabinData si no estamos en modo edición
    const selected = cabins.find(c => c.idCabin === formData.selectedCabin);
    setSelectedCabinData(selected);
  }
}, [formData.selectedCabin, cabins, assignToEdit]);

  // Cargar datos para edición
  useEffect(() => {
    if (!isOpen) return;

    if (assignToEdit) {
      setFormData({
        selectedCabin: assignToEdit.idCabin,
        description: assignToEdit.description,
        selectedComforts: assignToEdit.comforts.map(c => c.idComfort),
        
      });
    } else {
      resetForm();
    }
  }, [assignToEdit, isOpen]);

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedCabinData(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "selectedCabin" ? parseInt(value) : value,
    }));
  };

  const handleComfortToggle = (comfortId) => {
    setFormData(prev => ({
      ...prev,
      selectedComforts: prev.selectedComforts.includes(comfortId)
        ? prev.selectedComforts.filter(id => id !== comfortId)
        : [...prev.selectedComforts, comfortId]
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
    <div className="ac-modal-overlay">
      <div className="ac-modal-container">
        <div className="ac-modal-header">
          <h2>
            {assignToEdit ? "Editar Asignaciones" : "Asignar Comodidades"}
          </h2>
          <button className="ac-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ac-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="ac-form-container">
              <div className="ac-form-grid">
                <div className="ac-form-group">
                  <label htmlFor="selectedCabin">Cabaña</label>
                  <select
                    id="selectedCabin"
                    name="selectedCabin"
                    value={formData.selectedCabin}
                    onChange={handleInputChange}
                    required
                    disabled={!!assignToEdit || isLoading}
                  > {assignToEdit?<option value={formData.selectedCabin}>{assignToEdit.name}</option>:<option value="">Seleccionar cabaña</option>}
                    {Array.isArray(cabins) &&
                      cabins.map((cabin) => (
                        <option key={cabin.idCabin} value={cabin.idCabin}>
                          {cabin.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="ac-form-group">
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

                <div className="ac-form-group">
                  <label>Comodidades</label>
                  <div className="ac-checkbox-group">
                    {comforts.map((c) => (
                      <label key={c.idComfort} className="ac-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.selectedComforts.includes(c.idComfort)}
                          onChange={() => handleComfortToggle(c.idComfort)}
                          disabled={isLoading}
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ac-image-preview">
                {selectedCabinData?.imagen ? (
                  <img
                    src={`http://localhost:3000/uploads/${selectedCabinData.imagen}`}
                    alt={selectedCabinData.name}
                    className="preview-img"
                  />
                ) : (
                  <p className="no-image-text">
                    Selecciona una cabaña para ver la imagen
                  </p>
                )}
              </div>
            </div>
            <div className="ac-modal-footer">
              <button 
                type="button" 
                className="ac-cancel-btn" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="ac-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : assignToEdit ? "Guardar Cambios" : "Asignar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignComfortsForm;