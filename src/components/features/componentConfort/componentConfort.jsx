import React, { useState } from "react";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import Pagination from "../../common/Paginator/Pagination";
import "./componentConfort.css"
import { CiSearch } from "react-icons/ci";

function ComponentConfort() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentComfort, setCurrentComfort] = useState(null);
  const [comforts, setComforts] = useState([
    {
      id: 1,
      name: "Wifi",
      status: "Activo",
    },
    {
      id: 2,
      name: "Camas Doble",
      status: "Inactivo",
    },
  ]);

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
  };

  const handleEdit = (id) => {
    alert("Comodidad editada", id);
  };

  const handleDelete = (id) => {
    console.log("Comodidad Eliminada exitosamente", id);
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
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="comfort-table-body">
            {currentItems.map((comfort, index) => (
              <tr
                key={comfort.id}
                className={
                  index % 2 === 0
                    ? "comfort-table-row-even"
                    : "comfort-table-row-odd"
                }
              >
                <td className="comfort-table-cell">{comfort.id}</td>
                <td className="comfort-table-cell">{comfort.name}</td>
                <td className="comfort-table-cell">
                  <span
                    className={
                      comfort.status === "Activo"
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {comfort.status}
                  </span>
                </td>
                <td className="comfort-table-cell">
                  <ActionButtons
                    onEdit={() => handleEdit(comfort.id)}
                    onDelete={() => handleDelete(comfort.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
      </div>
    </div>
  );
}

export default ComponentConfort;
