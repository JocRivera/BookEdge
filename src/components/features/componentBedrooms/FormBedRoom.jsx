
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
import { toast } from "react-toastify";
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
      let bedroomId;
      if (bedroomToEdit) {
        await updateBedroom(bedroomToEdit.idRoom, dataToSubmit);
        bedroomId = bedroomToEdit.idRoom;
        toast.success(`Habitación "${formData.name}" editada correctamente.`);
      } else {
        const newBedroom = await createBedroom(dataToSubmit);
        bedroomId = newBedroom.idRoom;
        toast.success(`Habitación "${formData.name}" creada correctamente.`);
      }

      await uploadNewImages(bedroomId);
      onSuccess();
    } catch (error) {
      console.error("Error al guardar la habitación:", error);
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

  const uploadNewImages = async (bedroomId) => {
    const filesToUpload = imageFiles.filter(Boolean);
    if (filesToUpload.length > 0) {
      try {
        await uploadBedroomImages(bedroomId, filesToUpload);
      } catch (uploadError) {
        console.error("Error al subir nuevas imágenes:", uploadError);
        toast.error(
          "La habitación se guardó, pero hubo un error al subir las imágenes."
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
      await deleteBedroomImage(imageId);
      toast.success("Imagen eliminada correctamente.");
      setExistingImages((prev) =>
        prev.filter((img) => img.idRoomImage !== imageId)
      );
    } catch (error) {
      console.error("Error al eliminar imagen existente:", error);
      toast.error("Error al eliminar la imagen.");
    }
  };

  const handleSetPrimary = async (imageId) => {
    if (!bedroomToEdit || !bedroomToEdit.idRoom) return;
    try {
      await setPrimaryBedroomImage(bedroomToEdit.idRoom, imageId);
      toast.success("Imagen establecida como principal.");
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.idRoomImage === imageId }))
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
                  className="form-input-bedroom-admin"
                >
                  <option value="En Servicio">En Servicio</option>
                  <option value="Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
              </div>
            </fieldset>

            <div className="form-column-right-bedroom-admin">
              <fieldset className="comforts-section-bedroom-admin">
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
                    Cargando comodidades...
                  </p>
                )}
              </fieldset>

              <fieldset className="image-upload-section-bedroom-admin">
                <legend className="form-label-bedroom-admin">
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
                            className="image-upload-field-bedroom-admin"
                          >
                            <figure className="image-preview-wrapper-bedroom-admin">
                              <img
                                src={newImagePreview}
                                alt={`Vista previa ${slotIndex + 1}`}
                                className="preview-image-bedroom-admin"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(slotIndex)}
                                className="image-action-btn-admin delete-btn-bedroom-admin"
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
                            key={`slot-existing-${existingImage.idRoomImage}`}
                            className="image-upload-field-bedroom-admin"
                          >
                            <figure className="image-preview-wrapper-bedroom-admin">
                              <img
                                src={`http://localhost:3000/uploads/${existingImage.imagePath}`}
                                alt={`Habitación ${slotIndex + 1}`}
                                className="preview-image-bedroom-admin"
                              />
                              <div className="image-actions-bedroom-admin">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExistingImage(
                                      existingImage.idRoomImage
                                    )
                                  }
                                  className="image-action-btn-admin delete-btn-bedroom-admin"
                                  aria-label="Eliminar imagen"
                                >
                                  <MdDelete />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSetPrimary(existingImage.idRoomImage)
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
                                }
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