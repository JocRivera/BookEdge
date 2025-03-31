import React, { useState, useRef, useEffect } from "react";
import { MdClose, MdImage } from "react-icons/md";
import "./Cabincard.css"
import { createCabin , updateCabin} from "../../../services/CabinService";

const FormCabins = ({ isOpen, onClose, onSave, cabinToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    status: "En Servicio",
    imagen: null, 
  });

  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Resetear TODO el formulario
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      capacity: "",
      status: "En Servicio",
      imagen: null,
    });
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (isOpen) {
      resetForm()
      if (cabinToEdit) {
        setFormData({
          name: cabinToEdit.name,
          description: cabinToEdit.description,
          capacity: cabinToEdit.capacity,
          status: cabinToEdit.status,
          imagen: null, // IMPORTANTE: siempre null al editar
        });
        // Solo mostrar preview de imagen existente
        setPreviewImage(
          cabinToEdit.imagen
            ? `http://localhost:3000/uploads/${cabinToEdit.imagen}`
            : null
        );
      } else {
        resetForm();
      }
    }
  }, [isOpen, cabinToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imagen: file }));
      // Mostrar preview
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.capacity) {
      alert("Nombre y capacidad son obligatorios");
      return;
    }

    try {
      if (cabinToEdit) {
        // Lógica de EDICIÓN
        await updateCabin(cabinToEdit.idCabin, formData);
      } else {
        // Lógica de CREACIÓN
        await createCabin(formData);
      }

      resetForm();
      onSave(); // Recarga la lista
      onClose();
    } catch (error) {
      console.error("ERROR:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      alert(`Error al ${cabinToEdit ? "editar" : "crear"}. Ver consola.`);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{cabinToEdit ? "Editar Cabaña" : "Agregar Nueva Cabaña"}</h2>{" "}
          <button className="close-button" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cabin-form">
          <div className="form-content">
            <div className="form-inputs">
              <div className="form-group">
                <label className="form-label">Nombre de la cabaña</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacidad</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="En Servicio">En Servicio</option>
                  <option value="En Mantenimiento">En Mantenimiento</option> 
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
              </div>
            </div>

            <div className="image-upload-section">
              <div className="form-group">
                <label className="form-label">Imagen de la cabaña</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="file-input"
                    id="cabin-image-upload"
                    style={{ display: "none" }}
                  />

                  <label htmlFor="cabin-image-upload" className="upload-label">
                    {previewImage ? (
                      <div className="image-preview-wrapper">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="preview-image"
                        />
                        <span className="change-image-text">
                          Haz clic para cambiar
                        </span>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <MdImage size={48} className="upload-icon" />
                        <p>Haz clic para subir una imagen</p>
                        <small>Formatos: JPG, PNG (Max. 5MB)</small>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn">
              Guardar Cabaña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormCabins;
