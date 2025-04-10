import { useEffect, useState } from "react";
import { getAllComfortsForCabins } from "../../../services/AssingComforts";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import AssignComfortsForm from "./FormAssign";
import "./AssignComforts.css";

const CabinComfortsCards = () => {
  const [groupedCabins, setGroupedCabins] = useState([]);
  const [isOpenModal, setModalOpen] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState(null); // <- NUEVO: cabaña seleccionada

  // Obtener datos
  const fetchData = async () => {
    try {
      const data = await getAllComfortsForCabins();

      const grouped = data.reduce((acc, item) => {
        const cabinId = item.Cabin.idCabin;

        if (!acc[cabinId]) {
          acc[cabinId] = {
            idCabin: cabinId,
            name: item.Cabin.name,
            description: item.description,
            dateEntry: item.dateEntry,
            comforts: [],
          };
        }

        acc[cabinId].comforts.push({
          idComfort: item.Comfort.idComfort,
          name: item.Comfort.name,
        });

        return acc;
      }, {});

      setGroupedCabins(Object.values(grouped));
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditAssign = (cabinId) => {
    const cabin = groupedCabins.find((c) => c.idCabin === cabinId);
    setSelectedCabin(cabin);
    setModalOpen(true);
  };

  const handleViewAssign = (cabinId) => {
    console.log("Ver asignaciones para cabaña:", cabinId);
  };

  const handleDeleteAssign = async (cabinId) => {
    console.log("Eliminar asignaciones para cabaña:", cabinId);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCabin(null); // Limpiar estado al cerrar
    fetchData(); // Refrescar datos después de crear/editar
  };

  return (
    <>
      <div className="cards-container-assing">
        <div className="title-container-assing">
          <h1 className="section-title">Cabañas y sus Comodidades</h1>
        </div>

        <div className="asign-search">
          <CustomButton
            variant="primary"
            icon="add"
            onClick={() => {
              setSelectedCabin(null); // <- Aseguramos que sea creación
              setModalOpen(true);
            }}
            text="Asignar Comodidades"
          />
        </div>

        <main className="card-list-assing">
          {groupedCabins.map((cabin) => (
            <div key={cabin.idCabin} className="cabin-card-assing">
              <h2 className="cabin-title-assing">{cabin.name}</h2>

              <div className="cabin-content">
                <p className="cabin-description-assing">{cabin.description}</p>

                <h3 className="comforts-title">Comodidades:</h3>
                {cabin.comforts.length > 0 ? (
                  <ul className="comforts-list">
                    {cabin.comforts.map((c) => (
                      <li key={c.idComfort}>{c.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="cabin-description-assing">Sin comodidades asignadas</p>
                )}

                <p className="modification-date">
                  Última modificación:{" "}
                  {new Date(cabin.dateEntry).toLocaleDateString()}
                </p>
              </div>

              <div className="assign-actions">
                <ActionButtons
                  onEdit={() => handleEditAssign(cabin.idCabin)}
                  onDelete={() => handleDeleteAssign(cabin.idCabin)}
                  onView={() => handleViewAssign(cabin.idCabin)}
                />
              </div>
            </div>
          ))}
        </main>
      </div>

      <AssignComfortsForm
        isOpen={isOpenModal}
        onClose={handleCloseModal}
        assignToEdit={selectedCabin} 
      />
    </>
  );
};

export default CabinComfortsCards;
