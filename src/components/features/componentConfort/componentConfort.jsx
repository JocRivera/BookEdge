import React, { useState, useEffect } from "react";
import { getComforts, createComfort, updateComfort, deleteComfort } from "../../../services/ComfortService";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import Pagination from "../../common/Paginator/Pagination";
import "./componentConfort.css";
import { toast } from "react-toastify"; // Importar Toastify
import "react-toastify/dist/ReactToastify.css"; // Importar estilos
import { CiSearch } from "react-icons/ci";
import FormConfort from "./formConfort";

function ComponentConfort() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComfort, setCurrentComfort] = useState(null);
  const [comforts, setComforts] = useState([]);

  useEffect(() => {
    const fetchComforts = async () => {
      try {
        const data = await getComforts();
        setComforts(data);
      } catch (error) {
        console.error("Error al obtener las comodidades:", error);
      }
    };
    fetchComforts();
  }, []);

  const filtrarDatos = comforts.filter((comfort) =>
    Object.values(comfort).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
    const comfortToEdit = comforts.find((comfort) => comfort.idComfort === idComfort);
    setCurrentComfort(comfortToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = async (idComfort) => {
    try {
      await deleteComfort(idComfort);
      setComforts(comforts.filter((comfort) => comfort.idComfort !== idComfort));
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
        setComforts((prev) => prev.map((item) => (item.idComfort === data.idComfort ? data : item)));
        toast.success("Comodidad Actualizada correctamente");

        
      } else {
        const newComfort = await createComfort(data);
        setComforts((prev) => [...prev, newComfort]);
        toast.success("Comodidad Creada correctamente");

      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar la comodidad:", error);
    }
  };

  return (
    <div className="comfort-table-container">
      <div className="comfort-title-container">
        <h2 className="comfort-table-title">Tabla de Comodidades</h2>
      </div>
      <div className="comfort-container-search">
        <CiSearch className="search-icon" />
        <input
          type="text"
          className="search"
          placeholder="Buscar comodidad..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CustomButton variant="primary" icon="add" onClick={handleAdd}>
          Agregar Comodidad
        </CustomButton>
      </div>
      <div className="comfort-table-wrapper">
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
                <tr
                  key={comfort.idComfort}
                  className="comfort-table-row"
                >
                  <td className="comfort-table-cell">{comfort.idComfort}</td>
                  <td className="comfort-table-cell">{comfort.name}</td>
                  <td className="comfort-table-cell">
                    <ActionButtons onEdit={() => handleEdit(comfort.idComfort)} onDelete={() => handleDelete(comfort.idComfort)} />
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

        <FormConfort
          isOpen={isModalOpen}
          comfortData={currentComfort}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

export default ComponentConfort;
