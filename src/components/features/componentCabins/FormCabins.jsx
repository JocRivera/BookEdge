
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
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
import { getComforts } from "../../../services/ComfortService";

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
  const [imageFiles, setImageFiles] = useState(Array(5).fill(null));
  const [imagePreviews, setImagePreviews] = useState(Array(5).fill(null));
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({}); // Para validación interactiva
  const fileInputRefs = useRef([]);

  // Estados para Comodidades
  const [allComforts, setAllComforts] = useState([]);
  const [selectedComforts, setSelectedComforts] = useState([]);

  // Efectos
  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    fetchComforts();
    if (cabinToEdit) {
      loadCabinData(cabinToEdit);
    }
  }, [isOpen, cabinToEdit]);

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

  const loadCabinData = (cabin) => {
    setFormData({
      name: cabin.name || "",
      description: cabin.description || "",
      capacity: cabin.capacity || "",
      status: cabin.status || "En Servicio",
    });
    loadExistingImages(cabin.idCabin);
    if (cabin.Comforts && Array.isArray(cabin.Comforts)) {
      setSelectedComforts(cabin.Comforts.map((c) => c.idComfort));
    } else {
      setSelectedComforts([]);
    }
  };

  const loadExistingImages = async (cabinId) => {
    try {
      const images = await getCabinImages(cabinId);
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
    setTouchedFields({}); // Limpiar campos tocados
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
          if (numValue < 3 || numValue > 8) {
            error = "La capacidad debe ser entre 3 y 8 personas";
          }
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Manejadores de Formulario Mejorados
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar el error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
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

    if (!formIsValid) {
      toast.error("Por favor, corrija los errores del formulario.");
      return;
    }

    const dataToSubmit = {
      ...formData,
      capacity: Number(formData.capacity),
      comforts: selectedComforts,
    };

    try {
      let cabinId;
      if (cabinToEdit) {
        await updateCabin(cabinToEdit.idCabin, dataToSubmit);
        cabinId = cabinToEdit.idCabin;
        toast.success(`Cabaña "${formData.name}" actualizada exitosamente.`);
      } else {
        const newCabin = await createCabin(dataToSubmit);
        cabinId = newCabin.idCabin;
        toast.success(`Cabaña "${formData.name}" creada exitosamente.`);
      }

      await uploadNewImages(cabinId);
      onSuccess();
    } catch (error) {
      console.error("Error al guardar la cabaña:", error);
      if (error.response && error.response.data && Array.isArray(error.response.data.errors)) {
        // Maneja errores de validación estructurados del backend
        const backendErrors = error.response.data.errors.reduce((acc, err) => {
          if (err.path) { // 'path' es el nombre del campo (ej: 'description')
            acc[err.path] = err.msg; // 'msg' es el mensaje de error
          }
          return acc;
        }, {});
        setErrors(backendErrors);
        toast.error("Por favor, revise los errores en el formulario.");
      } else {
        // Fallback para errores generales o inesperados
        const errorMessage =
          error.response?.data?.message || "Ocurrió un error inesperado.";
        toast.error(errorMessage);
        setErrors((prev) => ({ ...prev, general: errorMessage }));
      }
    }
  };

  const uploadNewImages = async (cabinId) => {
    const filesToUpload = imageFiles.filter(Boolean);
    if (filesToUpload.length > 0) {
      try {
        await uploadCabinImages(cabinId, filesToUpload);
      } catch (uploadError) {
        console.error("Error al subir nuevas imágenes:", uploadError);
        toast.error(
          "La cabaña se guardó, pero hubo un error al subir las imágenes."
        );
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
      await deleteCabinImage(imageId);
      toast.success("Imagen eliminada correctamente.");
      setExistingImages((prev) =>
        prev.filter((img) => img.idCabinImage !== imageId)
      );
    } catch (error) {
      console.error("Error al eliminar imagen existente:", error);
      toast.error("Error al eliminar la imagen.");
    }
  };

  const handleSetPrimary = async (imageId) => {
    if (!cabinToEdit || !cabinToEdit.idCabin) return;
    try {
      await setPrimaryImage(cabinToEdit.idCabin, imageId);
      toast.success("Imagen establecida como principal.");
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.idCabinImage === imageId }))
      );
    } catch (error) {
      console.error("Error al establecer imagen principal:", error);
      toast.error("Error al establecer la imagen como principal.");
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      open={isOpen}
      className="modal-overlay-room-admin"
      aria-modal="true"
      onClose={onClose}
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

        <form onSubmit={handleSubmit} className="cabin-form-admin" noValidate>
          <div className="form-content-cabin-admin">
            <fieldset className="form-inputs-cabin-admin">
              <legend className="visually-hidden-admin">
                Datos de la Cabaña
              </legend>
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
                  onBlur={handleInputBlur}
                  className={`form-input-cabin-admin ${
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
                  onBlur={handleInputBlur}
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
                  onBlur={handleInputBlur}
                  min="3"
                  max="8"
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
                  className="form-input-cabin-admin"
                >
                  <option value="En Servicio">En Servicio</option>
                  <option value="Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
              </div>
            </fieldset>

            <div className="form-column-right-cabin-admin">
              <fieldset className="comforts-section-cabin-admin">
                <legend className="form-label-admin">Comodidades</legend>
                {allComforts.length > 0 ? (
                  <div className="comforts-checkbox-group-admin">
                    {allComforts.map((comfort) => (
                      <div
                        key={comfort.idComfort}
                        className="comfort-checkbox-item-admin"
                      >
                        <input
                          type="checkbox"
                          id={`comfort-cabin-${comfort.idComfort}`}
                          value={comfort.idComfort}
                          checked={selectedComforts.includes(comfort.idComfort)}
                          onChange={() =>
                            handleComfortChange(comfort.idComfort)
                          }
                          className="comfort-checkbox-admin"
                        />
                        <label
                          htmlFor={`comfort-cabin-${comfort.idComfort}`}
                          className="comfort-label-admin"
                        >
                          {comfort.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-comforts-message-admin">
                    Cargando comodidades...
                  </p>
                )}
              </fieldset>

              <fieldset className="image-upload-section-cabin-admin">
                <legend className="form-label-cabin-admin">
                  Imágenes (máx. 5)
                </legend>
                {errors.images && (
                  <span className="error-message-admin image-error-admin">
                    {errors.images}
                  </span>
                )}
                <div className="upload-images-grid-admin">
                  {Array(5)
                    .fill(null)
                    .map((_, slotIndex) => {
                      const existingImage = existingImages[slotIndex];
                      const newImagePreview = imagePreviews[slotIndex];
                      if (newImagePreview) {
                        return (
                          <div
                            key={`slot-new-${slotIndex}`}
                            className="image-upload-field-cabin-admin"
                          >
                            <figure className="image-preview-wrapper-cabin-admin">
                              <img
                                src={newImagePreview}
                                alt={`Vista previa ${slotIndex + 1}`}
                                className="preview-image-cabin-admin"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(slotIndex)}
                                className="image-action-btn-admin delete-btn-cabin-admin"
                                aria-label="Quitar imagen"
                              >
                                <MdDelete />
                              </button>
                            </figure>
                          </div>
                        );
                      }
                      if (existingImage) {
                        return (
                          <div
                            key={`slot-existing-${existingImage.idCabinImage}`}
                            className="image-upload-field-cabin-admin"
                          >
                            <figure className="image-preview-wrapper-cabin-admin">
                              <img
                                src={`http://localhost:3000/uploads/${existingImage.imagePath}`}
                                alt={`Cabaña ${slotIndex + 1}`}
                                className="preview-image-cabin-admin"
                              />
                              <div className="image-actions-cabin-admin">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExistingImage(
                                      existingImage.idCabinImage
                                    )
                                  }
                                  className="image-action-btn-admin delete-btn-cabin-admin"
                                  aria-label="Eliminar imagen"
                                >
                                  <MdDelete />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSetPrimary(existingImage.idCabinImage)
                                  }
                                  className={`image-action-btn-admin star-btn-admin ${
                                    existingImage.isPrimary
                                      ? "primary-admin"
                                      : ""
                                  }`}
                                  aria-label={
                                    existingImage.isPrimary
                                      ? "Imagen principal"
                                      : "Hacer principal"
                                  }
                                  disabled={existingImage.isPrimary}
                                >
                                  {existingImage.isPrimary ? (
                                    <MdStar />
                                  ) : (
                                    <MdStarBorder />
                                  )}
                                </button>
                              </div>
                              {existingImage.isPrimary && (
                                <span className="primary-label-admin">
                                  Principal
                                </span>
                              )}
                            </figure>
                          </div>
                        );
                      }
                      if (
                        existingImages.length +
                          imageFiles.filter(Boolean).length <
                        5
                      ) {
                        return (
                          <div
                            key={`slot-empty-${slotIndex}`}
                            className="image-upload-field-cabin-admin"
                          >
                            <div className="upload-single-container-cabin-admin">
                              <input
                                type="file"
                                ref={(el) =>
                                  (fileInputRefs.current[slotIndex] = el)
                                }
                                onChange={(e) =>
                                  handleImageChange(slotIndex, e)
                                }
                                accept="image/*"
                                className="file-input-cabin-admin"
                                id={`cabin-image-upload-${slotIndex}`}
                                aria-labelledby={`cabin-image-label-${slotIndex}`}
                              />
                              <label
                                id={`cabin-image-label-${slotIndex}`}
                                htmlFor={`cabin-image-upload-${slotIndex}`}
                                className="upload-single-label-cabin-admin"
                              >
                                <MdImage size={24} />
                                <span>Imagen {slotIndex + 1}</span>
                              </label>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                </div>
              </fieldset>
            </div>
          </div>

          {errors.general && (
            <div className="error-message-admin general-error-admin">
              {errors.general}
            </div>
          )}

          <footer className="modal-footer-cabin-admin">
            <button
              type="button"
              className="cancel-btn-cabin-admin"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="submit-btn-cabin-admin">
              {cabinToEdit ? "Actualizar Cabaña" : "Guardar Cabaña"}
            </button>
          </footer>
        </form>
      </article>
    </dialog>
  );
};

export default FormCabins;