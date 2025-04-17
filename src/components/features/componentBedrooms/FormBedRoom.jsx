import React, { useState, useRef, useEffect } from "react";
import { MdClose, MdImage } from "react-icons/md";
import "./BedroomCard.css"
import { createBedroom, updateBedroom } from "../../../services/BedroomService";

const FormBedrooms = ({ isOpen, onClose, onSave, bedroomToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    status: "En Servicio",
    imagen: null, 
  });

  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

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
      if (bedroomToEdit) {
        setFormData({
          name: bedroomToEdit.name,
          description: bedroomToEdit.description,
          capacity: bedroomToEdit.capacity,
          status: bedroomToEdit.status,
          imagen: bedroomToEdit.imagen || null, // Mantener la referencia a la imagen existente
        });
        setPreviewImage(
          bedroomToEdit.imagen
            ? `http://localhost:3000/uploads/${bedroomToEdit.imagen}`
            : null
        );
      } else {
        resetForm();
      }
    }
  }, [isOpen, bedroomToEdit]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imagen: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (bedroomToEdit) {
        await updateBedroom(bedroomToEdit.idRoom, formData);
      } else {
        await createBedroom(formData);
      }

      resetForm();
      onSave();
      onClose();
    } catch (error) {
      console.error("ERROR:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      alert(`Error al ${bedroomToEdit ? "editar" : "crear"}. Ver consola.`);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{bedroomToEdit ? "Editar Habitación" : "Agregar Nueva Habitación"}</h2>
          <button className="close-button" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bedroom-form">
          <div className="form-content">
            <div className="form-inputs">
              <div className="form-group">
                <label className="form-label">Nombre de la habitación</label>
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
                  <option value="Mantenimiento">En Mantenimiento</option> 
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
              </div>
            </div>

            <div className="image-upload-section">
              <div className="form-group">
                <label className="form-label">Imagen de la habitación</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="file-input"
                    id="bedroom-image-upload"
                    style={{ display: "none" }}
                  />

                  <label htmlFor="bedroom-image-upload" className="upload-label">
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
              Guardar Habitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormBedrooms;