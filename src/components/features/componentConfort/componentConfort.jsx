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
        const updatedComfort = await updateComfort(
          formData.idComfort,
          formData
        );

        // Asegurar que updatedComfort sea un objeto válido
        const comfortToUpdate =
          updatedComfort &&
          typeof updatedComfort === "object" &&
          !Array.isArray(updatedComfort)
            ? updatedComfort
            : formData;

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
        const newComfort = await createComfort(formData);

        // Asegurar que newComfort sea un objeto válido
        const comfortToAdd =
          newComfort &&
          typeof newComfort === "object" &&
          !Array.isArray(newComfort)
            ? newComfort
            : formData;

        setComforts((prev) => [comfortToAdd, ...prev]);
        toast.success(
          `Comodidad "${
            comfortToAdd.name || formData.name
          }" creada correctamente.`
        );
      }
      setIsModalOpen(false);
      return null;
    } catch (error) {
      console.error("Error al guardar la comodidad:", error);

      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const formattedErrors = {};
          let firstUserMessage = "Por favor, corrija los errores indicados.";
          errorData.errors.forEach((errItem, index) => {
            if (errItem.path) formattedErrors[errItem.path] = errItem.msg;
            if (index === 0 && errItem.msg) firstUserMessage = errItem.msg;
          });
          toast.error(firstUserMessage);
          return formattedErrors;
        } else if (errorData.message) {
          toast.error(errorData.message);
          return { general: errorData.message };
        }
      }
      const fallbackErrorMessage =
        error.message || "Error al guardar la comodidad";
      toast.error(fallbackErrorMessage);
      return { general: fallbackErrorMessage };
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
