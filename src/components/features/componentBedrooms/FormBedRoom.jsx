import React, { useState, useRef, useEffect } from "react";
import {
  MdClose,
  MdImage,
  MdDelete,
  MdStar,
  MdStarBorder,
} from "react-icons/md";
import {
  createBedroom,
  updateBedroom,
  getBedroomImages,
  uploadBedroomImages,
  deleteBedroomImage,
  setPrimaryBedroomImage,
} from "../../../services/BedroomService";

const initialFormData = {
  name: "",
  description: "",
  capacity: "",
  status: "En Servicio",
};

const FormBedrooms = ({ isOpen, onClose, onSave, bedroomToEdit }) => {
  // Estados
  const [formData, setFormData] = useState(initialFormData);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState(Array(5).fill(null)); // Inicializar con 5 posiciones nulas
  const [imagePreviews, setImagePreviews] = useState(Array(5).fill(null)); // Inicializar con 5 posiciones nulas
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    capacity: "",
    status: "",
    images: ""
  });
  const fileInputRefs = useRef([]);

  // Efectos
  useEffect(() => {
    if (!isOpen) return;

    resetForm();

    if (bedroomToEdit) {
      loadBedroomData(bedroomToEdit);
    }
  }, [isOpen, bedroomToEdit]);

  // Funciones de carga de datos
  const loadBedroomData = (bedroom) => {
    setFormData({
      name: bedroom.name || "",
      description: bedroom.description || "",
      capacity: bedroom.capacity || "",
      status: bedroom.status || "En Servicio",
    });
    loadExistingImages(bedroom.idRoom);
  };

  const loadExistingImages = async (bedroomId) => {
    try {
      const images = await getBedroomImages(bedroomId);
      setExistingImages(images);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  };

  // Funciones de reset
  const resetForm = () => {
    setFormData(initialFormData);
    setImageFiles(Array(5).fill(null));
    setImagePreviews(Array(5).fill(null));
    setExistingImages([]);
    setErrors({});
  };

  // Manejadores de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error cuando el usuario corrige
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Limpiar errores previos

    try {
      const bedroomId = bedroomToEdit
        ? await updateBedroomData(bedroomToEdit.idRoom)
        : await createBedroomData();

      await uploadNewImages(bedroomId);
      onSuccess();
    } catch (error) {
      console.log("Error completo:", error); // Para depuración

      // Manejo específico para errores de validación
      if (error.errors) {
        const formattedErrors = {};
        error.errors.forEach((err) => {
          formattedErrors[err.path] = err.msg; // Ej: formattedErrors["name"] = "La habitación ya existe"
        });
        setErrors(formattedErrors);
      }
      // Manejo de otros tipos de errores
      else if (error.message) {
        console.error("Error:", error.message);
        alert(error.message);
      } else {
        console.error("Error inesperado:", error);
        alert("Ocurrió un error inesperado");
      }
    }
  };

  const updateBedroomData = async (id) => {
    await updateBedroom(id, formData);
    return id;
  };

  const createBedroomData = async () => {
    const newBedroom = await createBedroom(formData);
    return newBedroom.idRoom;
  };

  const uploadNewImages = async (bedroomId) => {
    const filesToUpload = imageFiles.filter(Boolean);
    if (filesToUpload.length > 0) {
      await uploadBedroomImages(bedroomId, filesToUpload);
    }
  };

  const onSuccess = () => {
    resetForm();
    onSave();
    onClose();
  };

  // Manejadores de imágenes
  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Actualizar el archivo en el índice específico
    const updatedFiles = [...imageFiles];
    updatedFiles[index] = file;
    setImageFiles(updatedFiles);

    // Crear la vista previa para ese índice específico
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedPreviews = [...imagePreviews];
      updatedPreviews[index] = reader.result;
      setImagePreviews(updatedPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = null;
      return newFiles;
    });

    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews[index] = null;
      return newPreviews;
    });

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
  };

  const handleRemoveExistingImage = async (imageId) => {
    if (!window.confirm("¿Estás seguro de querer eliminar esta imagen?"))
      return;

    try {
      await deleteBedroomImage(imageId);
      setExistingImages((prev) =>
        prev.filter((img) => img.idRoomImage !== imageId)
      );
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await setPrimaryBedroomImage(bedroomToEdit.idRoom, imageId);
      updatePrimaryImageState(imageId);
    } catch (error) {
      console.error("Error al establecer imagen principal:", error);
    }
  };

  const updatePrimaryImageState = (imageId) => {
    setExistingImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.idRoomImage === imageId,
      }))
    );
  };

  // Cálculos derivados
  const availableSlots = 5 - existingImages.length;
  const showNewImageFields = availableSlots > 0;
  const isMaxImagesReached = existingImages.length >= 5;

  if (!isOpen) return null;

  return (
    <dialog open={isOpen} className="modal-overlay-room" aria-modal="true">
      <article className="modal-container-bedroom">
        <header className="modal-header-bedroom">
          <h2>
            {bedroomToEdit ? "Editar Habitación" : "Agregar Nueva Habitación"}
          </h2>
          <button
            type="button"
            className="close-button-bedroom"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <MdClose size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="bedroom-form">
          <div className="form-content-bedroom">
            <fieldset className="form-inputs-bedroom">
              <div className="form-group-bedroom">
                <label htmlFor="bedroom-name" className="form-label">
                  Nombre de la habitación
                </label>
                <input
                  id="bedroom-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`form-input-bedroom ${errors.name ? "input-error" : ""}`}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group-bedroom">
                <label htmlFor="bedroom-description" className="form-label">
                  Descripción
                </label>
                <textarea
                  id="bedroom-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-input-bedroom ${errors.description ? "input-error" : ""}`}
                  rows="4"
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>

              <div className="form-group-bedroom">
                <label htmlFor="bedroom-capacity" className="form-label">
                  Capacidad
                </label>
                <input
                  id="bedroom-capacity"
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className={`form-input-bedroom ${errors.capacity ? "input-error" : ""}`}
                />
                {errors.capacity && (
                  <span className="error-message">{errors.capacity}</span>
                )}
              </div>

              <div className="form-group-bedroom">
                <label htmlFor="bedroom-status" className="form-label">
                  Estado
                </label>
                <select
                  id="bedroom-status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`form-input-bedroom ${errors.status ? "input-error" : ""}`}
                >
                  <option value="En Servicio">En Servicio</option>
                  <option value="Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
                {errors.status && (
                  <span className="error-message">{errors.status}</span>
                )}
              </div>
            </fieldset>

            <fieldset className="image-upload-section-bedroom">
              <legend className="form-label-bedroom">
                Imágenes de la habitación (máx. 5)
              </legend>
              
              {errors.images && (
                <span className="error-message image-error">{errors.images}</span>
              )}

              {existingImages.length > 0 && (
                <section className="existing-images-container-bedroom">
                  <h3>Imágenes guardadas ({existingImages.length}/5)</h3>
                  <ul
                    className="images-grid-bedroom"
                    aria-label="Imágenes existentes"
                  >
                    {existingImages.map((image) => (
                      <li
                        key={image.idRoomImage}
                        className="image-item-bedroom"
                      >
                        <figure className="image-preview-wrapper-bedroom">
                          <img
                            src={`http://localhost:3000/uploads/${image.imagePath}`}
                            alt={`Habitación ${formData.name}`}
                            className="preview-image-bedroom"
                          />
                          <figcaption className="visually-hidden">
                            Imagen de la habitación
                          </figcaption>
                          <div className="image-actions-bedroom">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveExistingImage(image.idRoomImage);
                              }}
                              className="image-action-btn delete-btn-bedroom"
                              aria-label="Eliminar imagen"
                            >
                              <MdDelete />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetPrimary(image.idRoomImage);
                              }}
                              className={`image-action-btn star-btn ${
                                image.isPrimary ? "primary" : ""
                              }`}
                              aria-label={
                                image.isPrimary
                                  ? "Imagen principal"
                                  : "Establecer como principal"
                              }
                              disabled={image.isPrimary}
                            >
                              {image.isPrimary ? <MdStar /> : <MdStarBorder />}
                            </button>
                          </div>
                        </figure>
                        {image.isPrimary && (
                          <span className="primary-label">Principal</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {showNewImageFields && (
                <section className="new-images-container-bedroom">
                  <h3>Agregar imágenes ({availableSlots} disponibles)</h3>
                  <div className="upload-images-grid">
                    {Array(availableSlots)
                      .fill()
                      .map((_, slotIndex) => {
                        const realIndex = slotIndex;

                        return (
                          <div
                            key={`new-${realIndex}`}
                            className="image-upload-field-bedroom"
                          >
                            {imagePreviews[realIndex] ? (
                              <figure className="image-preview-wrapper-bedroom">
                                <img
                                  src={imagePreviews[realIndex]}
                                  alt={`Vista previa imagen ${realIndex + 1}`}
                                  className="preview-image-bedroom"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(realIndex)}
                                  className="image-action-btn delete-btn-bedroom"
                                  aria-label="Quitar imagen"
                                >
                                  <MdDelete />
                                </button>
                              </figure>
                            ) : (
                              <div className="upload-single-container-bedroom">
                                <input
                                  type="file"
                                  ref={(el) =>
                                    (fileInputRefs.current[realIndex] = el)
                                  }
                                  onChange={(e) =>
                                    handleImageChange(realIndex, e)
                                  }
                                  accept="image/*"
                                  className="file-input-bedroom"
                                  id={`bedroom-image-upload-${realIndex}`}
                                  aria-labelledby={`bedroom-image-label-${realIndex}`}
                                />
                                <label
                                  id={`bedroom-image-label-${realIndex}`}
                                  htmlFor={`bedroom-image-upload-${realIndex}`}
                                  className="upload-single-label-bedroom"
                                >
                                  <MdImage size={24} />
                                  <span>
                                    Imagen{" "}
                                    {existingImages.length + slotIndex + 1}
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

              {isMaxImagesReached && (
                <div className="max-images-message-bedroom" role="alert">
                  <p>Ya has alcanzado el límite máximo de 5 imágenes.</p>
                  <p>
                    Elimina alguna imagen existente si deseas agregar nuevas.
                  </p>
                </div>
              )}
            </fieldset>
          </div>

          <footer className="modal-footer-bedroom">
            <button
              type="button"
              className="cancel-btn-bedroom"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="submit-btn-bedroom">
              Guardar Habitación
            </button>
          </footer>
        </form>
      </article>
    </dialog>
  );
};

export default FormBedrooms;