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
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import FormConfort from "./formConfort";

function ComponentConfort() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComfort, setCurrentComfort] = useState(null);
  const [comforts, setComforts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchComforts = async () => {
      setLoading(true);
      try {
        const data = await getComforts();
        setComforts(data);
        setError(null);
      } catch (error) {
        console.error("Error al obtener las comodidades:", error);
        setError(error.message || "Error al cargar comodidades");
        toast.error("Error al cargar comodidades");
      } finally {
        setLoading(false);
      }
    };
    fetchComforts();
  }, []);

  const filtrarDatos = comforts.filter((comfort) =>
    comfort.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetear página al buscar
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

  const handleEdit = (idComfort) => {
    const comfortToEdit = comforts.find(
      (comfort) => comfort.idComfort === idComfort
    );
    setCurrentComfort(comfortToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = async (idComfort) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta comodidad?")) {
      try {
        await deleteComfort(idComfort);
        setComforts(
          comforts.filter((comfort) => comfort.idComfort !== idComfort)
        );
        toast.success("Comodidad eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar la comodidad:", error);
        toast.error("Error al eliminar la comodidad");
      }
    }
  };

  const handleSave = async (data) => {
    try {
      if (data.idComfort) {
        await updateComfort(data.idComfort, data);
        setComforts((prev) =>
          prev.map((item) => (item.idComfort === data.idComfort ? data : item))
        );
        toast.success("Comodidad actualizada correctamente");
      } else {
        const newComfort = await createComfort(data);
        setComforts((prev) => [...prev, newComfort]);
        toast.success("Comodidad creada correctamente");
      }
      setIsModalOpen(false);
      return null;
    } catch (error) {
      console.log("Error completo recibido:", JSON.stringify(error, null, 2));

      if (error.errors && Array.isArray(error.errors)) {
        const formattedErrors = {};
        error.errors.forEach((err) => {
          if (err.path && err.msg) {
            formattedErrors[err.path] = err.msg;
          }
        });
        if (Object.keys(formattedErrors).length > 0) {
          return formattedErrors;
        }
      }
      toast.error("Error al guardar la comodidad");
      return { general: "Error al procesar la solicitud" };
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
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>
              <FaTimes />
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
                      No se encontraron comodidades
                    </td>
                  </tr>
                ) : (
                  currentItems.map((comfort) => (
                    <tr key={comfort.idComfort} className="comfort-table-row">
                      <td>{comfort.idComfort}</td>
                      <td>{comfort.name}</td>
                      <td className="actions-cell">
                        <ActionButtons
                          onEdit={() => handleEdit(comfort.idComfort)}
                          onDelete={() => handleDelete(comfort.idComfort)}
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
