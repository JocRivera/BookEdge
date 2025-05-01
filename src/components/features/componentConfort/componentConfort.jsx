import React, { useState, useEffect } from "react";
import {
  getComforts,
  createComfort,
  updateComfort,
  deleteComfort,
} from "../../../services/ComfortService";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import Pagination from "../../common/Paginator/Pagination";
import "./componentConfort.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiSearch } from "react-icons/ci";
import FormConfort from "./formConfort";

function ComponentConfort() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComfort, setCurrentComfort] = useState(null);
  const [comforts, setComforts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } finally {
        setLoading(false);
      }
    };
    fetchComforts();
  }, []);

  const filtrarDatos = comforts.filter((comfort) =>
    `${comfort.name} ${comfort.Comforts?.map((c) => c.name).join(" ") || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  //reiniciar al buscar ps
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(0);
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
    try {
      await deleteComfort(idComfort);
      setComforts(
        comforts.filter((comfort) => comfort.idComfort !== idComfort)
      );
      toast.success("Comodidad eliminada correctamente");
      console.log("Comodidad eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar la comodidad:", error);
    }
  };

  const handleSave = async (data) => {
    try {
      if (data.idComfort) {
        await updateComfort(data.idComfort, data);
        setComforts((prev) =>
          prev.map((item) => (item.idComfort === data.idComfort ? data : item))
        );
        toast.success("Comodidad Actualizada correctamente");
      } else {
        const newComfort = await createComfort(data);
        setComforts((prev) => [...prev, newComfort]);
        toast.success("Comodidad Creada correctamente");
      }
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
        return { name: "Ocurrió un error al guardar" };
      }
    }
  };

  
  return (
    <div className="comfort-table-container">
      <div className="comfort-title-container">
        <h2 className="comfort-table-title">Tabla de Comodidades</h2>
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
          <div className="error-message">{error}</div>
        ) : filtrarDatos.length === 0 ? (
          <div className="empty-state">
            {searchTerm
              ? `No se encontraron comodidades para "${searchTerm}"`
              : "No hay comodidades registradas"}
          </div>
        ) : (
          <>
            <table className="comfort-table">
              <thead className="comfort-table-header">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="comfort-table-body">
                {currentItems.length > 0 ? (
                  currentItems.map((comfort) => (
                    <tr key={comfort.idComfort} className="comfort-table-row">
                      <td className="comfort-table-cell">
                        {comfort.idComfort}
                      </td>
                      <td className="comfort-table-cell">{comfort.name}</td>
                      <td className="comfort-table-cell">
                        <ActionButtons
                          onEdit={() => handleEdit(comfort.idComfort)}
                          onDelete={() => handleDelete(comfort.idComfort)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-results">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
          </>
        )}
        <FormConfort
          isOpen={isModalOpen}
          comfortData={currentComfort}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onSave={async (data) => {
            const errors = await handleSave(data);
            if (errors) {
              return errors; // Esto se pasará al FormConfort como backendErrors
            }
            return null;
          }}
        />
      </div>
    </div>
  );
}

export default ComponentConfort;
