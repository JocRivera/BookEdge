import React, { useState, useRef, useEffect } from "react";
import { MdClose, MdImage, MdDelete, MdStar, MdStarBorder } from "react-icons/md";
import {
  createBedroom,
  updateBedroom,
  getBedroomImages,
  uploadBedroomImages,
  deleteBedroomImage,
  setPrimaryBedroomImage,
} from "../../../services/bedroomService";

const FormBedrooms = ({ isOpen, onClose, onSave, bedroomToEdit }) => {
  // Estados iniciales
  const initialFormData = {
    name: "",
    description: "",
    capacity: "",
    status: "En Servicio",
  };


  const [formData, setFormData] = useState(initialFormData);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRefs = useRef([]);

  // Resetear formulario
  const resetForm = () => {
    setFormData(initialFormData);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
  };

  // Cargar datos para edición
  useEffect(() => {
    if (!isOpen) return;
    
    resetForm();
    
    if (bedroomToEdit) {
      setFormData({
        name: bedroomToEdit.name || "",
        description: bedroomToEdit.description || "",
        capacity: bedroomToEdit.capacity || "",
        status: bedroomToEdit.status || "En Servicio",
      });
      
      // Cargar imágenes existentes
      loadExistingImages(bedroomToEdit.idRoom);
    }
  }, [isOpen, bedroomToEdit]);

  // Cargar imágenes existentes
  const loadExistingImages = async (bedroomId) => {
    try {
      const images = await getBedroomImages(bedroomId);
      setExistingImages(images);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  // Manejadores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Agregar nuevo archivo
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews(prev => {
        const newPreviews = [...prev];
        newPreviews[index] = reader.result;
        return newPreviews;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
  };

  const handleRemoveExistingImage = async (imageId) => {
    if (!window.confirm("¿Estás seguro de querer eliminar esta imagen?")) return;
    
    try {
      await deleteBedroomImage(imageId);
      setExistingImages(prev => prev.filter(img => img.idRoomImage !== imageId));
      alert("Imagen eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
        }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await setPrimaryBedroomImage(bedroomToEdit.idRoom, imageId);
      setExistingImages(prev => 
        prev.map(img => ({
          ...img,
          isPrimary: img.idRoomImage === imageId
        }))
      );
    } catch (error) {
      console.error("Error al establecer imagen principal:", error);
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    
    // Crear o actualizar habitación
    let bedroomId;
    if (bedroomToEdit) {
      await updateBedroom(bedroomToEdit.idRoom, formData);
      bedroomId = bedroomToEdit.idRoom;
    } else {
      const newBedroom = await createBedroom(formData);
      bedroomId = newBedroom.idRoom;
    }

    // Subir nuevas imágenes
    if (imageFiles.filter(Boolean).length > 0) {
      await uploadBedroomImages(bedroomId, imageFiles.filter(Boolean));
    }

    resetForm();
    onSave();
    onClose();
  } catch (error) {
    console.error("ERROR:", error);
  }
};
  if (!isOpen) return null;

  // Calcular espacios disponibles para imágenes
  const availableSlots = 5 - existingImages.length;
  const showNewImageFields = availableSlots > 0;

  return (
    <div className="modal-overlay">
      <div className="modal-container-bedroom">
        <div className="modal-header">
          <h2>{bedroomToEdit ? "Editar Habitación" : "Agregar Nueva Habitación"}</h2>
          <button className="close-button" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bedroom-form">
          <div className="form-content">
            <div className="form-inputs">
              {/* Campo Nombre */}
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

              {/* Campo Descripción */}
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

              {/* Campo Capacidad */}
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

              {/* Campo Estado */}
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

            {/* Sección de imágenes */}
            <div className="image-upload-section">
              <div className="form-group">
                <label className="form-label">Imágenes de la habitación (máx. 5)</label>

                {/* Imágenes existentes */}
                {existingImages.length > 0 && (
                  <div className="existing-images-container">
                    <h4>Imágenes guardadas ({existingImages.length}/5)</h4>
                    <div className="images-grid">
                      {existingImages.map(image => (
                        <div key={image.idRoomImage} className="image-item">
                          <div className="image-preview-wrapper">
                            <img
                              src={`http://localhost:3000/uploads/${image.imagePath}`}
                              alt="Bedroom"
                              className="preview-image"
                            />
                            <div className="image-actions">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveExistingImage(image.idRoomImage);
                                }}
                                className="image-action-btn delete-btn"
                                title="Eliminar imagen"
                                style={{ right: "35px" }}
                              >
                                <MdDelete />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetPrimary(image.idRoomImage);
                                }}
                                className={`image-action-btn star-btn ${image.isPrimary ? "primary" : ""}`}
                                title={image.isPrimary ? "Imagen principal" : "Establecer como principal"}
                                disabled={image.isPrimary}
                              >
                                {image.isPrimary ? <MdStar /> : <MdStarBorder />}
                              </button>
                            </div>
                          </div>
                          {image.isPrimary && <span className="primary-label">Principal</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campos para nuevas imágenes */}
                {showNewImageFields && (
                  <div className="new-images-container">
                    <h4>Agregar imágenes ({availableSlots} disponibles)</h4>
                    <div className="individual-image-uploads">
                      {Array(availableSlots).fill().map((_, index) => (
                        <div key={`new-${index}`} className="image-upload-field">
                          {imagePreviews[index] ? (
                            <div className="image-preview-wrapper">
                              <img
                                src={imagePreviews[index]}
                                alt={`Preview ${index + 1}`}
                                className="preview-image"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="image-action-btn delete-btn"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          ) : (
                            <div className="upload-single-container">
                              <input
                                type="file"
                                ref={el => (fileInputRefs.current[index] = el)}
                                onChange={(e) => handleImageChange(index, e)}
                                accept="image/*"
                                className="file-input"
                                id={`bedroom-image-upload-${index}`}
                                style={{ display: "none" }}
                              />
                              <label
                                htmlFor={`bedroom-image-upload-${index}`}
                                className="upload-single-label"
                              >
                                <MdImage size={24} />
                                <span>Imagen {existingImages.length + index + 1}</span>
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensaje de límite de imágenes */}
                {existingImages.length >= 5 && (
                  <div className="max-images-message">
                    <p>Ya has alcanzado el límite máximo de 5 imágenes.</p>
                    <p>Elimina alguna imagen existente si deseas agregar nuevas.</p>
                  </div>
                )}
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