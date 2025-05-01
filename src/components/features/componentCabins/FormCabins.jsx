import React, { useState, useRef, useEffect } from "react";
import {
  MdClose,
  MdImage,
  MdDelete,
  MdStar,
  MdStarBorder,
} from "react-icons/md";
import {
  createCabin,
  updateCabin,
  getCabinImages,
  uploadCabinImages,
  deleteCabinImage,
  setPrimaryImage,
} from "../../../services/CabinService";

const initialFormData = {
  name: "",
  description: "",
  capacity: "",
  status: "En Servicio",
};

const FormCabins = ({ isOpen, onClose, onSave, cabinToEdit }) => {
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
    images: "",
  });
  const fileInputRefs = useRef([]);

  // Efectos
  useEffect(() => {
    if (!isOpen) return;

    resetForm();

    if (cabinToEdit) {
      loadCabinData(cabinToEdit);
    }
  }, [isOpen, cabinToEdit]);

  // Funciones de carga de datos
  const loadCabinData = (cabin) => {
    setFormData({
      name: cabin.name || "",
      description: cabin.description || "",
      capacity: cabin.capacity || "",
      status: cabin.status || "En Servicio",
    });
    loadExistingImages(cabin.idCabin);
  };

  const loadExistingImages = async (cabinId) => {
    try {
      const images = await getCabinImages(cabinId);
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
      const cabinId = cabinToEdit
        ? await updateCabinData(cabinToEdit.idCabin)
        : await createCabinData();

      await uploadNewImages(cabinId);
      onSuccess();
    } catch (error) {
      console.log("Error completo:", error); // Para depuración

      // Manejo específico para errores de validación
      if (error.errors) {
        const formattedErrors = {};
        error.errors.forEach((err) => {
          formattedErrors[err.path] = err.msg; // Ej: formattedErrors["name"] = "La cabaña ya existe"
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

  const updateCabinData = async (id) => {
    await updateCabin(id, formData);
    return id;
  };

  const createCabinData = async () => {
    const newCabin = await createCabin(formData);
    return newCabin.idCabin;
  };

  const uploadNewImages = async (cabinId) => {
    const filesToUpload = imageFiles.filter(Boolean);
    if (filesToUpload.length > 0) {
      await uploadCabinImages(cabinId, filesToUpload);
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
      await deleteCabinImage(imageId);
      setExistingImages((prev) =>
        prev.filter((img) => img.idCabinImage !== imageId)
      );
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await setPrimaryImage(cabinToEdit.idCabin, imageId);
      updatePrimaryImageState(imageId);
    } catch (error) {
      console.error("Error al establecer imagen principal:", error);
    }
  };

  const updatePrimaryImageState = (imageId) => {
    setExistingImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.idCabinImage === imageId,
      }))
    );
  };

  // Cálculos derivados
  const availableSlots = 5 - existingImages.length;
  const showNewImageFields = availableSlots > 0;
  const isMaxImagesReached = existingImages.length >= 5;

  if (!isOpen) return null;

  return (
    <dialog
      open={isOpen}
      className="modal-overlay-room-admin"
      aria-modal="true"
    >
      <article className="modal-container-cabin-admin">
        <header className="modal-header-cabin-admin">
          <h2>{cabinToEdit ? "Editar Cabaña" : "Agregar Nueva Cabaña"}</h2>
          <button
            type="button"
            className="close-button-cabin-admin"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <MdClose size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="cabin-form-admin">
          <div className="form-content-cabin-admin">
            <fieldset className="form-inputs-cabin-admin">
              <div className="form-group-admin">
                <label htmlFor="cabin-name" className="form-label-admin">
                  Nombre de la cabaña
                </label>
                <input
                  id="cabin-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`form-input-admin ${
                    errors.name ? "input-error-admin" : ""
                  }`}
                />
                {errors.name && (
                  <span className="error-message-admin">{errors.name}</span>
                )}
              </div>

              <div className="form-group-cabin-admin">
                <label htmlFor="cabin-description" className="form-label-admin">
                  Descripción
                </label>
                <textarea
                  id="cabin-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-input-cabin-admin ${
                    errors.description ? "input-error-admin" : ""
                  }`}
                  rows="4"
                />
                {errors.description && (
                  <span className="error-message-admin">
                    {errors.description}
                  </span>
                )}
              </div>

              <div className="form-group-cabin-admin">
                <label htmlFor="cabin-capacity" className="form-label-admin">
                  Capacidad
                </label>
                <input
                  id="cabin-capacity"
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className={`form-input-cabin-admin ${
                    errors.capacity ? "input-error-admin" : ""
                  }`}
                />
                {errors.capacity && (
                  <span className="error-message-admin">{errors.capacity}</span>
                )}
              </div>

              <div className="form-group-cabin-admin">
                <label htmlFor="cabin-status" className="form-label-admin">
                  Estado
                </label>
                <select
                  id="cabin-status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`form-input-cabin-admin ${
                    errors.status ? "input-error-admin" : ""
                  }`}
                >
                  <option value="En Servicio">En Servicio</option>
                  <option value="Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
                {errors.status && (
                  <span className="error-message-admin">{errors.status}</span>
                )}
              </div>
            </fieldset>

            <fieldset className="image-upload-section-cabin-admin">
              <legend className="form-label-cabin-admin">
                Imágenes de la cabaña (máx. 5)
              </legend>

              {errors.images && (
                <span className="error-message-admin image-error-admin">
                  {errors.images}
                </span>
              )}

              {existingImages.length > 0 && (
                <section className="existing-images-container-cabin-admin">
                  <h3>Imágenes guardadas ({existingImages.length}/5)</h3>
                  <ul
                    className="images-grid-cabin-admin"
                    aria-label="Imágenes existentes"
                  >
                    {existingImages.map((image) => (
                      <li
                        key={image.idCabinImage}
                        className="image-item-cabin-admin"
                      >
                        <figure className="image-preview-wrapper-cabin-admin">
                          <img
                            src={`http://localhost:3000/uploads/${image.imagePath}`}
                            alt={`Cabaña ${formData.name}`}
                            className="preview-image-cabin-admin"
                          />
                          <figcaption className="visually-hidden-admin">
                            Imagen de la cabaña
                          </figcaption>
                          <div className="image-actions-cabin-admin">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveExistingImage(image.idCabinImage);
                              }}
                              className="image-action-btn-admin delete-btn-cabin-admin"
                              aria-label="Eliminar imagen"
                            >
                              <MdDelete />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetPrimary(image.idCabinImage);
                              }}
                              className={`image-action-btn-admin star-btn-admin ${
                                image.isPrimary ? "primary-admin" : ""
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
                          <span className="primary-label-admin">Principal</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {showNewImageFields && (
                <section className="new-images-container-cabin-admin">
                  <h3>Agregar imágenes ({availableSlots} disponibles)</h3>
                  <div className="upload-images-grid-admin">
                    {Array(availableSlots)
                      .fill()
                      .map((_, slotIndex) => {
                        const realIndex = slotIndex;

                        return (
                          <div
                            key={`new-${realIndex}`}
                            className="image-upload-field-cabin-admin"
                          >
                            {imagePreviews[realIndex] ? (
                              <figure className="image-preview-wrapper-cabin-admin">
                                <img
                                  src={imagePreviews[realIndex]}
                                  alt={`Vista previa imagen ${realIndex + 1}`}
                                  className="preview-image-cabin-admin"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(realIndex)}
                                  className="image-action-btn-admin delete-btn-cabin-admin"
                                  aria-label="Quitar imagen"
                                >
                                  <MdDelete />
                                </button>
                              </figure>
                            ) : (
                              <div className="upload-single-container-cabin-admin">
                                <input
                                  type="file"
                                  ref={(el) =>
                                    (fileInputRefs.current[realIndex] = el)
                                  }
                                  onChange={(e) =>
                                    handleImageChange(realIndex, e)
                                  }
                                  accept="image/*"
                                  className="file-input-cabin-admin"
                                  id={`cabin-image-upload-${realIndex}`}
                                  aria-labelledby={`cabin-image-label-${realIndex}`}
                                />
                                <label
                                  id={`cabin-image-label-${realIndex}`}
                                  htmlFor={`cabin-image-upload-${realIndex}`}
                                  className="upload-single-label-cabin-admin"
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
                <div className="max-images-message-cabin-admin" role="alert">
                  <p>Ya has alcanzado el límite máximo de 5 imágenes.</p>
                  <p>
                    Elimina alguna imagen existente si deseas agregar nuevas.
                  </p>
                </div>
              )}
            </fieldset>
          </div>

          <footer className="modal-footer-cabin-admin">
            <button
              type="button"
              className="cancel-btn-cabin-admin"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="submit-btn-cabin-admin">
              Guardar Cabaña
            </button>
          </footer>
        </form>
      </article>
    </dialog>
  );
};

export default FormCabins;
