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
import { getComforts } from "../../../services/ComfortService";

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
  const [imageFiles, setImageFiles] = useState(Array(5).fill(null));
  const [imagePreviews, setImagePreviews] = useState(Array(5).fill(null));
  const [errors, setErrors] = useState({});
  const fileInputRefs = useRef([]);

  // Estados para Comodidades
  const [allComforts, setAllComforts] = useState([]);
  const [selectedComforts, setSelectedComforts] = useState([]);

  // Efectos
  useEffect(() => {
    if (!isOpen) return;

    resetForm();
    fetchComforts();

    if (bedroomToEdit) {
      loadBedroomData(bedroomToEdit);
    }
  }, [isOpen, bedroomToEdit]);

  // Carga de Datos
  const fetchComforts = async () => {
    try {
      const comfortsData = await getComforts();
      setAllComforts(comfortsData || []);
    } catch (error) {
      console.error("Error al cargar todas las comodidades:", error);
      setAllComforts([]);
    }
  };

  const loadBedroomData = (bedroom) => {
    setFormData({
      name: bedroom.name || "",
      description: bedroom.description || "",
      capacity: bedroom.capacity || "",
      status: bedroom.status || "En Servicio",
    });
    loadExistingImages(bedroom.idRoom);
    if (bedroom.Comforts && Array.isArray(bedroom.Comforts)) {
      setSelectedComforts(bedroom.Comforts.map((c) => c.idComfort));
    } else {
      setSelectedComforts([]);
    }
  };

  const loadExistingImages = async (bedroomId) => {
    try {
      const images = await getBedroomImages(bedroomId);
      setExistingImages(images);
    } catch (error) {
      console.error("Error al cargar imágenes existentes:", error);
    }
  };

  // Reset y Validación
  const resetForm = () => {
    setFormData(initialFormData);
    setImageFiles(Array(5).fill(null));
    setImagePreviews(Array(5).fill(null));
    setExistingImages([]);
    setSelectedComforts([]);
    setErrors({});
    fileInputRefs.current.forEach((input) => {
      if (input) input.value = "";
    });
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "El nombre es obligatorio";
        break;
      case "description":
        if (!value.trim()) error = "La descripción es requerida";
        else if (value.trim().length >= 250)
          error = "La descripción no debe exceder los 250 caracteres";
        break;
      case "capacity":
        if (!value) error = "La capacidad es obligatoria";
        else if (isNaN(value)) error = "Debe ser un número válido";
        else {
          const numValue = parseInt(value);
          if (numValue !== 1 && numValue !== 2) {
            error = "La capacidad debe ser 1 o 2";
          }
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Manejadores de Formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleComfortChange = (comfortId) => {
    setSelectedComforts((prevSelected) =>
      prevSelected.includes(comfortId)
        ? prevSelected.filter((id) => id !== comfortId)
        : [...prevSelected, comfortId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formIsValid = true;
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        formIsValid = false;
      }
    });

    if (existingImages.length === 0 && !imageFiles.some(Boolean)) {
      newErrors.images = "Debes subir al menos una imagen";
      formIsValid = false;
    }

    setErrors(newErrors);

    if (!formIsValid) return;

    const dataToSubmit = {
      ...formData,
      capacity: Number(formData.capacity),
      comforts: selectedComforts,
    };

    try {
      let bedroomId;
      if (bedroomToEdit) {
        await updateBedroom(bedroomToEdit.idRoom, dataToSubmit);
        bedroomId = bedroomToEdit.idRoom;
      } else {
        const newBedroom = await createBedroom(dataToSubmit);
        bedroomId = newBedroom.idRoom;
      }

      await uploadNewImages(bedroomId);
      onSuccess();
    } catch (error) {
      console.error("Error al guardar la habitación:", error);
      if (error && error.errors && Array.isArray(error.errors)) {
        const backendErrors = {};
        error.errors.forEach((err) => {
          backendErrors[err.path || "general"] = err.msg;
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      } else if (error && error.message) {
        setErrors((prev) => ({ ...prev, general: error.message }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Ocurrió un error inesperado.",
        }));
      }
    }
  };

  const uploadNewImages = async (bedroomId) => {
    const filesToUpload = imageFiles.filter(Boolean);
    if (filesToUpload.length > 0) {
      try {
        await uploadBedroomImages(bedroomId, filesToUpload);
      } catch (uploadError) {
        console.error("Error al subir nuevas imágenes:", uploadError);
        setErrors((prev) => ({
          ...prev,
          images:
            "Error al subir nuevas imágenes. La habitación se guardó, pero las imágenes no.",
        }));
      }
    }
  };

  const onSuccess = () => {
    resetForm();
    onSave();
    onClose();
  };

  // Manejadores de Imágenes
  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedFiles = [...imageFiles];
      updatedFiles[index] = file;
      setImageFiles(updatedFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPreviews = [...imagePreviews];
        updatedPreviews[index] = reader.result;
        setImagePreviews(updatedPreviews);
      };
      reader.readAsDataURL(file);
      if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
    }
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
      console.error("Error al eliminar imagen existente:", error);
      alert("Error al eliminar la imagen.");
    }
  };

  const handleSetPrimary = async (imageId) => {
    if (!bedroomToEdit || !bedroomToEdit.idRoom) return;
    try {
      await setPrimaryBedroomImage(bedroomToEdit.idRoom, imageId);
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.idRoomImage === imageId }))
      );
    } catch (error) {
      console.error("Error al establecer imagen principal:", error);
      alert("Error al establecer la imagen como principal.");
    }
  };

  // Cálculos Derivados
  const availableSlotsForNewImages = Math.max(0, 5 - existingImages.length);

  if (!isOpen) return null;

  return (
    <dialog
      open={isOpen}
      className="modal-overlay-room-admin"
      aria-modal="true"
      onClose={onClose}
    >
      <article className="modal-container-bedroom-admin">
        <header className="modal-header-bedroom-admin">
          <h2>
            {bedroomToEdit ? "Editar Habitación" : "Agregar Nueva Habitación"}
          </h2>
          <button
            type="button"
            className="close-button-bedroom-admin"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <MdClose size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="bedroom-form-admin" noValidate>
          <div className="form-content-bedroom-admin">
            {/* Columna Izquierda: Datos de la Habitación */}
            <fieldset className="form-inputs-bedroom-admin">
              <legend className="visually-hidden-admin">
                Datos de la Habitación
              </legend>
              <div className="form-group-admin">
                <label htmlFor="bedroom-name" className="form-label-admin">
                  Nombre de la habitación
                </label>
                <input
                  id="bedroom-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`form-input-bedroom-admin ${
                    errors.name ? "input-error-admin" : ""
                  }`}
                />
                {errors.name && (
                  <span className="error-message-admin">{errors.name}</span>
                )}
              </div>

              <div className="form-group-bedroom-admin">
                <label
                  htmlFor="bedroom-description"
                  className="form-label-admin"
                >
                  Descripción
                </label>
                <textarea
                  id="bedroom-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={`form-input-bedroom-admin ${
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

              <div className="form-group-bedroom-admin">
                <label htmlFor="bedroom-capacity" className="form-label-admin">
                  Capacidad
                </label>
                <input
                  id="bedroom-capacity"
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  min="1"
                  max="2"
                  className={`form-input-bedroom-admin ${
                    errors.capacity ? "input-error-admin" : ""
                  }`}
                />
                {errors.capacity && (
                  <span className="error-message-admin">{errors.capacity}</span>
                )}
              </div>

              <div className="form-group-bedroom-admin">
                <label htmlFor="bedroom-status" className="form-label-admin">
                  Estado
                </label>
                <select
                  id="bedroom-status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`form-input-bedroom-admin ${
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

            <div className="form-column-right-bedroom-admin">
              <fieldset className="comforts-section-bedroom-admin">
                <legend className="form-label-admin">Comodidades</legend>
                {errors.comforts && (
                  <span className="error-message-admin">{errors.comforts}</span>
                )}
                {allComforts.length > 0 ? (
                  <div className="comforts-checkbox-group-admin">
                    {allComforts.map((comfort) => (
                      <div
                        key={comfort.idComfort}
                        className="comfort-checkbox-item-admin"
                      >
                        <input
                          type="checkbox"
                          id={`comfort-${comfort.idComfort}`}
                          value={comfort.idComfort}
                          checked={selectedComforts.includes(comfort.idComfort)}
                          onChange={() =>
                            handleComfortChange(comfort.idComfort)
                          }
                          className="comfort-checkbox-admin"
                        />
                        <label
                          htmlFor={`comfort-${comfort.idComfort}`}
                          className="comfort-label-admin"
                        >
                          {comfort.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-comforts-message-admin">
                    Cargando comodidades o no hay disponibles...
                  </p>
                )}
              </fieldset>

              <fieldset className="image-upload-section-bedroom-admin">
                <legend className="form-label-bedroom-admin">
                  Imágenes (máx. 5) {/* Título único y simple */}
                </legend>
                {errors.images && (
                  <span className="error-message-admin image-error-admin">
                    {errors.images}
                  </span>
                )}

                <div className="upload-images-grid-admin">
                  {/* Siempre un loop de 5 para representar los 5 slots visuales */}
                  {Array(5)
                    .fill(null)
                    .map((_, slotIndex) => {
                      // slotIndex va de 0 a 4

                      // Prioridad 1: Mostrar una imagen EXISTENTE si corresponde a este slot
                      // y no hay una NUEVA imagen seleccionada para este mismo slot.
                      const existingImageForThisSlot =
                        bedroomToEdit &&
                        slotIndex < existingImages.length && // Solo si el slot está dentro del rango de imágenes existentes
                        !imagePreviews[slotIndex] // Y no hay una nueva preview para este slot
                          ? existingImages[slotIndex]
                          : null;

                      // Prioridad 2: Mostrar una VISTA PREVIA DE IMAGEN NUEVA si existe para este slot
                      const newImagePreviewForThisSlot =
                        imagePreviews[slotIndex];

                      if (newImagePreviewForThisSlot) {
                        // CASO A: Hay una nueva imagen seleccionada (o reemplazando una existente)
                        return (
                          <div
                            key={`slot-new-preview-${slotIndex}`}
                            className="image-upload-field-bedroom-admin"
                          >
                            <figure className="image-preview-wrapper-bedroom-admin">
                              <img
                                src={newImagePreviewForThisSlot}
                                alt={`Vista previa ${slotIndex + 1}`}
                                className="preview-image-bedroom-admin"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(slotIndex)} // Usa tu handleRemoveImage actual
                                className="image-action-btn-admin delete-btn-bedroom-admin"
                                aria-label="Quitar imagen seleccionada"
                              >
                                <MdDelete />
                              </button>
                            </figure>
                          </div>
                        );
                      } else if (existingImageForThisSlot) {
                        // CASO B: Hay una imagen existente y no hay una nueva preview para este slot
                        return (
                          <div
                            key={`slot-existing-${existingImageForThisSlot.idRoomImage}`}
                            className="image-upload-field-bedroom-admin"
                          >
                            <figure className="image-preview-wrapper-bedroom-admin">
                              <img
                                src={`http://localhost:3000/uploads/${existingImageForThisSlot.imagePath}`}
                                alt={`Habitación ${formData.name || "imagen"} ${
                                  slotIndex + 1
                                }`}
                                className="preview-image-bedroom-admin"
                              />
                              <figcaption className="visually-hidden-admin">
                                Imagen de la habitación {slotIndex + 1}
                              </figcaption>
                              <div className="image-actions-bedroom-admin">
                                <button
                                  type="button"
                                  // Al borrar una existente, también debe limpiar el preview y file de ese slot
                                  onClick={() => {
                                    handleRemoveExistingImage(
                                      existingImageForThisSlot.idRoomImage
                                    );
                                    // Adicionalmente, si quieres que se convierta en un slot de carga:
                                    handleRemoveImage(slotIndex); // Esto limpiará imageFiles[slotIndex] e imagePreviews[slotIndex]
                                  }}
                                  className="image-action-btn-admin delete-btn-bedroom-admin"
                                  aria-label="Eliminar imagen existente"
                                >
                                  <MdDelete />
                                </button>
                                {bedroomToEdit && ( // Esta condición ya la tenías, es correcta
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSetPrimary(
                                        existingImageForThisSlot.idRoomImage
                                      )
                                    }
                                    className={`image-action-btn-admin star-btn-admin ${
                                      existingImageForThisSlot.isPrimary
                                        ? "primary-admin"
                                        : ""
                                    }`}
                                    aria-label={
                                      existingImageForThisSlot.isPrimary
                                        ? "Imagen principal"
                                        : "Establecer como principal"
                                    }
                                    disabled={
                                      existingImageForThisSlot.isPrimary
                                    }
                                  >
                                    {existingImageForThisSlot.isPrimary ? (
                                      <MdStar />
                                    ) : (
                                      <MdStarBorder />
                                    )}
                                  </button>
                                )}
                              </div>
                            </figure>
                            {existingImageForThisSlot.isPrimary && (
                              <span className="primary-label-admin">
                                Principal
                              </span>
                            )}
                          </div>
                        );
                      } else {
                        // CASO C: Slot vacío, mostrar placeholder para cargar imagen
                        // Esto solo ocurrirá si no hay existente Y no hay nueva preview para este slotIndex
                        // Y si el número total de imágenes (existentes no borradas + nuevas seleccionadas) es menor que 5.
                        const currentTotalImages =
                          existingImages.length +
                          imageFiles.filter(Boolean).length;
                        if (
                          currentTotalImages < 5 ||
                          (bedroomToEdit &&
                            slotIndex >= existingImages.length) ||
                          !bedroomToEdit
                        ) {
                          // ^^^ Esta condición asegura que solo mostramos el uploader si realmente hay un slot disponible ^^^
                          // o si estamos en un slot que va después de las imágenes existentes.
                          // En modo "agregar", siempre se mostrarán los 5.
                          // En modo "editar", si tienes 2 existentes y 0 nuevas, slotIndex 0 y 1 mostrarán existentes,
                          // slotIndex 2, 3, 4 mostrarán el uploader.
                          // Si tienes 2 existentes y seleccionas 3 nuevas, todos los slots estarán ocupados por previews o existentes.

                          // Corrección: El slot de carga debería aparecer si el slotIndex es >= que el número de imágenes
                          // existentes (que no tienen una preview nueva) y menor que 5.
                          // O si estamos en modo crear.
                          let showUploader = false;
                          if (!bedroomToEdit) {
                            showUploader = true;
                          } else {
                            // En modo editar, un slot es para uploader si:
                            // 1. No hay imagen existente para este slot Y no hay preview nueva. (Esto ya lo maneja la lógica de arriba)
                            // 2. O si el slotIndex es >= al número de imágenes existentes efectivas.
                            //    (imágenes existentes que no tienen una preview de reemplazo)
                            const effectiveExistingCount =
                              existingImages.filter(
                                (img, idx) => !imagePreviews[idx]
                              ).length;
                            if (slotIndex >= effectiveExistingCount) {
                              showUploader = true;
                            }
                          }
                          // Y además, el número total de imágenes (nuevas seleccionadas + existentes no reemplazadas) no debe ser 5 aun.
                          const newFilesCount =
                            imageFiles.filter(Boolean).length;
                          const existingNotReplacedCount =
                            existingImages.filter(
                              (img, i) => !imagePreviews[i]
                            ).length;

                          if (
                            newFilesCount + existingNotReplacedCount < 5 &&
                            showUploader
                          ) {
                            return (
                              <div
                                key={`slot-empty-${slotIndex}`}
                                className="image-upload-field-bedroom-admin"
                              >
                                <div className="upload-single-container-bedroom-admin">
                                  <input
                                    type="file"
                                    ref={(el) =>
                                      (fileInputRefs.current[slotIndex] = el)
                                    }
                                    onChange={(e) =>
                                      handleImageChange(slotIndex, e)
                                    } // handleImageChange usa slotIndex
                                    accept="image/*"
                                    className="file-input-bedroom-admin"
                                    id={`bedroom-image-upload-${slotIndex}`}
                                    aria-labelledby={`bedroom-image-label-${slotIndex}`}
                                  />
                                  <label
                                    id={`bedroom-image-label-${slotIndex}`}
                                    htmlFor={`bedroom-image-upload-${slotIndex}`}
                                    className="upload-single-label-bedroom-admin"
                                  >
                                    <MdImage size={24} />
                                    <span>Imagen {slotIndex + 1}</span>
                                  </label>
                                </div>
                              </div>
                            );
                          } else {
                            // Si se alcanzó el límite y este slot no tiene ni existente ni preview, no mostrar nada.
                            // O podrías mostrar un slot "deshabilitado" visualmente. Por ahora, null.
                            return null;
                          }
                        }
                      }
                    })}
                </div>

                {/* Mensaje de límite alcanzado (basado en conteo total) */}
                {existingImages.filter((img, i) => !imagePreviews[i]).length +
                  imageFiles.filter(Boolean).length >=
                  5 && (
                  <div
                    className="max-images-message-bedroom-admin"
                    role="alert"
                  >
                    <p>Límite máximo de 5 imágenes alcanzado.</p>
                  </div>
                )}
              </fieldset>
            </div>
          </div>

          {errors.general && (
            <div className="error-message-admin general-error-admin">
              {errors.general}
            </div>
          )}

          <footer className="modal-footer-bedroom-admin">
            <button
              type="button"
              className="cancel-btn-bedroom-admin"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="submit-btn-bedroom-admin">
              {bedroomToEdit ? "Actualizar Habitación" : "Guardar Habitación"}
            </button>
          </footer>
        </form>
      </article>
    </dialog>
  );
};

export default FormBedrooms;
