import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import Pagination from "../../common/Paginator/Pagination";
import "./AssignAmenities.css";
import { ActionButtons,CustomButton } from "../../common/Button/customButton";
import { getComfortAssignments } from "../../../services/CabinService";

function AssignAmenitiesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await getComfortAssignments();
        
        const groupedData = data.reduce((acc, assignment) => {
  const cabinId = assignment.idCabin;
  const comfortId = assignment.idComfort;
  
  if (!acc[cabinId]) {
    acc[cabinId] = {
      id: cabinId,
      cabinName: assignment.Cabin?.name || `Cabaña ${cabinId}`,
      dateEntry: assignment.dateEntry,
      description: assignment.description || "Sin descripción",
      comforts: []
    };
  }
  
  // Agregar comodidad incluso si no tiene los datos completos
  const comfortName = assignment.Comfort?.name || `Comodidad ${comfortId}`;
  acc[cabinId].comforts.push(comfortName);
  
  return acc;
}, {});
        
        setAssignments(Object.values(groupedData));
      } catch (error) {
        console.error("Error cargando asignaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, []);


  // Filtrar y paginar
  const filteredAssigns = assignments.filter(assign =>
    `${assign.cabinName} ${assign.comforts.join(" ")}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredAssigns.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const pageCount = Math.ceil(filteredAssigns.length / itemsPerPage);

  
  const handleDelete = (cabinId) => {
    console.log("Eliminar asignaciones de cabaña:", cabinId);
  };

  const handleEdit = (assignment) => {
    console.log("Editar:", assignment);
  };

  return (
    <section className="container-assign">
      <header className="header">
        <h1>Asignación de Comodidades</h1>
        <div className="search-bar">
          <CiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por cabaña o comodidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
         <CustomButton
          variant="primary"
          icon="add"
          
        >
          Agregar Cabaña
        </CustomButton>
      </header>

      <main className="assign-list">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : currentItems.length > 0 ? (
          currentItems.map((assign) => (
            <article key={assign.id} className="assign-card">
              <div className="card-header">
                <h2>{assign.cabinName}</h2>
                <span className="date">{assign.dateEntry}</span>
              </div>

              <p className="description">
                {assign.description || "Asignación de comodidades"}
              </p>

              <div className="comforts-section">
                <h3>Comodidades asignadas ({assign.comforts.length}):</h3>
                <div className="comforts-grid">
                  {assign.comforts.slice(0, 4).map((comfort, index) => (
                    <span key={index} className="comfort-badge">
                      {comfort}
                    </span>
                  ))}
                  {assign.comforts.length > 4 && (
                    <span className="more-badge">
                      +{assign.comforts.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <footer className="card-footer">
                <ActionButtons
                  onEdit={() => handleEdit(assign)}
                  onDelete={() => handleDelete(assign.id)}
                />
              </footer>
            </article>
          ))
        ) : (
          <div className="no-results">
            {searchTerm
              ? `No hay resultados para "${searchTerm}"`
              : "No hay asignaciones registradas"}
          </div>
        )}
      </main>

      {pageCount > 1 && (
        <Pagination
          pageCount={pageCount}
          onPageChange={({ selected }) => setCurrentPage(selected)}
        />
      )}
    </section>
  );
}

export default AssignAmenitiesTable;