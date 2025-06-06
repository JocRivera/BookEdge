// src/features/componentConfort/ComponentConfort.jsx

import React, { useState, useEffect } from "react";
import {
  getComforts,
  createComfort,
  updateComfort,
  deleteComfort,
} from "../../../services/ComfortService";
import { CustomButton, ActionButtons } from "../../common/Button/customButton";
import Pagination from "../../common/Paginator/Pagination";
import "./componentConfort.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiSearch } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";
import FormConfort from "./formConfort";
import { useAlert } from "../../../context/AlertContext";

function ComponentConfort() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComfort, setCurrentComfort] = useState(null);
  const [comforts, setComforts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchInitialError, setFetchInitialError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchComfortsAsync = async () => {
      setLoading(true);
      try {
        const data = await getComforts();
        setComforts(data);
        setFetchInitialError(null);
      } catch (error) {
        console.error("Error al obtener las comodidades:", error);
        const errorMessage = error.message || "Error al cargar comodidades";
        setFetchInitialError(errorMessage);
        toast.error(`Error al cargar datos: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    fetchComfortsAsync();
  }, []);

  const filtrarDatos = comforts.filter((comfort) =>
    comfort?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const itemsPerPage = 6;
  const offset = currentPage * itemsPerPage;
  const currentItems = filtrarDatos.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filtrarDatos.length / itemsPerPage);
  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const handleAdd = () => {
    setCurrentComfort(null);
    setIsModalOpen(true);
  };

  const handleEdit = (comfortToEdit) => {
    showAlert({
      type: "confirm-edit",
      title: "Confirmar Modificación",
      message: `¿Está seguro de que desea modificar la comodidad "${comfortToEdit.name}"?`,
      confirmText: "Sí, Modificar",
      onConfirm: () => {
        setCurrentComfort(comfortToEdit);
        setIsModalOpen(true);
      },
    });
  };

  const handleDelete = async (comfortToDelete) => {
    showAlert({
      type: "confirm-delete",
      title: "Confirmar Eliminación",
      message: `¿Está seguro de que desea eliminar la comodidad "${comfortToDelete.name}"? Esta acción no se puede deshacer.`,
      confirmText: "Sí, Eliminar",
      onConfirm: async () => {
        try {
          await deleteComfort(comfortToDelete.idComfort);
          setComforts((prevComforts) =>
            prevComforts.filter(
              (comfort) => comfort.idComfort !== comfortToDelete.idComfort
            )
          );
          toast.success(
            `Comodidad "${comfortToDelete.name}" eliminada correctamente.`
          );
        } catch (error) {
          console.error("Error al eliminar la comodidad:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error al eliminar la comodidad";
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleSave = async (formData) => {
    try {
      if (formData.idComfort) {
        // Editando
        const updatedComfortData = await updateComfort(
          formData.idComfort,
          formData
        );
        
        // El servicio updateComfort ahora devuelve el objeto comodidad actualizado o un objeto similar a la creación.
        // O si la API no devuelve el objeto completo, usamos formData como fallback para actualizar la UI.
        const comfortToUpdate = (updatedComfortData && typeof updatedComfortData === 'object' && !Array.isArray(updatedComfortData) && updatedComfortData.idComfort) 
                                ? updatedComfortData 
                                : { ...comforts.find(c => c.idComfort === formData.idComfort), ...formData };


        setComforts((prev) =>
          prev.map((item) =>
            item.idComfort === formData.idComfort ? comfortToUpdate : item
          )
        );

        toast.success(
          `Comodidad "${
            comfortToUpdate.name || formData.name
          }" actualizada correctamente.`
        );
      } else {
        // Creando
        const newComfortData = await createComfort(formData);
        
        // Asumimos que createComfort devuelve la nueva comodidad con su ID.
        // Si no, formData no tendrá el idComfort asignado por el backend.
        // Es importante que newComfortData sea el objeto retornado por el backend.
        const comfortToAdd = (newComfortData && typeof newComfortData === 'object' && !Array.isArray(newComfortData) && newComfortData.idComfort) 
                              ? newComfortData 
                              : { ...formData, idComfort: Date.now() }; // Fallback si la API no devuelve el objeto completo

        setComforts((prev) => [comfortToAdd, ...prev]);
        toast.success(
          `Comodidad "${
            comfortToAdd.name || formData.name
          }" creada correctamente.`
        );
      }
      setIsModalOpen(false);
      return null; // Indica éxito al formulario, para que cierre y resetee.
    } catch (caughtError) {
      console.error("Error al guardar la comodidad:", caughtError);

      // caughtError es lo que ComfortService arrojó.
      // Puede ser:
      // 1. El objeto de error del backend: { errors: [{ path: 'name', msg: '...' }] }
      // 2. Un objeto de error de Axios (si ComfortService lanzó `error` directamente)
      // 3. Un objeto { message: "..." } (si ComfortService lo construyó así)

      const formattedErrors = {};
      let generalErrorMessage = "Error al guardar la comodidad. Intente de nuevo.";

      if (caughtError && Array.isArray(caughtError.errors) && caughtError.errors.length > 0) {
        // Caso 1: Estructura { errors: [...] } del backend
        let firstUserMessage = null;
        caughtError.errors.forEach((errItem, index) => {
          if (errItem.path) {
            formattedErrors[errItem.path] = errItem.msg;
          }
          if (index === 0 && errItem.msg) {
            firstUserMessage = errItem.msg;
          }
        });
        generalErrorMessage = firstUserMessage || "Por favor, corrija los errores indicados.";
       
        return formattedErrors; // Ejemplo: { name: "Ya existe esta comodidad" }
      } else if (caughtError && caughtError.message) {
        // Caso 2 o 3: Error con una propiedad `message` (puede ser de Axios o construido)
        // O si el backend devuelve un error como { message: "...", detalle: "..." }
        generalErrorMessage = caughtError.message;
        if (caughtError.response && caughtError.response.data && caughtError.response.data.message) {
          // Si es un error de Axios y hay un mensaje específico en response.data.message
          generalErrorMessage = caughtError.response.data.message;
        }
  
        // Si el mensaje indica un error de campo específico (aunque no venga en `errors` array)
        // podrías intentar mapearlo si conoces el formato. Por ahora, lo tratamos como general.
        return { general: generalErrorMessage };
      }
      
 
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="comfort-table-container">
      <div className="comfort-title-container">
        <h2 className="comfort-table-title">Gestión de Comodidades</h2>
      </div>

      <div className="comfort-container-search">
        <div className="search-wrapper-comfort">
          <CiSearch className="comfort-search-icon" />
          <input
            type="text"
            className="comfort-search"
            placeholder="Buscar comodidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={handleClearSearch}
              aria-label="Limpiar búsqueda"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <CustomButton variant="primary" icon="add" onClick={handleAdd}>
          Agregar Comodidad
        </CustomButton>
      </div>

      <div className="comfort-table-wrapper">
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Cargando comodidades...</p>
          </div>
        ) : fetchInitialError && comforts.length === 0 ? (
          <div className="error-message">
            <p>{fetchInitialError}</p>
            <button
              onClick={() => window.location.reload()}
              className="comfort-cancel-btn"
              style={{ marginTop: "10px" }}
            >
              Recargar Página
            </button>
          </div>
        ) : (
          <>
            <table className="comfort-table">
              <thead>
                <tr className="comfort-table-header">
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="comfort-table-body">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="no-data-row">
                      {searchTerm
                        ? "No se encontraron comodidades con ese nombre."
                        : "No hay comodidades registradas."}
                    </td>
                  </tr>
                ) : (
                  currentItems.map((comfort) => (
                    <tr key={comfort.idComfort} className="comfort-table-row">
                      <td>{comfort.idComfort}</td>
                      <td>{comfort.name}</td>
                      <td className="actions-cell">
                        <ActionButtons
                          onEdit={() => handleEdit(comfort)}
                          onDelete={() => handleDelete(comfort)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {pageCount > 1 && (
              <div className="pagination-container">
                <Pagination
                  pageCount={pageCount}
                  onPageChange={handlePageClick}
                />
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <FormConfort
          isOpen={isModalOpen}
          comfortData={currentComfort}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ComponentConfort;
