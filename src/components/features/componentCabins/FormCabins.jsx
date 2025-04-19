import React, { useState, useRef, useEffect } from "react";
import {
  MdClose,
  MdImage,
  MdDelete,
  MdStar,
  MdStarBorder,
} from "react-icons/md";
import "./Cabincard.css";
import {
  createCabin,
  updateCabin,
  getCabinImages,
  uploadCabinImages,
  deleteCabinImage,
  setPrimaryImage,
} from "../../../services/CabinService";

const FormCabins = ({ isOpen, onClose, onSave, cabinToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    status: "En Servicio",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRefs = useRef([]);

  // Resetear todo el formulario
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      capacity: "",
      status: "En Servicio",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    fileInputRefs.current = [];
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (cabinToEdit) {
        setFormData({
          name: cabinToEdit.name,
          description: cabinToEdit.description,
          capacity: cabinToEdit.capacity,
          status: cabinToEdit.status,
        });

        // Cargar imágenes existentes
        loadExistingImages(cabinToEdit.idCabin);
      }
    }
  }, [isOpen, cabinToEdit]);

  const loadExistingImages = async (cabinId) => {
    try {
      const images = await getCabinImages(cabinId);
      setExistingImages(images);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newImageFiles = [...imageFiles];
    newImageFiles[index] = file;
    setImageFiles(newImageFiles);

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImagePreviews = [...imagePreviews];
      newImagePreviews[index] = reader.result;
      setImagePreviews(newImagePreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    const newImageFiles = [...imageFiles];
    newImageFiles.splice(index, 1);
    setImageFiles(newImageFiles);

    const newImagePreviews = [...imagePreviews];
    newImagePreviews.splice(index, 1);
    setImagePreviews(newImagePreviews);

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
  };

  const handleRemoveExistingImage = async (imageId) => {
    try {
      if (window.confirm("¿Estás seguro de querer eliminar esta imagen?")) {
        await deleteCabinImage(imageId);
        setExistingImages((prev) =>
          prev.filter((img) => img.idCabinImage !== imageId)
        );

        // Mostrar mensaje de éxito
        alert("Imagen eliminada correctamente");
      }
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      alert("Error al eliminar la imagen");
    }
  };
  const handleSetPrimary = async (imageId) => {
    try {
      await setPrimaryImage(cabinToEdit.idCabin, imageId);
      setExistingImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.idCabinImage === imageId,
        }))
      );
    } catch (error) {
      console.error("Error al establecer imagen principal:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validar que no se excedan 5 imágenes en total
      const totalImages = existingImages.length + imageFiles.length;
      if (totalImages > 5) {
        alert("No puedes tener más de 5 imágenes en total");
        return;
      }

      let cabinId;

      if (cabinToEdit) {
        await updateCabin(cabinToEdit.idCabin, formData);
        cabinId = cabinToEdit.idCabin;
      } else {
        const newCabin = await createCabin(formData);
        cabinId = newCabin.idCabin;
      }

      // Subir nuevas imágenes si hay
      if (imageFiles.length > 0) {
        await uploadCabinImages(cabinId, imageFiles);
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
      alert(`Error al ${cabinToEdit ? "editar" : "crear"}. Ver consola.`);
    }
  };

  if (!isOpen) return null;

  // Calcular cuántos campos de imagen nuevos mostrar
  const availableSlots = 5 - existingImages.length;
  const showNewImageFields = availableSlots > 0;

  return (
    <div className="modal-overlay">
      <div className="modal-container-cabin">
        <div className="modal-header">
          <h2>{cabinToEdit ? "Editar Cabaña" : "Agregar Nueva Cabaña"}</h2>
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
                  <option value="Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
              </div>
            </div>

            <div className="image-upload-section">
              <div className="form-group">
                <label className="form-label">
                  Imágenes de la cabaña (máx. 5)
                </label>

                {/* Imágenes existentes */}
                {existingImages.length > 0 && (
                  <div className="existing-images-container">
                    <h4>Imágenes guardadas ({existingImages.length}/5)</h4>
                    <div className="images-grid">
                      {existingImages.map((image) => (
                        <div key={image.idCabinImage} className="image-item">
                          <div className="image-preview-wrapper">
                            <img
                              src={`http://localhost:3000/uploads/${image.imagePath}`}
                              alt="Cabin"
                              className="preview-image"
                            />
                            <div className="image-actions">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveExistingImage(image.idCabinImage);
                                }}
                                className="image-action-btn delete-btn"
                                title="Eliminar imagen"
                                style={{ right: "35px" }} // Posicionamos a la izquierda de la estrella
                              >
                                <MdDelete />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetPrimary(image.idCabinImage);
                                }}
                                className={`image-action-btn star-btn ${
                                  image.isPrimary ? "primary" : ""
                                }`}
                                title={
                                  image.isPrimary
                                    ? "Imagen principal"
                                    : "Establecer como principal"
                                }
                                disabled={image.isPrimary}
                              >
                                {image.isPrimary ? (
                                  <MdStar />
                                ) : (
                                  <MdStarBorder />
                                )}
                              </button>
                            </div>
                          </div>
                          {image.isPrimary && (
                            <span className="primary-label">Principal</span>
                          )}
                        </div>
                      ))}{" "}
                    </div>
                  </div>
                )}

                {/* Campos para nuevas imágenes - solo mostramos si hay espacio disponible */}
                {showNewImageFields && (
                  <div className="new-images-container">
                    <h4>Agregar imágenes ({availableSlots} disponibles)</h4>
                    <div className="individual-image-uploads">
                      {[...Array(availableSlots)].map((_, index) => (
                        <div
                          key={`new-${index}`}
                          className="image-upload-field"
                        >
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
                                ref={(el) =>
                                  (fileInputRefs.current[index] = el)
                                }
                                onChange={(e) => handleImageChange(index, e)}
                                accept="image/*"
                                className="file-input"
                                id={`cabin-image-upload-${index}`}
                                style={{ display: "none" }}
                              />
                              <label
                                htmlFor={`cabin-image-upload-${index}`}
                                className="upload-single-label"
                              >
                                <MdImage size={24} />
                                <span>
                                  Imagen {existingImages.length + index + 1}
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensaje cuando ya hay 5 imágenes */}
                {existingImages.length >= 5 && (
                  <div className="max-images-message">
                    <p>Ya has alcanzado el límite máximo de 5 imágenes.</p>
                    <p>
                      Elimina alguna imagen existente si deseas agregar nuevas.
                    </p>
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
              Guardar Cabaña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormCabins;
