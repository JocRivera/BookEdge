// --- START OF FILE FormCabins.jsx ---
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
      setSelectedComforts(cabin.Comforts.map(c => c.idComfort));
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
    fileInputRefs.current.forEach(input => {
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
        else if (value.trim().length >= 250) error = "La descripción no debe exceder los 250 caracteres";
        break;
      case "capacity":
        if (!value) error = "La capacidad es obligatoria";
        else if (isNaN(value)) error = "Debe ser un número válido";
        else {
          const numValue = parseInt(value);
          if (numValue < 1) error = "La capacidad mínima es 1";
          // Puedes añadir una capacidad máxima si es necesario
        }
        break;
      // No se valida 'status' aquí ya que siempre tiene un valor por defecto
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

    // Opcional: Validar si se requiere al menos una comodidad
    // if (selectedComforts.length === 0) {
    //   newErrors.comforts = "Debe seleccionar al menos una comodidad";
    //   formIsValid = false;
    // }

    setErrors(newErrors);

    if (!formIsValid) return;

    const dataToSubmit = {
      ...formData,
      capacity: Number(formData.capacity), // Asegurar que capacidad sea número
      comforts: selectedComforts,
    };

    try {
      let cabinId;
      if (cabinToEdit) {
        await updateCabin(cabinToEdit.idCabin, dataToSubmit);
        cabinId = cabinToEdit.idCabin;
      } else {
        const newCabin = await createCabin(dataToSubmit);
        cabinId = newCabin.idCabin;
      }

      await uploadNewImages(cabinId);
      onSuccess();
    } catch (error) {
      console.error("Error al guardar la cabaña:", error);
      if (error && error.errors && Array.isArray(error.errors)) {
        const backendErrors = {};
        error.errors.forEach((err) => {
          backendErrors[err.path || 'general'] = err.msg;
        });
        setErrors(prev => ({ ...prev, ...backendErrors }));
      } else if (error && error.message) {
        setErrors(prev => ({ ...prev, general: error.message }));
      } else {
        setErrors(prev => ({ ...prev, general: "Ocurrió un error inesperado." }));
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
        // Podrías querer notificar al usuario aquí también
        setErrors(prev => ({ ...prev, images: "Error al subir nuevas imágenes. La cabaña se guardó, pero las imágenes no."}));
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
      if (errors.images) setErrors(prev => ({...prev, images: ""})); // Limpiar error de imágenes si se añade una
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
    if (!window.confirm("¿Estás seguro de querer eliminar esta imagen?")) return;
    try {
      await deleteCabinImage(imageId);
      setExistingImages((prev) => prev.filter((img) => img.idCabinImage !== imageId));
    } catch (error) {
      console.error("Error al eliminar imagen existente:", error);
      alert("Error al eliminar la imagen.");
    }
  };

  const handleSetPrimary = async (imageId) => {
    if (!cabinToEdit || !cabinToEdit.idCabin) return;
    try {
      await setPrimaryImage(cabinToEdit.idCabin, imageId);
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.idCabinImage === imageId }))
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
    <dialog open={isOpen} className="modal-overlay-room-admin" aria-modal="true" onClose={onClose}>
      <article className="modal-container-cabin-admin">
        <header className="modal-header-cabin-admin">
          <h2>{cabinToEdit ? "Editar Cabaña" : "Agregar Nueva Cabaña"}</h2>
          <button type="button" className="close-button-cabin-admin" onClick={onClose} aria-label="Cerrar modal">
            <MdClose size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="cabin-form-admin" noValidate>
          <div className="form-content-cabin-admin">
            {/* Columna Izquierda: Datos de la Cabaña */}
            <fieldset className="form-inputs-cabin-admin">
              <legend className="visually-hidden-admin">Datos de la Cabaña</legend>
              <div className="form-group-admin">
                <label htmlFor="cabin-name" className="form-label-admin">Nombre de la cabaña</label>
                <input id="cabin-name" type="text" name="name" value={formData.name} onChange={handleInputChange} onBlur={handleInputBlur} className={`form-input-cabin-admin ${errors.name ? "input-error-admin" : ""}`} />
                {errors.name && <span className="error-message-admin">{errors.name}</span>}
              </div>

              <div className="form-group-cabin-admin">
                <label htmlFor="cabin-description" className="form-label-admin">Descripción</label>
                <textarea id="cabin-description" name="description" value={formData.description} onChange={handleInputChange} onBlur={handleInputBlur} className={`form-input-cabin-admin ${errors.description ? "input-error-admin" : ""}`} rows="4" />
                {errors.description && <span className="error-message-admin">{errors.description}</span>}
              </div>

              <div className="form-group-cabin-admin">
                <label htmlFor="cabin-capacity" className="form-label-admin">Capacidad</label>
                <input id="cabin-capacity" type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} onBlur={handleInputBlur} min="1" className={`form-input-cabin-admin ${errors.capacity ? "input-error-admin" : ""}`} />
                {errors.capacity && <span className="error-message-admin">{errors.capacity}</span>}
              </div>

              <div className="form-group-cabin-admin">
                <label htmlFor="cabin-status" className="form-label-admin">Estado</label>
                <select id="cabin-status" name="status" value={formData.status} onChange={handleInputChange} className={`form-input-cabin-admin ${errors.status ? "input-error-admin" : ""}`}>
                  <option value="En Servicio">En Servicio</option>
                  <option value="Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
                {/* No suele haber error de 'status' si siempre tiene valor */}
              </div>
            </fieldset>

            {/* Columna Derecha: Comodidades e Imágenes */}
            <div className="form-column-right-cabin-admin">
              <fieldset className="comforts-section-cabin-admin">
                <legend className="form-label-admin">Comodidades</legend>
                {errors.comforts && <span className="error-message-admin">{errors.comforts}</span>}
                {allComforts.length > 0 ? (
                  <div className="comforts-checkbox-group-admin">
                    {allComforts.map((comfort) => (
                      <div key={comfort.idComfort} className="comfort-checkbox-item-admin">
                        <input
                          type="checkbox"
                          id={`comfort-${comfort.idComfort}`}
                          value={comfort.idComfort}
                          checked={selectedComforts.includes(comfort.idComfort)}
                          onChange={() => handleComfortChange(comfort.idComfort)}
                          className="comfort-checkbox-admin"
                        />
                        <label htmlFor={`comfort-${comfort.idComfort}`} className="comfort-label-admin">
                          {comfort.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-comforts-message-admin">Cargando comodidades o no hay disponibles...</p>
                )}
              </fieldset>

              <fieldset className="image-upload-section-cabin-admin">
                <legend className="form-label-cabin-admin">Imágenes (máx. 5)</legend>
                {errors.images && <span className="error-message-admin image-error-admin">{errors.images}</span>}

                {existingImages.length > 0 && (
                  <section className="existing-images-container-cabin-admin">
                    <h3>Imágenes guardadas ({existingImages.length}/5)</h3>
                    <ul className="images-grid-cabin-admin" aria-label="Imágenes existentes">
                      {existingImages.map((image) => (
                        <li key={image.idCabinImage} className="image-item-cabin-admin">
                          <figure className="image-preview-wrapper-cabin-admin">
                            <img src={`http://localhost:3000/uploads/${image.imagePath}`} alt={`Cabaña ${formData.name || 'imagen'}`} className="preview-image-cabin-admin" />
                            <figcaption className="visually-hidden-admin">Imagen de la cabaña</figcaption>
                            <div className="image-actions-cabin-admin">
                              <button type="button" onClick={() => handleRemoveExistingImage(image.idCabinImage)} className="image-action-btn-admin delete-btn-cabin-admin" aria-label="Eliminar imagen"><MdDelete /></button>
                              {cabinToEdit && ( // Solo mostrar opción de primaria si se está editando
                                <button type="button" onClick={() => handleSetPrimary(image.idCabinImage)} className={`image-action-btn-admin star-btn-admin ${image.isPrimary ? "primary-admin" : ""}`} aria-label={image.isPrimary ? "Imagen principal" : "Establecer como principal"} disabled={image.isPrimary}>
                                  {image.isPrimary ? <MdStar /> : <MdStarBorder />}
                                </button>
                              )}
                            </div>
                          </figure>
                          {image.isPrimary && <span className="primary-label-admin">Principal</span>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {availableSlotsForNewImages > 0 && (
                  <section className="new-images-container-cabin-admin">
                    <h3>Agregar nuevas imágenes ({availableSlotsForNewImages} disponibles)</h3>
                    <div className="upload-images-grid-admin">
                      {Array(availableSlotsForNewImages).fill(null).map((_, slotIndex) => (
                          <div key={`new-image-slot-${slotIndex}`} className="image-upload-field-cabin-admin">
                            {imagePreviews[slotIndex] ? (
                              <figure className="image-preview-wrapper-cabin-admin">
                                <img src={imagePreviews[slotIndex]} alt={`Vista previa ${slotIndex + 1}`} className="preview-image-cabin-admin" />
                                <button type="button" onClick={() => handleRemoveImage(slotIndex)} className="image-action-btn-admin delete-btn-cabin-admin" aria-label="Quitar imagen"><MdDelete /></button>
                              </figure>
                            ) : (
                              <div className="upload-single-container-cabin-admin">
                                <input type="file" ref={(el) => (fileInputRefs.current[slotIndex] = el)} onChange={(e) => handleImageChange(slotIndex, e)} accept="image/*" className="file-input-cabin-admin" id={`cabin-image-upload-${slotIndex}`} aria-labelledby={`cabin-image-label-${slotIndex}`} />
                                <label id={`cabin-image-label-${slotIndex}`} htmlFor={`cabin-image-upload-${slotIndex}`} className="upload-single-label-cabin-admin">
                                  <MdImage size={24} />
                                  <span>Imagen {existingImages.length + slotIndex + 1}</span>
                                </label>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

                {existingImages.length >= 5 && availableSlotsForNewImages === 0 && (
                  <div className="max-images-message-cabin-admin" role="alert">
                    <p>Límite máximo de 5 imágenes alcanzado.</p>
                  </div>
                )}
              </fieldset>
            </div>
          </div>

          {errors.general && <div className="error-message-admin general-error-admin">{errors.general}</div>}

          <footer className="modal-footer-cabin-admin">
            <button type="button" className="cancel-btn-cabin-admin" onClick={onClose}>Cancelar</button>
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
